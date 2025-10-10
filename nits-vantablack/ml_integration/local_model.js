/**
 * Local LLM Integration for NITS
 * 
 * Uses llama-node for local inference with GGUF models
 * Provides summarization and analysis without external API dependencies
 */

import { LLM } from 'llama-node';
import { LLamaCpp } from 'llama-node/dist/llm/llama-cpp.js';
import path from 'path';
import fs from 'fs';

/**
 * Analyze text using local LLM model
 * 
 * @param {string} text - The text to analyze
 * @param {string} mode - Analysis mode: 'summary', 'violations', 'forensic'
 * @param {Object} config - LLM configuration object
 * @returns {Promise<string>} - Analysis result
 */
export async function analyzeWithLLM(text, mode = 'summary', config = null) {
  try {
    // Load configuration
    const llmConfig = config || loadDefaultConfig();
    
    // Validate model file exists
    if (!fs.existsSync(llmConfig.modelPath)) {
      throw new Error(`Model file not found at: ${llmConfig.modelPath}`);
    }

    console.log(`🧠 Initializing local LLM: ${llmConfig.modelName}`);
    
    // Initialize LLM
    const llama = new LLM(LLamaCpp);
    
    await llama.load({
      modelPath: llmConfig.modelPath,
      enableLogging: false,
      nCtx: llmConfig.contextWindow || 8192,
      seed: 0,
      f16Kv: false,
      logitsAll: false,
      vocabOnly: false,
      useMlock: false,
      embedding: false,
      useMmap: true,
    });

    console.log('✅ Model loaded successfully');

    // Build prompt based on mode
    const prompt = buildPrompt(text, mode, llmConfig.systemPrompt);
    
    console.log(`🔍 Running ${mode} analysis...`);

    // Generate response
    let response = '';
    
    await llama.createCompletion({
      nThreads: 4,
      nTokPredict: llmConfig.maxTokens || 2048,
      topK: 40,
      topP: 0.9,
      temp: llmConfig.temperature || 0.7,
      repeatPenalty: 1.1,
      prompt: prompt,
    }, (token) => {
      response += token.token;
      process.stdout.write(token.token);
    });

    console.log('\n✅ Analysis complete');
    
    return response.trim();
    
  } catch (error) {
    console.error('❌ LLM Analysis Error:', error.message);
    throw error;
  }
}

/**
 * Build prompt based on analysis mode
 */
function buildPrompt(text, mode, systemPrompt) {
  const basePrompt = systemPrompt || 'You are a forensic analyst for legal and ESG documents.';
  
  let instruction = '';
  
  switch (mode) {
    case 'summary':
      instruction = 'Provide a concise summary of the following text, highlighting key legal and regulatory points:';
      break;
    case 'violations':
      instruction = 'Analyze the following text for potential legal violations, SEC violations, and regulatory non-compliance:';
      break;
    case 'forensic':
      instruction = 'Perform a detailed forensic analysis of the following text, identifying anomalies, contradictions, and compliance issues:';
      break;
    default:
      instruction = 'Analyze the following text:';
  }
  
  return `${basePrompt}\n\n${instruction}\n\n${text}\n\nAnalysis:`;
}

/**
 * Load default configuration
 */
function loadDefaultConfig() {
  const configPath = path.join(process.cwd(), 'nits-vantablack', 'configs', 'mission_context.json');
  
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);
    return config.llmConfig;
  }
  
  // Fallback configuration
  return {
    modelName: 'nous-hermes-2-mistral-7b',
    runtime: 'llamacpp',
    modelPath: './models/nous-hermes-2-mistral-7b.Q4_K_M.gguf',
    temperature: 0.7,
    maxTokens: 2048,
    contextWindow: 8192,
    systemPrompt: 'You are a forensic analyst for legal and ESG documents.'
  };
}

/**
 * Batch analyze multiple documents
 */
export async function batchAnalyze(documents, mode = 'summary', config = null) {
  const results = [];
  
  for (const doc of documents) {
    console.log(`\n📄 Analyzing: ${doc.name || 'document'}`);
    const result = await analyzeWithLLM(doc.text, mode, config);
    results.push({
      document: doc.name,
      analysis: result
    });
  }
  
  return results;
}
