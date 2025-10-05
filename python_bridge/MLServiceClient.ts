import axios, { AxiosResponse } from 'axios';

export interface EmbeddingResponse {
  embeddings: number[][];
  dimension: number;
  count: number;
}

export interface ContradictionResult {
  pair_index: number;
  contradiction_prob: number;
  entailment_prob: number;
  neutral_prob: number;
  label: 'contradiction' | 'entailment' | 'neutral';
  confidence: number;
}

export interface ContradictionResponse {
  results: ContradictionResult[];
}

export interface SentimentResult {
  text: string;
  label: string;
  score: number;
  error?: string;
}

export interface SentimentResponse {
  sentiments: SentimentResult[];
}

export interface OCRResponse {
  text: string;
  detailed_results: Array<{
    text: string;
    confidence: number;
  }>;
  total_items: number;
}

export interface Entity {
  type: 'MONEY' | 'REGULATION' | 'DATE' | 'ORGANIZATION';
  text: string;
  value?: number;
  position: number;
}

export interface EntityResponse {
  entities: Entity[];
  count: number;
}

export interface HealthResponse {
  status: string;
  models_loaded: boolean;
  available_services: {
    embeddings: boolean;
    contradiction_detection: boolean;
    ocr: boolean;
    financial_sentiment: boolean;
  };
}

export class MLServiceClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:5000', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Check if the ML service is healthy and models are loaded
   */
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response: AxiosResponse<HealthResponse> = await axios.get(
        `${this.baseUrl}/health`,
        { timeout: this.timeout }
      );
      return response.data;
    } catch (error) {
      console.error('ML Service health check failed:', error);
      throw new Error(`ML Service health check failed: ${error}`);
    }
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) {
      throw new Error('No texts provided for embedding generation');
    }

    try {
      const response: AxiosResponse<EmbeddingResponse> = await axios.post(
        `${this.baseUrl}/embed`,
        { texts: texts },
        { 
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data.embeddings;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Embedding generation failed: ${error}`);
    }
  }

  /**
   * Detect contradictions between sentence pairs using cross-encoder
   */
  async detectContradictions(sentencePairs: [string, string][]): Promise<ContradictionResult[]> {
    if (!sentencePairs || sentencePairs.length === 0) {
      throw new Error('No sentence pairs provided for contradiction detection');
    }

    try {
      const response: AxiosResponse<ContradictionResponse> = await axios.post(
        `${this.baseUrl}/contradiction`,
        { pairs: sentencePairs },
        { 
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data.results;
    } catch (error) {
      console.error('Contradiction detection failed:', error);
      throw new Error(`Contradiction detection failed: ${error}`);
    }
  }

  /**
   * Analyze financial sentiment using FinBERT or fallback model
   */
  async analyzeFinancialSentiment(texts: string[]): Promise<SentimentResult[]> {
    if (!texts || texts.length === 0) {
      throw new Error('No texts provided for sentiment analysis');
    }

    try {
      const response: AxiosResponse<SentimentResponse> = await axios.post(
        `${this.baseUrl}/financial_sentiment`,
        { texts: texts },
        { 
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data.sentiments;
    } catch (error) {
      console.error('Financial sentiment analysis failed:', error);
      throw new Error(`Financial sentiment analysis failed: ${error}`);
    }
  }

  /**
   * Perform OCR on base64-encoded image data
   */
  async performOCR(imageBase64: string): Promise<string> {
    if (!imageBase64) {
      throw new Error('No image data provided for OCR');
    }

    try {
      const response: AxiosResponse<OCRResponse> = await axios.post(
        `${this.baseUrl}/ocr`,
        { image: imageBase64 },
        { 
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data.text;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error}`);
    }
  }

  /**
   * Get detailed OCR results with confidence scores
   */
  async performDetailedOCR(imageBase64: string): Promise<OCRResponse> {
    if (!imageBase64) {
      throw new Error('No image data provided for OCR');
    }

    try {
      const response: AxiosResponse<OCRResponse> = await axios.post(
        `${this.baseUrl}/ocr`,
        { image: imageBase64 },
        { 
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Detailed OCR processing failed:', error);
      throw new Error(`Detailed OCR processing failed: ${error}`);
    }
  }

  /**
   * Extract financial and legal entities from text
   */
  async extractEntities(text: string): Promise<Entity[]> {
    if (!text) {
      throw new Error('No text provided for entity extraction');
    }

    try {
      const response: AxiosResponse<EntityResponse> = await axios.post(
        `${this.baseUrl}/extract_entities`,
        { text: text },
        { 
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data.entities;
    } catch (error) {
      console.error('Entity extraction failed:', error);
      throw new Error(`Entity extraction failed: ${error}`);
    }
  }

  /**
   * Run OCR on PDF file
   */
  async runOCR(pdfPath: string): Promise<{ text: string }> {
    if (!pdfPath) {
      throw new Error('No PDF path provided for OCR');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/ocr`,
        { pdf_path: pdfPath },
        { 
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error}`);
    }
  }

  /**
   * Check if ML service is available and ready
   */
  async isServiceReady(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'healthy' && health.models_loaded;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for ML service to become ready with timeout
   */
  async waitForService(maxWaitMs: number = 60000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 2000; // Check every 2 seconds

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const ready = await this.isServiceReady();
        if (ready) {
          console.log('✅ ML Service is ready');
          return true;
        }
        console.log('⏳ Waiting for ML Service to initialize...');
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        // Service not yet available, continue waiting
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    console.error('❌ ML Service failed to become ready within timeout');
    return false;
  }

  /**
   * Get service capabilities
   */
  async getCapabilities(): Promise<{
    embeddings: boolean;
    contradiction_detection: boolean;
    ocr: boolean;
    financial_sentiment: boolean;
  }> {
    try {
      const health = await this.healthCheck();
      return health.available_services;
    } catch (error) {
      return {
        embeddings: false,
        contradiction_detection: false,
        ocr: false,
        financial_sentiment: false
      };
    }
  }

  /**
   * Batch process multiple texts with embeddings
   */
  async batchEmbeddings(texts: string[], batchSize: number = 32): Promise<number[][]> {
    if (!texts || texts.length === 0) {
      return [];
    }

    const results: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      try {
        const embeddings = await this.generateEmbeddings(batch);
        results.push(...embeddings);
      } catch (error) {
        console.error(`Batch embedding failed for batch starting at index ${i}:`, error);
        // Add empty embeddings as placeholders for failed batch
        const emptyEmbeddings = new Array(batch.length).fill([]);
        results.push(...emptyEmbeddings);
      }
    }

    return results;
  }
}