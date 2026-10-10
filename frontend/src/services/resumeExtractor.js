import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Configure pdfjs worker
// We use dynamic unpkg / local URL fallback for reliable cross-browser execution
try {
  if (typeof window !== "undefined") {
    // Standard worker source setup for pdfjs-dist in modern bundlers
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.10.38"}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn("Failed to set pdfjs worker url, using default:", e);
}

/**
 * Extracts plain text from a File or Blob (PDF or DOCX or TXT)
 * @param {File} file
 * @returns {Promise<{ text: string, fileName: string, fileSize: string, fileType: string, pageCount?: number }>}
 */
export async function extractResumeText(file) {
  if (!file) {
    throw new Error("No resume file was provided for extraction.");
  }

  const fileName = file.name || "resume.pdf";
  const fileExtension = fileName.split(".").pop().toLowerCase();
  const fileSizeFormatted =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File exceeds 10 MB limit. Please upload a smaller PDF or DOCX file.");
  }

  let extractedText = "";
  let pageCount = 1;

  if (fileExtension === "pdf" || file.type === "application/pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useWorkerFetch: true,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdfDocument = await loadingTask.promise;
      pageCount = pdfDocument.numPages;

      let fullText = "";
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .filter((item) => "str" in item)
          .map((item) => item.str);
        fullText += pageStrings.join(" ") + "\n\n";
      }

      extractedText = fullText.trim();
    } catch (err) {
      console.error("PDF extraction error:", err);
      throw new Error(
        "We couldn't extract readable text from this PDF. Please make sure it is a text-based PDF rather than a scanned image."
      );
    }
  } else if (
    fileExtension === "docx" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = (result.value || "").trim();
    } catch (err) {
      console.error("DOCX extraction error:", err);
      throw new Error(
        "We couldn't extract readable text from this Word (.docx) document. Please check the file formatting."
      );
    }
  } else if (fileExtension === "txt" || file.type.startsWith("text/")) {
    try {
      extractedText = (await file.text()).trim();
    } catch (err) {
      console.error("Text file read error:", err);
      throw new Error("Unable to read plaintext file.");
    }
  } else {
    throw new Error(
      `Unsupported file format (.${fileExtension}). Please upload a valid PDF or Word (.docx) document.`
    );
  }

  // Sanity checks on extracted text
  if (!extractedText || extractedText.length < 40) {
    throw new Error(
      "We couldn't extract readable text from this file. Please upload a text-based PDF or DOCX with selectable text."
    );
  }

  const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) {
    throw new Error(
      "The extracted text is too short (less than 20 words) to perform a meaningful career analysis. Please upload a full resume."
    );
  }

  return {
    text: extractedText,
    fileName,
    fileSize: fileSizeFormatted,
    fileType: fileExtension.toUpperCase(),
    pageCount,
    wordCount,
  };
}
