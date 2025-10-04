// PDF document extraction and parsing
import * as fs from 'fs';

export interface ExtractedPDFContent {
  text: string;
  metadata: {
    pageCount: number;
    title?: string;
    author?: string;
  };
  pages: PDFPageContent[];
}

export interface PDFPageContent {
  pageNumber: number;
  text: string;
  tables?: any[];
  footnotes?: string[];
}

export class PdfExtractor {
  /**
   * Detect if text contains binary content or raw PDF structures
   */
  private containsBinaryContent(text: string): boolean {
    // Check for null bytes (definitive binary indicator)
    if (text.includes('\x00')) {
      return true;
    }
    
    // Check for raw PDF structures
    if (text.includes('%PDF') || 
        text.includes('endobj') || 
        text.includes('endstream') ||
        text.includes('/Type /Catalog') ||
        text.includes('xref')) {
      return true;
    }
    
    // Check for high proportion of non-printable characters
    const nonPrintableCount = (text.match(/[^\x20-\x7E\r\n\t]/g) || []).length;
    const nonPrintableRatio = nonPrintableCount / text.length;
    
    if (nonPrintableRatio > 0.3) {
      return true;
    }
    
    return false;
  }

  /**
   * Validate and sanitize extracted text
   */
  private validateExtractedText(text: string, source: string): string {
    // Check if the text contains binary content
    if (this.containsBinaryContent(text)) {
      console.log(`⚠️  Binary content detected in ${source} - replacing with error message`);
      return `ERROR: Unable to extract readable text from PDF document.

The PDF file could not be properly parsed. This may be due to:
- Encrypted or password-protected PDF
- Scanned images without OCR text layer
- Corrupted or malformed PDF structure
- Unsupported PDF features

Please ensure the PDF:
1. Is not password-protected
2. Contains actual text (not just scanned images)
3. Is not corrupted
4. Uses standard PDF formatting

For scanned documents, please use OCR software to convert images to text before uploading.`;
    }
    
    // Check for empty or very short text
    if (text.trim().length < 10) {
      return 'ERROR: PDF document appears to be empty or contains no extractable text. The file may be image-based or corrupted.';
    }
    
    return text;
  }

  /**
   * Extract content from PDF buffer using pdf-parse
   */
  async extractFromBuffer(buffer: ArrayBuffer): Promise<ExtractedPDFContent> {
    console.log('📄 Extracting PDF content...');
    
    try {
      // Dynamic import to handle ES module compatibility
      const pdfParseModule = await import('pdf-parse');
      // pdf-parse exports PDFParse and pdf, use the pdf function
      const pdfParse = (pdfParseModule as any).pdf || pdfParseModule.default || pdfParseModule;
      
      // Convert ArrayBuffer to Buffer for pdf-parse
      const nodeBuffer = Buffer.from(buffer);
      // Call pdfParse - it's a function
      const data = await pdfParse(nodeBuffer);
      
      console.log(`📄 Successfully extracted ${data.numpages} pages, ${data.text.length} characters`);
      
      // Validate extracted text to ensure it's not binary
      const validatedText = this.validateExtractedText(data.text, 'pdf-parse');
      
      // Split text into pages (rough estimation)
      const pages: PDFPageContent[] = [];
      if (data.numpages > 1) {
        const textPerPage = Math.ceil(validatedText.length / data.numpages);
        for (let i = 0; i < data.numpages; i++) {
          const start = i * textPerPage;
          const end = Math.min(start + textPerPage, validatedText.length);
          pages.push({
            pageNumber: i + 1,
            text: validatedText.substring(start, end),
            tables: [],
            footnotes: []
          });
        }
      } else {
        pages.push({
          pageNumber: 1,
          text: validatedText,
          tables: [],
          footnotes: []
        });
      }
      
      return {
        text: validatedText,
        metadata: {
          pageCount: data.numpages,
          title: data.info?.Title || 'PDF Document',
          author: data.info?.Author || 'Unknown'
        },
        pages: pages
      };
    } catch (error) {
      console.error('❌ Failed to extract PDF content:', error);
      // Fallback to basic text extraction attempt
      const fallbackText = this.attemptBasicTextExtraction(buffer);
      // Validate fallback text to ensure no binary content passes through
      const validatedFallbackText = this.validateExtractedText(fallbackText, 'fallback extraction');
      
      return {
        text: validatedFallbackText,
        metadata: {
          pageCount: 1,
          title: 'PDF Document (Partial Extraction)',
          author: 'Unknown'
        },
        pages: [{
          pageNumber: 1,
          text: validatedFallbackText,
          tables: [],
          footnotes: []
        }]
      };
    }
  }
  
