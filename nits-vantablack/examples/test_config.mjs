/**
 * Test script to verify configuration loading
 * This test doesn't require the model to be downloaded
 */

import fs from 'fs';
import path from 'path';

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║  NITS Local LLM - Configuration Test                ║');
console.log('╚═══════════════════════════════════════════════════════╝');
console.log('');

// Test 1: Check if config file exists
console.log('📋 Test 1: Configuration File');
console.log('─────────────────────────────────────────────────────────');

const configPath = './nits-vantablack/configs/mission_context.json';
if (fs.existsSync(configPath)) {
  console.log('✅ Config file exists:', configPath);
  
  // Load and parse config
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  
  console.log('✅ Config is valid JSON');
  console.log('');
  console.log('Configuration Details:');
  console.log('  Model Name:', config.llmConfig.modelName);
  console.log('  Model Path:', config.llmConfig.modelPath);
  console.log('  Temperature:', config.llmConfig.temperature);
  console.log('  Max Tokens:', config.llmConfig.maxTokens);
  console.log('  Context Window:', config.llmConfig.contextWindow);
  console.log('');
} else {
  console.log('❌ Config file not found:', configPath);
  console.log('   Run: ./scripts/bootstrap_local.sh');
  process.exit(1);
}

// Test 2: Check if model directory exists
console.log('📁 Test 2: Model Directory');
console.log('─────────────────────────────────────────────────────────');

const modelDir = './models';
if (fs.existsSync(modelDir)) {
  console.log('✅ Model directory exists:', modelDir);
  
  // Check for model files
  const files = fs.readdirSync(modelDir);
  const modelFiles = files.filter(f => f.endsWith('.gguf'));
  
  if (modelFiles.length > 0) {
    console.log('✅ Found', modelFiles.length, 'model file(s):');
    modelFiles.forEach(f => {
      const stat = fs.statSync(path.join(modelDir, f));
      const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
      console.log(`   - ${f} (${sizeMB} MB)`);
    });
  } else {
    console.log('⚠️  No .gguf model files found');
    console.log('   Run: ./scripts/bootstrap_local.sh to download');
  }
  console.log('');
} else {
  console.log('❌ Model directory not found:', modelDir);
  console.log('   Run: ./scripts/bootstrap_local.sh');
  process.exit(1);
}

// Test 3: Check if integration module exists
console.log('🔌 Test 3: Integration Module');
console.log('─────────────────────────────────────────────────────────');

const modulePath = './nits-vantablack/ml_integration/local_model.js';
if (fs.existsSync(modulePath)) {
  console.log('✅ Integration module exists:', modulePath);
  
  // Try to import (but don't execute if model not present)
  try {
    const module = await import('../ml_integration/local_model.js');
    console.log('✅ Module can be imported');
    console.log('   Exported functions:', Object.keys(module).join(', '));
  } catch (error) {
    console.log('⚠️  Module import warning:', error.message);
  }
  console.log('');
} else {
  console.log('❌ Integration module not found:', modulePath);
  process.exit(1);
}

// Summary
console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║  Configuration Test Complete                         ║');
console.log('╚═══════════════════════════════════════════════════════╝');
console.log('');
console.log('Next Steps:');
console.log('  1. If model not downloaded, run: ./scripts/bootstrap_local.sh');
console.log('  2. Test with examples: node nits-vantablack/examples/example_usage.mjs');
console.log('  3. Use in your code: import { analyzeWithLLM } from "./nits-vantablack/ml_integration/local_model.js"');
console.log('');
