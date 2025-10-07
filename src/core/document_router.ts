import * as fs from 'fs';
import { PDFExtractor } from '../extractors/pdf_extractor';
import FormData from 'form-data';
import axios from 'axios';
import crypto from 'crypto';

interface DocumentType {
    format: 'pdf' | 'xls' | 'xlsx' | 'xml' | 'unknown';
    processor: 'typescript' | 'python' | 'none';
}

export class DocumentRouter {
    
    private pdfExtractor: PDFExtractor;
    private flaskUrl: string;
    
    constructor(flaskUrl: string = 'http://localhost:5000') {
        this.pdfExtractor = new PDFExtractor();
        this.flaskUrl = flaskUrl;
    }
    
    /**
     * Detect true document format using magic numbers (file signatures)
     * Never trust file extensions alone!
     */
    detectFormat(buffer: Buffer, filename: string): DocumentType {
        
        // Check magic numbers (first bytes of file)
        const signature = buffer.slice(0, 8);
        
        // XML (SEC Form 4)
        if (signature.slice(0, 5).toString() === '<?xml' ||
            buffer.includes(Buffer.from('<ownershipDocument>'))) {
            return { format: 'xml', processor: 'python' };
        }
        
        // PDF
        if (signature.slice(0, 4).toString() === '%PDF') {
            return { format: 'pdf', processor: 'typescript' };
        }
        
        // XLSX (ZIP archive)
        if (signature.slice(0, 4).equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) {
            const ext = filename.split('.').pop()?.toLowerCase();
            if (ext === 'xlsx' || ext === 'xlsm') {
                return { format: 'xlsx', processor: 'python' };
            }
        }
        
        // XLS (OLE/CFB format)
        if (signature.equals(Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]))) {
            return { format: 'xls', processor: 'python' };
        }
        
        console.warn(`Unknown format for ${filename}, signature: ${signature.toString('hex')}`);
        return { format: 'unknown', processor: 'none' };
    }
    
    /**
     * Route document to appropriate processor
     */
    async routeDocument(buffer: Buffer, filename: string, mimetype: string): Promise<any> {
        
        const docType = this.detectFormat(buffer, filename);
        
        console.log(`📋 Document routing: ${filename}`);
        console.log(`   Detected format: ${docType.format}`);
        console.log(`   Processor: ${docType.processor}`);
        
        switch (docType.processor) {
            case 'typescript':
                // Process PDFs locally with pdf-parse
                return await this.processLocally(buffer, filename, docType.format);
            
            case 'python':
                // Forward to Flask ML service for Python-only formats
                return await this.forwardToFlaskService(buffer, filename, mimetype);
            
            case 'none':
            default:
                throw new Error(`Unsupported document format: ${docType.format}`);
        }
    }
    
    private async processLocally(buffer: Buffer, filename: string, format: string): Promise<any> {
        
        if (format === 'pdf') {
            const result = await this.pdfExtractor.extractFromBuffer(buffer, filename);
            return {
                type: 'pdf',
                text: result.text,
                pages: result.numPages,
                processed_by: 'typescript'
            };
        }
        
        throw new Error(`Local processing not implemented for ${format}`);
    }
    
    /**
     * Forward document to Flask ML service with proper binary handling
     */
    async forwardToFlaskService(
        buffer: Buffer,
        filename: string,
        mimetype: string
    ): Promise<any> {
        
        // Calculate integrity hash
        const fileHash = crypto
            .createHash('md5')
            .update(buffer)
            .digest('hex');
        
        console.log('📤 Forwarding file to Flask ML service:');
        console.log(`   Filename: ${filename}`);
        console.log(`   Size: ${buffer.length} bytes`);
        console.log(`   MIME: ${mimetype}`);
        console.log(`   Hash: ${fileHash}`);
        console.log(`   First bytes: ${buffer.slice(0, 16).toString('hex')}`);
        
        // Create multipart form data
        const formData = new FormData();
        
        // CRITICAL: Append buffer with proper metadata
        // This ensures binary integrity and includes multipart boundary
        formData.append('file', buffer, {
            filename: filename,
            contentType: mimetype,
            knownLength: buffer.length
        });
        
        // Add integrity hash for verification
        formData.append('original_hash', fileHash);
        
        try {
            // Send to Flask with proper headers
            const response = await axios.post(
                `${this.flaskUrl}/api/process`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders()  // CRITICAL: includes boundary parameter
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: 60000  // 60 second timeout
                }
            );
            
            console.log('✓ Flask processing successful');
            return response.data;
            
        } catch (error) {
            console.error('❌ Error forwarding to Flask:', error);
            
            if (axios.isAxiosError(error)) {
                console.error('   Status:', error.response?.status);
                console.error('   Response:', error.response?.data);
            }
            
            throw error;
        }
    }
    
    /**
     * Process document from file path
     */
    async processFile(filePath: string): Promise<any> {
        const buffer = fs.readFileSync(filePath);
        const filename = filePath.split(/[\\/]/).pop() || 'unknown';
        const mimetype = this.getMimeType(filename);
        
        return await this.routeDocument(buffer, filename, mimetype);
    }
    
    /**
     * Get MIME type from filename extension
     */
    private getMimeType(filename: string): string {
        const ext = filename.split('.').pop()?.toLowerCase();
        
        switch (ext) {
            case 'pdf': return 'application/pdf';
            case 'xls': return 'application/vnd.ms-excel';
            case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'xml': return 'text/xml';
            default: return 'application/octet-stream';
        }
    }
}

// Example usage and test
async function testDocumentRouting() {
    const router = new DocumentRouter();
    
    console.log('🧪 Testing Document Router...');
    
    // Test format detection with sample data
    const pdfSignature = Buffer.from('%PDF-1.4\n');
    const xlsSignature = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
    const xmlSignature = Buffer.from('<?xml version="1.0"?>\n<ownershipDocument>');
    
    console.log('PDF detection:', router.detectFormat(pdfSignature, 'test.pdf'));
    console.log('XLS detection:', router.detectFormat(xlsSignature, 'test.xls'));
    console.log('XML detection:', router.detectFormat(xmlSignature, 'test.xml'));
    
    console.log('✅ Document Router tests completed');
}

if (require.main === module) {
    testDocumentRouting();
}