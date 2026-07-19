import { type NextRequest, NextResponse } from "next/server"
import mammoth from "mammoth";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

const FREE_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const PREMIUM_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const REQUEST_OVERHEAD_BYTES = 1024 * 1024;
const MAX_CHAR_LIMIT = 20_000;
const OCR_POLL_INTERVAL_MS = 4_000;
const OCR_MAX_POLL_ATTEMPTS = 12;

class OcrExtractionError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function getMaximumFileSize(userId: string | null) {
  if (!userId) return FREE_MAX_FILE_SIZE_BYTES

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("users")
      .select("plan")
      .eq("id", userId)
      .single()

    if (error) throw error

    return data?.plan?.trim().toLowerCase() === "premium"
      ? PREMIUM_MAX_FILE_SIZE_BYTES
      : FREE_MAX_FILE_SIZE_BYTES
  } catch (error) {
    // A failed entitlement lookup must never grant a larger upload allowance.
    console.error("Unable to determine upload limit:", error)
    return FREE_MAX_FILE_SIZE_BYTES
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const maximumFileSize = await getMaximumFileSize(userId)
    const contentLength = Number(request.headers.get("content-length"))

    // Content-Length includes multipart boundaries, so allow a small envelope;
    // the exact File.size check below remains the final authority.
    if (Number.isFinite(contentLength) && contentLength > maximumFileSize + REQUEST_OVERHEAD_BYTES) {
      return NextResponse.json(
        { error: `File is too large. Maximum allowed size is ${maximumFileSize / 1024 / 1024} MB.` },
        { status: 400 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Fix #3: rejeitar ficheiros demasiado grandes antes de qualquer processamento
    if (file.size > maximumFileSize) {
      return NextResponse.json(
        { error: `File is too large. Maximum allowed size is ${maximumFileSize / 1024 / 1024} MB.` },
        { status: 400 }
      )
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()

    let extractedText = ""

    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      // Handle TXT files
      const rawText = await file.text()
      // Fix #4: remover BOM (Byte Order Mark) que pode aparecer em ficheiros .txt UTF-8
      extractedText = rawText.replace(/^\uFEFF/, "")
    } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      // Handle PDF files
      extractedText = await extractPdfText(file)
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      // Handle DOCX files
      extractedText = await extractDocxText(file)
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    extractedText = advancedCleanText(extractedText)

    // Fix #3: verificar limite de caracteres após limpeza
    if (extractedText.length > MAX_CHAR_LIMIT) {
      return NextResponse.json(
        { error: `File content exceeds the maximum allowed length of ${MAX_CHAR_LIMIT} characters.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    if (error instanceof OcrExtractionError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("Error extracting text:", error)
    return NextResponse.json(
      {
        error: "Failed to extract text from file. Please try a different file or format.",
      },
      { status: 500 },
    )
  }
}

import pdf from "pdf-parse/lib/pdf-parse";
import { advancedCleanText } from "@/lib/utils";

async function extractPdfText(file: File): Promise<string> {
  try {

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdf(buffer);
    const extractedText = data.text.trim();

    if (extractedText.length < 10) {
      return extractScannedPdfText(file);
    }

    return extractedText;
  } catch (error) {
    if (error instanceof OcrExtractionError) throw error
    console.error("Error extracting PDF text:", error);
    throw new Error("Unable to extract text from PDF. Please try a different file.");
  }
}

async function extractScannedPdfText(file: File): Promise<string> {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT?.replace(/\/$/, "")
  const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY

  if (!endpoint || !apiKey) {
    throw new OcrExtractionError(
      "Scanned-PDF reading is not configured yet. Please contact support.",
      503,
    )
  }

  let endpointUrl: URL
  try {
    endpointUrl = new URL(endpoint)
  } catch {
    throw new OcrExtractionError("Scanned-PDF reading is temporarily unavailable.", 503)
  }

  const analyzeResponse = await fetch(
    `${endpoint}/documentintelligence/documentModels/prebuilt-read:analyze?api-version=2024-11-30`,
    {
      method: "POST",
      headers: {
        // This function is reached only from the PDF path. Browsers sometimes
        // report an uploaded PDF as application/octet-stream, which Azure rejects.
        "Content-Type": "application/pdf",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
      body: Buffer.from(await file.arrayBuffer()),
    },
  )

  if (!analyzeResponse.ok) {
    const providerError = (await analyzeResponse.text()).slice(0, 1_000)
    console.error("Azure OCR submission failed:", {
      status: analyzeResponse.status,
      providerError,
    })
    throw new OcrExtractionError("We couldn't read this scanned PDF. Please try again.", 502)
  }

  const operationLocation = analyzeResponse.headers.get("operation-location")
  if (!operationLocation) {
    throw new OcrExtractionError("Scanned-PDF reading returned an invalid response.", 502)
  }

  let operationUrl: URL
  try {
    operationUrl = new URL(operationLocation)
  } catch {
    throw new OcrExtractionError("Scanned-PDF reading returned an invalid response.", 502)
  }

  if (operationUrl.protocol !== "https:" || operationUrl.host !== endpointUrl.host) {
    throw new OcrExtractionError("Scanned-PDF reading returned an invalid response.", 502)
  }

  for (let attempt = 0; attempt < OCR_MAX_POLL_ATTEMPTS; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, OCR_POLL_INTERVAL_MS))

    const resultResponse = await fetch(operationUrl, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
    })

    if (!resultResponse.ok) {
      console.error("Azure OCR status check failed:", resultResponse.status)
      throw new OcrExtractionError("We couldn't read this scanned PDF. Please try again.", 502)
    }

    const result = await resultResponse.json() as {
      status?: string
      analyzeResult?: { content?: string }
    }
    const status = result.status?.toLowerCase()

    if (status === "succeeded") {
      const text = result.analyzeResult?.content?.trim()
      if (!text) {
        throw new OcrExtractionError("No readable text was found in this scanned PDF.", 422)
      }
      return text
    }

    if (status === "failed") {
      throw new OcrExtractionError("We couldn't read this scanned PDF. Please try a clearer file.", 422)
    }
  }

  throw new OcrExtractionError("Scanned-PDF reading is taking longer than expected. Please try again.", 504)
}

async function extractDocxText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Converte ArrayBuffer para Buffer
    const buffer = Buffer.from(arrayBuffer);

    // Extrair texto bruto (primeira tentativa — mais fiel à estrutura original)
    const result = await mammoth.extractRawText({ buffer });

    if (result.value && result.value.trim().length > 0) {
      return result.value.trim();
    }

    // Fix #6: fallback via HTML, mas preservando a estrutura semântica antes de remover as tags
    const htmlResult = await mammoth.convertToHtml({ buffer });

    if (htmlResult.value && htmlResult.value.trim().length > 0) {
      const textFromHtml = htmlResult.value
        // Converter tags de bloco em quebras de parágrafo ANTES de remover as tags
        // Assim <h1>Título</h1><p>Texto</p> → "Título\n\nTexto" em vez de "Título Texto"
        .replace(/<\/(?:h[1-6]|p|li|tr|div|blockquote)>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        // Agora remover todas as tags restantes
        .replace(/<[^>]+>/g, "")
        // Decodificar entidades HTML básicas
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"')
        // Normalizar: máximo 2 quebras de linha consecutivas
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (textFromHtml.length > 0) {
        return textFromHtml;
      }
    }

    throw new Error("No readable text content found in DOCX file. File may be empty or contain only images.");
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to extract text from Word document: ${errorMessage}. Please ensure the file is a valid DOCX with text content.`
    );
  }
}

