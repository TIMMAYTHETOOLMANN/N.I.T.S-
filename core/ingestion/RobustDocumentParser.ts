/**
 * JUNI: Robust Document Parser
 * Multi-strategy extraction: Digital → OCR → Excel
 */

import { PdfExtractor } from '../../ingestion/pdf/PdfExtractor';
import * as fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

export interface ExtractionResult {
  text: string;
  tables: any[];
  method: 'digital' | 'ocr' | 'hybrid';
  confidence: number;
}

export class RobustDocumentParser {
  private readonly MIN_LENGTH_THRESHOLD = 100;
  private pdfExtractor: PdfExtractor;

  constructor() {
    this.pdfExtractor = new PdfExtractor();
  }

  async robustExtract(filePath: string): Promise<ExtractionResult> {
    console.log(`🔍 Robust extraction: ${filePath}`);

    // CRITICAL: Read as Buffer
    const fileBuffer = fs.readFileSync(filePath);

    let result: ExtractionResult = {
      text: '',
      tables: [],
      method: 'digital',
      confidence: 0
    };

    // Step 1: Digital PDF extraction
    if (filePath.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfResult = await this.pdfExtractor.extractFromBuffer(fileBuffer.buffer);

        result.text = pdfResult.text;
        result.method = 'digital';
        result.confidence = this.calculateConfidence(pdfResult.text);

        console.log(`✅ Digital extraction: ${result.text.length} chars, confidence: ${result.confidence}`);
      } catch (err) {
        console.warn(`⚠️  Digital extraction failed:`, err);
      }
    }

    // Step 2: OCR fallback
    if (result.text.length < this.MIN_LENGTH_THRESHOLD) {
      console.log(`🔄 OCR fallback (text: ${result.text.length} chars)`);

      try {
        const ocrResult = await this.runOCRViaMLService(fileBuffer, filePath);

        if (ocrResult.text && ocrResult.text.length > result.text.length) {
          result.text = ocrResult.text;
          result.method = result.text.length > 0 ? 'hybrid' : 'ocr';
          result.confidence = ocrResult.confidence || 0.7;

          console.log(`✅ OCR extraction: ${result.text.length} chars`);
        }
      } catch (err) {
        console.error(`❌ OCR failed:`, err);
      }
    }

    // Step 3: Excel extraction (basic handling)
    if (filePath.match(/\.(xls|xlsx|xlsm)$/i)) {
      try {
        // Basic Excel handling - would need actual Excel processor
        const textData = fs.readFileSync(filePath, 'utf8');
        result.text = textData;
        result.method = 'digital';
        result.confidence = 0.95;

        console.log(`✅ Excel extraction attempted`);
      } catch (err) {
        console.warn(`⚠️  Excel parse failed:`, err);
      }
    }

    if (result.text.length < 10) {
      console.warn(`⚠️  Minimal extraction: ${result.text.length} chars`);
    }

    return result;
  }

  private calculateConfidence(text: string): number {
    if (text.includes('<< /Filter') || text.includes('endstream')) {
      return 0.1;
    }

    const words = text.split(/\s+/).filter(w => w.length > 2);
    const wordDensity = words.length / Math.max(text.length, 1);

    if (wordDensity < 0.05) return 0.3;
    if (wordDensity > 0.15) return 0.95;

    return 0.7;
  }

  private async runOCRViaMLService(
    fileBuffer: Buffer,
    filename: string
  ): Promise<{ text: string; confidence: number }> {
    const formData = new FormData();

    formData.append('file', fileBuffer, {
      filename: filename,
      contentType: 'application/pdf'
    });

    try {
      const response = await axios.post('http://localhost:5000/api/ocr', formData, {
        headers: formData.getHeaders(),
        timeout: 120000
      });

      return {
        text: response.data.text || '',
        confidence: response.data.confidence || 0.7
      };
    } catch (err: any) {
      console.error(`❌ ML Service OCR error:`, err.message);
      return { text: '', confidence: 0 };
    }
  }
}
