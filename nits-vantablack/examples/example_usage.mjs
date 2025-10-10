/**
 * Example usage of NITS Local LLM Integration
 * 
 * This demonstrates how to use the local LLM for document analysis
 */

import { analyzeWithLLM, batchAnalyze } from '../ml_integration/local_model.js';
import fs from 'fs';

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  NITS Local LLM - Example Usage                     ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  // Example 1: Simple summary
  console.log('📄 Example 1: Document Summary');
  console.log('─────────────────────────────────────────────────────────');
  const sampleText = `
    Form 4 was filed on March 15, 2024 by John Doe, CEO of ACME Corp.
    The filing indicates the sale of 100,000 shares at $50 per share,
    totaling $5,000,000. This transaction occurred just two days before
    the company announced a major product recall affecting 80% of its
    revenue stream. The timing raises concerns about potential insider
    trading violations under SEC Rule 10b-5.
  `;

  try {
    const summary = await analyzeWithLLM(sampleText, 'summary');
    console.log('Summary:', summary);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Note: Make sure you have run ./scripts/bootstrap_local.sh first');
  }

  // Example 2: Violation detection
  console.log('📄 Example 2: Violation Detection');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const violations = await analyzeWithLLM(sampleText, 'violations');
    console.log('Violations:', violations);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 3: Custom configuration
  console.log('📄 Example 3: Custom Configuration');
  console.log('─────────────────────────────────────────────────────────');
  const customConfig = {
    modelPath: './models/nous-hermes-2-mistral-7b.Q4_K_M.gguf',
    temperature: 0.5,  // Lower temperature for more focused output
    maxTokens: 1024,
    contextWindow: 8192,
    systemPrompt: 'You are a strict SEC compliance analyst.'
  };

  try {
    const analysis = await analyzeWithLLM(sampleText, 'forensic', customConfig);
    console.log('Forensic Analysis:', analysis);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 4: Batch processing
  console.log('📄 Example 4: Batch Processing');
  console.log('─────────────────────────────────────────────────────────');
  const documents = [
    {
      name: 'Document 1',
      text: 'Form 4 filed with GAAP violation indicators.'
    },
    {
      name: 'Document 2',
      text: 'Insider trading activity detected in pre-earnings window.'
    }
  ];

  try {
    const results = await batchAnalyze(documents, 'summary');
    results.forEach(result => {
      console.log(`${result.document}:`, result.analysis);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  Examples Complete                                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
}

// Run examples
main().catch(console.error);
