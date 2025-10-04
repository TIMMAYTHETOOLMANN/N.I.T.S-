import { PdfExtractor } from './ingestion/pdf/PdfExtractor';

async function testPdfExtraction() {
  console.log('Testing PDF Extraction (Current Behavior)...\n');
  
  // Create a mock binary buffer that simulates a PDF file
  const mockPdfBinary = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000214 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n408\n%%EOF');
  
  const extractor = new PdfExtractor();
  
  // Test with mock binary buffer
  console.log('Test 1: Extract from mock PDF binary buffer');
  const result = await extractor.extractFromBuffer(mockPdfBinary.buffer as ArrayBuffer);
  console.log('Extracted text length:', result.text.length);
  console.log('Extracted text preview:', result.text.substring(0, 300));
  console.log('Text contains binary markers?', result.text.includes('%PDF') || result.text.includes('obj'));
  console.log('\nMetadata:', result.metadata);
  console.log('\n' + '='.repeat(60));
  
  // Check if text looks like binary/raw PDF
  if (result.text.includes('%PDF') || result.text.includes('endobj') || result.text.includes('stream')) {
    console.log('❌ ISSUE DETECTED: Binary/raw PDF content in extracted text!');
  } else {
    console.log('✅ No binary content detected');
  }
}

testPdfExtraction().catch(console.error);
