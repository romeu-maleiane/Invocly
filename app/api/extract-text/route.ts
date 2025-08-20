import { type NextRequest, NextResponse } from "next/server"
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting text extraction...")
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    console.log("[v0] Processing file:", fileName, "Type:", fileType)

    let extractedText = ""

    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      // Handle TXT files
      console.log("[v0] Extracting text from TXT file...")
      const text = await file.text()
      extractedText = text
    } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      // Handle PDF files
      console.log("[v0] Extracting text from PDF file...")
      extractedText = await extractPdfText(file)
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      // Handle DOCX files
      console.log("[v0] Extracting text from DOCX file...")
      extractedText = await extractDocxText(file)
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    console.log("[v0] Text extraction completed. Length:", extractedText.length)

    const MAX_CHAR_LIMIT = 20000;
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
    console.error("[v0] Error extracting text:", error)
    return NextResponse.json(
      {
        error: "Failed to extract text from file. Please try a different file or format.",
      },
      { status: 500 },
    )
  }
}

import pdf from "pdf-parse/lib/pdf-parse";

export async function extractPdfText(file: File): Promise<string> {
  try {
    console.log("[v0] Starting PDF text extraction...");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdf(buffer);
    const extractedText = data.text.trim();

    if (extractedText.length < 10) {
      console.log("[v0] PDF appears to be image-based, attempting OCR...");
      try {
        const ocrText = await performSimpleOCR(file);
        if (ocrText && ocrText.trim().length > 10) {
          return ocrText.trim();
        }
      } catch (ocrError) {
        console.error("[v0] OCR failed:", ocrError);
      }

      return "This PDF appears to be image-based or encrypted. Text extraction was attempted but minimal text was found.";
    }

    console.log("[v0] PDF text extracted successfully. Length:", extractedText.length);
    return extractedText;
  } catch (error) {
    console.error("[v0] Error extracting PDF text:", error);
    throw new Error("Unable to extract text from PDF. Please try a different file.");
  }
}

async function performSimpleOCR(file: File): Promise<string> {
  try {
    const Tesseract = await import("tesseract.js");
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    const { data: { text } } = await Tesseract.recognize(blob, "eng+por", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`[v0] OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return text || "";
  } catch (error) {
    console.error("[v0] OCR processing failed:", error);
    throw error;
  }
}


async function extractDocxText(file: File): Promise<string> {
  try {
    console.log("[v0] Starting DOCX text extraction...");

    const arrayBuffer = await file.arrayBuffer();
    console.log("[v0] DOCX file size:", arrayBuffer.byteLength, "bytes");

    // Converte ArrayBuffer para Buffer
    const buffer = Buffer.from(arrayBuffer);

    // Extrair texto bruto
    const result = await mammoth.extractRawText({ buffer });
    console.log("[v0] Mammoth extraction result:", {
      textLength: result.value?.length || 0,
      hasText: !!result.value,
      messagesCount: result.messages?.length || 0,
    });

    if (result.messages && result.messages.length > 0) {
      console.log("[v0] Mammoth messages:", result.messages);
    }

    if (result.value && result.value.trim().length > 0) {
      console.log("[v0] DOCX text extracted successfully. Length:", result.value.length);
      return result.value.trim();
    }

    console.log("[v0] Raw text extraction failed, trying HTML extraction...");

    // Extrair HTML e converter para texto
    const htmlResult = await mammoth.convertToHtml({ buffer });
    console.log("[v0] HTML extraction result:", {
      htmlLength: htmlResult.value?.length || 0,
      hasHtml: !!htmlResult.value,
    });

    if (htmlResult.value && htmlResult.value.trim().length > 0) {
      const textFromHtml = htmlResult.value
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (textFromHtml.length > 0) {
        console.log("[v0] Text extracted from HTML. Length:", textFromHtml.length);
        return textFromHtml;
      }
    }

    throw new Error("No readable text content found in DOCX file. File may be empty or contain only images.");
  } catch (error) {
    console.error("[v0] Error extracting DOCX text:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to extract text from Word document: ${errorMessage}. Please ensure the file is a valid DOCX with text content.`
    );
  }
}

