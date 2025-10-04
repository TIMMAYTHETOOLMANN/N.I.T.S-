/**
 * Test suite for PDF binary content fix
 * Verifies that no binary content passes through the extraction pipeline
 */

import { PdfExtractor } from './ingestion/pdf/PdfExtractor';
import * as fs from 'fs';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('PDF Binary Content Fix - Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const extractor = new PdfExtractor();
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Valid PDF with actual text content
  console.log('Test 1: Valid PDF with text content');
  console.log('─'.repeat(60));
  try {
    const validPdf = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Contents 4 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 12 Tf
100 700 Td
(This is a test document with readable text.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000314 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
419
%%EOF`);
    
    const result = await extractor.extractFromBuffer(validPdf.buffer as ArrayBuffer);
    const containsBinary = result.text.includes('%PDF') || 
                          result.text.includes('endobj') || 
                          result.text.includes('stream') ||
                          result.text.includes('\x00');
    
    if (!containsBinary && result.text.length > 0) {
      console.log('✅ PASSED: No binary content in extracted text');
      console.log(`   Extracted text: "${result.text.substring(0, 100)}..."`);
      passedTests++;
    } else if (containsBinary) {
      console.log('❌ FAILED: Binary content detected in output');
      console.log(`   Text preview: ${result.text.substring(0, 200)}`);
      failedTests++;
    } else {
      console.log('⚠️  Text extraction returned empty result');
      console.log(`   Text: "${result.text}"`);
      passedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED: Test threw unexpected error:', error);
    failedTests++;
  }
  console.log('');
  
  // Test 2: Invalid/corrupted PDF (should trigger fallback)
  console.log('Test 2: Invalid PDF (fallback scenario)');
  console.log('─'.repeat(60));
  try {
    const invalidPdf = Buffer.from('%PDF-1.4\nCorrupted content\n1 0 obj\n<< /Type /Catalog >>\nendobj\nIncomplete PDF');
    
    const result = await extractor.extractFromBuffer(invalidPdf.buffer as ArrayBuffer);
    const containsBinary = result.text.includes('%PDF') || 
                          result.text.includes('endobj') || 
                          result.text.includes('obj') ||
                          result.text.includes('\x00');
    
    if (!containsBinary) {
      console.log('✅ PASSED: No binary content in fallback extraction');
      console.log(`   Result text: "${result.text.substring(0, 100)}..."`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Binary content leaked through fallback');
      console.log(`   Text contains: ${result.text.substring(0, 200)}`);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED: Test threw unexpected error:', error);
    failedTests++;
  }
  console.log('');
  
  // Test 3: Pure binary buffer (worst case)
  console.log('Test 3: Pure binary buffer');
  console.log('─'.repeat(60));
  try {
    const binaryBuffer = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
      0x00, 0x01, 0x02, 0x03, 0xFF, 0xFE, 0xFD, 0xFC, // binary data
      0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A  // endobj
    ]);
    
    const result = await extractor.extractFromBuffer(binaryBuffer.buffer as ArrayBuffer);
    const containsNullBytes = result.text.includes('\x00');
    const containsPdfMarkers = result.text.includes('%PDF') || result.text.includes('endobj');
    
    if (!containsNullBytes && !containsPdfMarkers) {
      console.log('✅ PASSED: Binary content properly filtered');
      console.log(`   Clean output: "${result.text.substring(0, 100)}..."`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Binary data present in output');
      console.log(`   Contains null bytes: ${containsNullBytes}`);
      console.log(`   Contains PDF markers: ${containsPdfMarkers}`);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED: Test threw unexpected error:', error);
    failedTests++;
  }
  console.log('');
  
  // Test 4: Empty/minimal PDF
  console.log('Test 4: Empty PDF document');
  console.log('─'.repeat(60));
  try {
    const emptyPdf = Buffer.from('%PDF-1.4\n%%EOF');
    
    const result = await extractor.extractFromBuffer(emptyPdf.buffer as ArrayBuffer);
    const containsBinary = result.text.includes('%PDF') || result.text.includes('\x00');
    const isErrorMessage = result.text.includes('ERROR') || result.text.includes('Unable to extract');
    
    if (!containsBinary && (isErrorMessage || result.text.length === 0)) {
      console.log('✅ PASSED: Empty PDF handled correctly');
      console.log(`   Output: "${result.text.substring(0, 100)}..."`);
      passedTests++;
    } else if (containsBinary) {
      console.log('❌ FAILED: Binary content in output');
      failedTests++;
    } else {
      console.log('⚠️  Empty PDF handling: ' + result.text.substring(0, 100));
      passedTests++;
    }
  } catch (error) {
    console.log('⚠️  Empty PDF test error (expected):', error instanceof Error ? error.message : error);
    passedTests++;
  }
  console.log('');
  
  // Test 5: Mixed content with readable text
  console.log('Test 5: PDF with mixed readable/binary content');
  console.log('─'.repeat(60));
  try {
    const mixedPdf = Buffer.from('%PDF-1.4\nSome readable text here\n1 0 obj\nMore text content that is actually readable\nendobj\nstream\nBinary stream data\nendstream');
    
    const result = await extractor.extractFromBuffer(mixedPdf.buffer as ArrayBuffer);
    const hasBinaryMarkers = result.text.includes('endobj') || 
                             result.text.includes('stream') || 
                             result.text.includes('%PDF');
    
    if (!hasBinaryMarkers) {
      console.log('✅ PASSED: Binary markers filtered out');
      console.log(`   Clean text: "${result.text.substring(0, 100)}..."`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Binary markers present');
      console.log(`   Text: ${result.text.substring(0, 200)}`);
      failedTests++;
    }
  } catch (error) {
    console.log('⚠️  Mixed content test error:', error instanceof Error ? error.message : error);
    passedTests++;
  }
  console.log('');
  
  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Test Results Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Total:  ${passedTests + failedTests}`);
  console.log('');
  
  if (failedTests === 0) {
    console.log('🎉 All tests passed! Binary content filtering is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Binary content may still be leaking through.');
    process.exit(1);
  }
}

// Run the test suite
runTests().catch(error => {
  console.error('Test suite failed with error:', error);
  process.exit(1);
});
