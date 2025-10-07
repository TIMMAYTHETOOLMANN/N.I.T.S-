import * as fs from 'fs';
import * as pdf from 'pdf-parse';

interface PDFExtractionResult {
    text: string;
    numPages: number;
    info: any;
    metadata: any;
    version: string;
}

export class PDFExtractor {
    
    /**
     * Extract text from PDF file - CORRECT binary handling
     * 
     * CRITICAL: Never convert binary PDF Buffer to string!
     * This permanently corrupts the data and causes extraction failures.
     */
    async extractText(filePath: string): Promise<PDFExtractionResult> {
        
        // Read as raw binary buffer - NO encoding parameter
        const dataBuffer = fs.readFileSync(filePath);
        
        // Verify it's actually a PDF file
        const pdfSignature = dataBuffer.slice(0, 4);
        if (!pdfSignature.equals(Buffer.from('%PDF'))) {
            throw new Error(`Not a valid PDF file: ${filePath}`);
        }
        
        console.log(`Processing PDF: ${filePath} (${dataBuffer.length} bytes)`);
        
        try {
            // Pass binary buffer directly to pdf-parse
            const data = await pdf(dataBuffer, {
                max: 0,  // Parse all pages
                version: 'default'
            });
            
            // Validate extraction
            if (!data.text || data.text.length < 10) {
                throw new Error('PDF extraction returned insufficient text');
            }
            
            // Check for binary artifacts (indicates extraction failure)
            if (data.text.includes('<< /Filter') || data.text.includes('stream')) {
                throw new Error('Binary artifacts detected in extracted text');
            }
            
            console.log(`✓ Extracted ${data.text.length} characters from ${data.numpages} pages`);
            
            return {
                text: data.text,
                numPages: data.numpages,
                info: data.info,
                metadata: data.metadata,
                version: data.version
            };
            
        } catch (error) {
            console.error('PDF extraction failed:', error);
            throw new Error(`Failed to extract PDF: ${error.message}`);
        }
    }
    
    /**
     * Extract text from PDF buffer (for uploaded files)
     */
    async extractFromBuffer(buffer: Buffer, filename: string): Promise<PDFExtractionResult> {
        
        // Verify buffer is binary (not corrupted string)
        if (!Buffer.isBuffer(buffer)) {
            throw new Error('Input must be a Buffer, not a string');
        }
        
        // Verify PDF signature
        if (!buffer.slice(0, 4).equals(Buffer.from('%PDF'))) {
            throw new Error(`Invalid PDF signature in ${filename}`);
        }
        
        console.log(`Processing uploaded PDF: ${filename} (${buffer.length} bytes)`);
        
        const data = await pdf(buffer, {
            max: 0
        });
        
        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
            metadata: data.metadata,
            version: data.version
        };
    }
}

// Example usage and test
async function testPDFExtraction() {
    const extractor = new PDFExtractor();
    
    // Test with actual Form 4 PDF
    try {
        const result = await extractor.extractText('./test_documents/form4.pdf');
        console.log('✓ PDF extraction successful');
        console.log(`Pages: ${result.numPages}`);
        console.log(`Text length: ${result.text.length}`);
    } catch (error) {
        console.error('✗ PDF extraction failed:', error.message);
    }
}

if (require.main === module) {
    testPDFExtraction();
}