import { type NextRequest, NextResponse } from "next/server"

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

async function extractPdfText(file: File): Promise<string> {
  try {
    console.log("[v0] Starting PDF text extraction...")
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to string and look for text content
    const pdfString = new TextDecoder("latin1").decode(uint8Array)

    let extractedText = ""

    // Method 1: Look for text in parentheses (common PDF text format)
    const parenthesesMatches = pdfString.match(/$$([^)]+)$$/g)
    if (parenthesesMatches) {
      const textFromParentheses = parenthesesMatches
        .map((match) => match.slice(1, -1)) // Remove parentheses
        .filter((text) => text.length > 1 && /[a-zA-Z]/.test(text))
        .join(" ")

      if (textFromParentheses.length > extractedText.length) {
        extractedText = textFromParentheses
      }
    }

    // Method 2: Look for text objects with BT/ET markers
    const btEtMatches = pdfString.match(/BT\s+(.*?)\s+ET/gs)
    if (btEtMatches) {
      const textFromBtEt = btEtMatches
        .map((match) => {
          // Extract text between parentheses within BT/ET blocks
          const innerText = match.match(/$$([^)]+)$$/g)
          return innerText ? innerText.map((t) => t.slice(1, -1)).join(" ") : ""
        })
        .filter((text) => text.length > 1)
        .join(" ")

      if (textFromBtEt.length > extractedText.length) {
        extractedText = textFromBtEt
      }
    }

    // Method 3: Look for stream content
    const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs)
    if (streamMatches && extractedText.length < 50) {
      for (const match of streamMatches) {
        const content = match.replace(/^stream\s*|\s*endstream$/g, "")
        const readableText = content.match(/[a-zA-Z\s.,!?;:'"()-]{10,}/g)
        if (readableText) {
          const streamText = readableText.join(" ")
          if (streamText.length > extractedText.length) {
            extractedText = streamText
          }
        }
      }
    }

    console.log("[v0] Extracted text length:", extractedText.length)

    if (extractedText.trim().length < 10) {
      console.log("[v0] PDF appears to be image-based, attempting simple OCR...")
      try {
        const ocrText = await performSimpleOCR(file)
        if (ocrText && ocrText.trim().length > 10) {
          return ocrText.trim()
        }
      } catch (ocrError) {
        console.error("[v0] OCR failed:", ocrError)
      }

      return "This PDF appears to be image-based or encrypted. Text extraction was attempted but minimal text was found. For better results, please use a text-based PDF or convert your document to a text format."
    }

    return (
      extractedText.trim() ||
      "No readable text found in this PDF. The file may be image-based, encrypted, or corrupted."
    )
  } catch (error) {
    console.error("[v0] Error extracting PDF text:", error)
    throw new Error("Unable to extract text from PDF. Please try a different file.")
  }
}

async function performSimpleOCR(file: File): Promise<string> {
  try {
    console.log("[v0] Attempting OCR with Tesseract.js...")

    // Import Tesseract.js dynamically
    const Tesseract = await import("tesseract.js")

    // Convert file to blob URL for Tesseract
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })

    console.log("[v0] Starting OCR recognition...")
    const {
      data: { text },
    } = await Tesseract.recognize(
      blob,
      "eng+por", // English and Portuguese
      {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`[v0] OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        },
      },
    )

    console.log("[v0] OCR completed. Text length:", text?.length || 0)
    return text || ""
  } catch (error) {
    console.error("[v0] OCR processing failed:", error)
    throw error
  }
}

async function extractDocxText(file: File): Promise<string> {
  try {
    console.log("[v0] Starting DOCX text extraction...")
    const arrayBuffer = await file.arrayBuffer()
    console.log("[v0] DOCX file size:", arrayBuffer.byteLength, "bytes")

    const mammoth = await import("mammoth")
    console.log("[v0] Mammoth library imported successfully")

    const result = await mammoth.extractRawText({ arrayBuffer })
    console.log("[v0] Mammoth extraction result:", {
      textLength: result.text?.length || 0,
      hasText: !!result.text,
      messagesCount: result.messages?.length || 0,
    })

    if (result.messages && result.messages.length > 0) {
      console.log("[v0] Mammoth messages:", result.messages)
    }

    if (result.text && result.text.trim().length > 0) {
      console.log("[v0] DOCX text extracted successfully. Length:", result.text.length)
      return result.text.trim()
    }

    console.log("[v0] Raw text extraction failed, trying HTML extraction...")
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer })
    console.log("[v0] HTML extraction result:", {
      htmlLength: htmlResult.value?.length || 0,
      hasHtml: !!htmlResult.value,
    })

    if (htmlResult.value && htmlResult.value.trim().length > 0) {
      const textFromHtml = htmlResult.value
        .replace(/<[^>]*>/g, " ") // Remove HTML tags
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim()

      if (textFromHtml.length > 0) {
        console.log("[v0] Text extracted from HTML. Length:", textFromHtml.length)
        return textFromHtml
      }
    }

    throw new Error(
      `No readable text content found in DOCX file. File may be empty, corrupted, or contain only images/objects.`,
    )
  } catch (error) {
    console.error("[v0] Error extracting DOCX text:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    throw new Error(
      `Failed to extract text from Word document: ${errorMessage}. Please ensure the file is a valid DOCX file with text content.`,
    )
  }
}
