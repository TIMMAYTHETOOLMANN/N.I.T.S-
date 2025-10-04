import { PdfExtractor } from './ingestion/pdf/PdfExtractor';

async function testFallbackBehavior() {
  console.log('Testing PDF Extraction Fallback Behavior...\n');
  
  // Create a corrupted/invalid PDF that will cause pdf-parse to fail
  const invalidPdfBinary = Buffer.from('%PDF-1.4\nInvalid PDF content that will cause parsing to fail\n1 0 obj\n<< /Type /Catalog >>\nendobj\nIncomplete and broken PDF structure');
  
  const extractor = new PdfExtractor();
  
  console.log('Test: Extract from invalid PDF (will trigger fallback)');
  const result = await extractor.extractFromBuffer(invalidPdfBinary.buffer as ArrayBuffer);
  console.log('Extracted text length:', result.text.length);
  console.log('Extracted text preview:\n', result.text.substring(0, 500));
  console.log('\n' + '='.repeat(60));
  
  // Check if text looks like binary/raw PDF
  if (result.text.includes('%PDF') || result.text.includes('ERROR:')) {
    console.log('⚠️  FALLBACK TRIGGERED: Error message or binary content detected');
    console.log('This is the root cause mentioned in the problem statement!');
  } else if (result.text.includes('Unable to extract')) {
    console.log('✅ Proper error handling - informative message');
  }
}

testFallbackBehavior().catch(console.error);
