import { type NextRequest, NextResponse } from "next/server"
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()

    let extractedText = ""

    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      // Handle TXT files
      const text = await file.text()
      extractedText = text
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

export async function extractPdfText(file: File): Promise<string> {
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

async function performSimpleOCR(file: File): Promise<string> {
  try {
    const Tesseract = await import("tesseract.js");
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    const { data: { text } } = await Tesseract.recognize(blob, "eng+por");

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

    // Extrair texto bruto
    const result = await mammoth.extractRawText({ buffer });


    if (result.value && result.value.trim().length > 0) {
      return result.value.trim();
    }


    // Extrair HTML e converter para texto
    const htmlResult = await mammoth.convertToHtml({ buffer });

    if (htmlResult.value && htmlResult.value.trim().length > 0) {
      const textFromHtml = htmlResult.value
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
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