  /**
   * Fallback method for basic text extraction when pdf-parse fails
   * This method attempts to extract readable text but will NEVER return binary content
   */
  private attemptBasicTextExtraction(buffer: ArrayBuffer): string {
    try {
      // Convert buffer to string and look for readable text patterns
      const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      
      // Check if this looks like raw PDF content
      if (this.containsBinaryContent(text)) {
        console.log('⚠️  Raw PDF binary content detected - cannot extract text');
        // Return clean error message, never binary content
        return 'ERROR: PDF text extraction failed - binary content detected';
      }
      
      // Extract readable text segments using aggressive filtering
      const readableSegments: string[] = [];
      const lines = text.split(/[\r\n]+/);
      
      for (const line of lines) {
        // Look for lines that contain mostly readable ASCII characters
        const cleanLine = line.replace(/[^\x20-\x7E]/g, ' ').trim();
        if (cleanLine.length > 10 && /[a-zA-Z]/.test(cleanLine)) {
          // Skip PDF structural elements - be very aggressive
          if (!cleanLine.startsWith('/') && 
              !cleanLine.includes('obj') && 
              !cleanLine.includes('endobj') &&
              !cleanLine.includes('stream') &&
              !cleanLine.includes('endstream') &&
              !cleanLine.includes('<< /') &&
              !cleanLine.includes('>> <<') &&
              !cleanLine.includes('/Length') &&
              !cleanLine.includes('/Type') &&
              !cleanLine.includes('xref') &&
              !cleanLine.includes('trailer') &&
              !cleanLine.includes('startxref')) {
            readableSegments.push(cleanLine);
          }
        }
      }
      
      const extractedText = readableSegments.join(' ').trim();
      
      // If we got some readable text, limit and return it
      if (extractedText.length > 50) {
        // Double-check it doesn't contain binary markers
        const limitedText = extractedText.substring(0, 1000);
        if (!this.containsBinaryContent(limitedText)) {
          return limitedText;
        }
      }
      
      // If we couldn't extract anything clean, return clear error message
      return 'Unable to extract readable text from this document. The file may be encrypted, image-based, or in an unsupported format.';
    } catch {
      return 'PDF content could not be extracted - please ensure file is a valid PDF document';
    }
  }

  /**
   * Extract content from PDF file path
   */
  async extractFromFile(filePath: string): Promise<ExtractedPDFContent> {
    console.log(`📄 Extracting PDF from: ${filePath}`);
    
    try {
      // Read the PDF file from disk
      const fileBuffer = await fs.promises.readFile(filePath);
      // Convert Node.js Buffer to ArrayBuffer for consistency
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset, 
        fileBuffer.byteOffset + fileBuffer.byteLength
      ) as ArrayBuffer;
      return await this.extractFromBuffer(arrayBuffer);
    } catch (error) {
      console.error(`❌ Failed to read PDF file ${filePath}:`, error);
      const errorMessage = `Failed to read PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return {
        text: errorMessage,
        metadata: {
          pageCount: 0,
          title: 'Error Reading PDF',
          author: 'Unknown'
        },
        pages: []
      };
    }
  }

  /**
   * Parse massive legal documents with surgical precision
   */
  async parseMassivePDF(url: string, expectedPages: number = 100): Promise<ExtractedPDFContent> {
    console.log(`📄 Parsing massive document (${expectedPages} pages expected)`);
    
    try {
      // For file paths (not URLs), use extractFromFile
      if (!url.startsWith('http')) {
        return await this.extractFromFile(url);
      }
      
      // For actual URLs, would implement HTTP fetch + extraction
      // For now, return error for unsupported URL parsing
      return {
        text: 'URL-based PDF parsing not yet implemented. Please upload PDF files directly.',
        metadata: {
          pageCount: 0,
          title: 'URL Parsing Not Supported',
          author: 'System'
        },
        pages: []
      };
    } catch (error) {
      console.error(`❌ Failed to parse massive PDF ${url}:`, error);
      return {
        text: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          pageCount: 0,
          title: 'Error Parsing PDF',
          author: 'Unknown'
        },
        pages: []
      };
    }
  }
}
