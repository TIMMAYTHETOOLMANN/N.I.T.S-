/**
 * AI Investigator Module
 * 
 * OpenAI-powered intelligence unit for advanced document analysis
 * Integrated with NITS system for SEC, DOJ, IRS, and financial violation detection
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Initialize OpenAI client with API key from environment
 * If no API key is provided, AI analysis will be disabled
 */
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
} catch (error) {
  console.warn('⚠️  OpenAI API key not configured. AI analysis will be disabled.');
}

/**
 * Analyze document content using OpenAI GPT-4 for legal violations
 * 
 * @param prompt - The analysis prompt containing document content
 * @returns AI-generated analysis report
 */
export async function analyzeWithAI(prompt: string): Promise<string> {
  // Check if OpenAI client is initialized
  if (!openai) {
    return 'AI Analysis Unavailable: OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are NITS Embedded AI Investigator. You specialize in identifying SEC, DOJ, IRS, and financial violations in legal documents. Provide detailed analysis citing relevant statutes and regulations.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    return response.choices[0].message?.content || 'No result from AI analysis';
  } catch (error) {
    const err = error as Error;
    console.error('❌ AI Analysis Error:', err.message);
    return `AI Analysis Failed: ${err.message}`;
  }
}
