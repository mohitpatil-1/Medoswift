import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

/**
 * OCR helper:
 * - For PDFs: try pdf-parse text extraction (fast). If empty, we return empty (no rasterization).
 * - For images: run tesseract.js.
 */
export async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const buf = await fs.readFile(filePath);
    const data = await pdfParse(buf);
    return (data?.text || "").trim();
  }

  // image
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(filePath);
    return (data?.text || "").trim();
  } finally {
    await worker.terminate();
  }
}
