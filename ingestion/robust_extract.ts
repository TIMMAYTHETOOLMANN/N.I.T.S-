// ingestion/robust_extract.ts

import * as fs from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import * as Tesseract from 'tesseract.js';

export interface ExtractedDocument {
  text: string;
  source: 'digital' | 'ocr' | 'reflow';
  layoutMetadata?: {
    pageCount: number;
    sizeKB: number;
    fileName: string;
  };
}

export async function extractDocument(filePath: string): Promise<ExtractedDocument> {
  const ext = path.extname(filePath).toLowerCase();
  const stats = fs.statSync(filePath);

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Handle pdf-parse module which can export in different ways
    const pdfParseModule = pdfParse as any;
    const pdfParseFunc = pdfParseModule.default || pdfParseModule.pdf || pdfParseModule;
    const parsed = await pdfParseFunc(dataBuffer);

    if (parsed.text.length > 100) {
      return {
        text: parsed.text,
        source: 'digital',
        layoutMetadata: {
          pageCount: parsed.numpages,
          sizeKB: stats.size / 1024,
          fileName: path.basename(filePath)
        }
      };
    }

    // OCR fallback
    const ocrResult = await Tesseract.recognize(filePath, 'eng', { logger: m => null });
    if (ocrResult.data.text.length > 50) {
      return {
        text: ocrResult.data.text,
        source: 'ocr',
        layoutMetadata: {
          pageCount: parsed.numpages,
          sizeKB: stats.size / 1024,
          fileName: path.basename(filePath)
        }
      };
    }

    // Final fallback — reflow scan as plaintext
    const fallbackText = '[RENDERED IMAGE - NO TEXT EXTRACTED]';
    return {
      text: fallbackText,
      source: 'reflow',
      layoutMetadata: {
        pageCount: parsed.numpages,
        sizeKB: stats.size / 1024,
        fileName: path.basename(filePath)
      }
    };
  }

  throw new Error(`Unsupported file type for extraction: ${ext}`);
}
