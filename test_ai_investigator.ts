/**
 * Test Script for AI Investigator Integration
 * 
 * This script tests the AI Investigator functionality by analyzing a sample document
 */

import { IntegratedNITSCore } from './deploy/complete_integration_patch';

async function testAIInvestigator() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TESTING AI INVESTIGATOR INTEGRATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    // Initialize NITS Core
    console.log('📊 Initializing NITS Core System...');
    const nits = new IntegratedNITSCore();
    await nits.initialize();
    console.log('✅ NITS Core initialized');
    console.log('');

    // Test with sample document
    const testDocument = './sample_docs/test_document.txt';
    console.log(`📄 Testing with: ${testDocument}`);
    console.log('');

    // Run AI analysis
    await nits.analyzeUsingAI(testDocument);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ AI INVESTIGATOR TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📁 Check ./output/ directory for AI report');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ TEST FAILED');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', error);
    console.error('');
    console.error('Note: If you see API key errors, make sure to:');
    console.error('  1. Create a .env file in the project root');
    console.error('  2. Add your OpenAI API key: OPENAI_API_KEY=your_key_here');
    console.error('  3. Get your key from: https://platform.openai.com/api-keys');
    console.error('');
    process.exit(1);
  }
}

// Run the test
testAIInvestigator();
