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
      
      // Split text into pages (rough estimation)
      const pages: PDFPageContent[] = [];
      if (data.numpages > 1) {
        const textPerPage = Math.ceil(data.text.length / data.numpages);
        for (let i = 0; i < data.numpages; i++) {
          const start = i * textPerPage;
          const end = Math.min(start + textPerPage, data.text.length);
          pages.push({
            pageNumber: i + 1,
            text: data.text.substring(start, end),
            tables: [],
            footnotes: []
          });
        }
      } else {
        pages.push({
          pageNumber: 1,
          text: data.text,
          tables: [],
          footnotes: []
        });
      }
      
      return {
        text: data.text,
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
      return {
        text: fallbackText,
        metadata: {
          pageCount: 1,
          title: 'PDF Document (Partial Extraction)',
          author: 'Unknown'
        },
        pages: [{
          pageNumber: 1,
          text: fallbackText,
          tables: [],
          footnotes: []
        }]
      };
    }
  }
  
  /**
   * Fallback method for basic text extraction when pdf-parse fails
   */
  private attemptBasicTextExtraction(buffer: ArrayBuffer): string {
    try {
      // Convert buffer to string and look for readable text patterns
      const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      
      // Check if this looks like a PDF file with raw content
      if (text.includes('%PDF') || text.includes('/Type /Catalog') || text.includes('obj')) {
        console.log('⚠️  Detected raw PDF content - pdf-parse library failed to load properly');
        return `ERROR: PDF parsing library failed to initialize. Raw PDF content detected but cannot be processed.

The system attempted to extract text from a PDF document but the pdf-parse library is not functioning correctly. 
This may be due to:
- Module loading issues with pdf-parse
- Incompatible PDF format
- Corrupted PDF file

Please ensure the PDF file is valid and the pdf-parse dependency is properly installed.

Technical details: File appears to contain PDF objects and streams but text extraction failed.`;
      }
      
      // Extract readable text segments (basic heuristic)
      const readableSegments: string[] = [];
      const lines = text.split(/[\r\n]+/);
      
      for (const line of lines) {
        // Look for lines that contain mostly readable ASCII characters
        const cleanLine = line.replace(/[^\x20-\x7E]/g, ' ').trim();
        if (cleanLine.length > 10 && /[a-zA-Z]/.test(cleanLine)) {
          // Skip PDF structural elements
          if (!cleanLine.startsWith('/') && 
              !cleanLine.includes('obj') && 
              !cleanLine.includes('endobj') &&
              !cleanLine.includes('stream') &&
              !cleanLine.includes('endstream') &&
              !cleanLine.includes('<< /') &&
              !cleanLine.includes('>> <<') &&
              !cleanLine.includes('/Length')) {
            readableSegments.push(cleanLine);
          }
        }
      }
      
      const extractedText = readableSegments.join(' ').substring(0, 1000); // Limit length
      return extractedText.length > 50 ? extractedText : 'Unable to extract readable text from this document. The file may be encrypted, image-based, or in an unsupported format.';
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
      return {
        text: `Failed to read PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
