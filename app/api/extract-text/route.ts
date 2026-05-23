import { type NextRequest, NextResponse } from "next/server"
import mammoth from "mammoth";

// Fix #3: limites verificados antecipadamente, antes de qualquer processamento
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_CHAR_LIMIT = 20_000;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Fix #3: rejeitar ficheiros demasiado grandes antes de qualquer processamento
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` },
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
      try {
        const ocrText = await performSimpleOCR(file);
        if (ocrText && ocrText.trim().length > 10) {
          return ocrText.trim();
        }
      } catch (ocrError) {
        console.error("OCR failed:", ocrError);
      }

      return "This PDF appears to be image-based or encrypted. Text extraction was attempted but minimal text was found.";
    }

    return extractedText;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Unable to extract text from PDF. Please try a different file.");
  }
}

// Fix #5: timeout máximo para OCR — evita bloquear o servidor indefinidamente
const OCR_TIMEOUT_MS = 30_000; // 30 segundos

async function performSimpleOCR(file: File): Promise<string> {
  try {
    const Tesseract = await import("tesseract.js");
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    const ocrPromise = Tesseract.recognize(blob, "eng+por", {
      // Desativar logger em produção para não poluir os logs do servidor
      logger: process.env.NODE_ENV === "development" ? (m: unknown) => console.log(m) : undefined,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("OCR timeout: processing exceeded 30 seconds")), OCR_TIMEOUT_MS)
    );

    const { data: { text } } = await Promise.race([ocrPromise, timeoutPromise]);

    return text || "";
  } catch (error) {
    console.error("OCR processing failed:", error);
    throw error;
  }
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

