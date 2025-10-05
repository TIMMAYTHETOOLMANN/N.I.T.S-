import { MLServiceClient, ContradictionResult, SentimentResult } from '../../python_bridge/MLServiceClient';

export interface DocumentPair {
  id: string;
  text: string;
  type: 'SEC_FILING' | 'INTERNAL_DOC' | 'WHISTLEBLOWER' | 'OTHER';
  date?: Date;
  title?: string;
}

export interface SemanticContradiction {
  secDocument: DocumentPair;
  internalDocument: DocumentPair;
  contradictionConfidence: number;
  severity: number;
  contradictionType: 'semantic' | 'factual' | 'temporal' | 'financial';
  evidence: ContradictionEvidence;
  financialSentiment?: {
    secSentiment: SentimentResult;
    internalSentiment: SentimentResult;
    sentimentDivergence: number;
  };
}

export interface ContradictionEvidence {
  secSnippet: string;
  internalSnippet: string;
  confidenceScore: number;
  semanticSimilarity: number;
  contextualAnalysis: string;
}

export interface ContradictionAnalysisResult {
  contradictions: SemanticContradiction[];
  totalPairsAnalyzed: number;
  highSeverityContradictions: number;
  processingTimeMs: number;
  qualityMetrics: {
    averageConfidence: number;
    falsePositiveEstimate: number;
    coverageScore: number;
  };
}

export class SemanticContradictionDetector {
  private mlService: MLServiceClient;
  private readonly SIMILARITY_THRESHOLD = 0.85;
  private readonly CONTRADICTION_THRESHOLD = 0.75;
  private readonly MAX_CANDIDATES = 500;

  constructor(mlServiceUrl: string = 'http://localhost:5000') {
    this.mlService = new MLServiceClient(mlServiceUrl);
  }

  /**
   * Detect semantic contradictions between SEC filings and internal documents
   */
  async detectContradictions(
    secFilings: DocumentPair[],
    internalDocs: DocumentPair[]
  ): Promise<ContradictionAnalysisResult> {
    console.log('🔍 Starting semantic contradiction detection...');
    console.log(`   SEC Filings: ${secFilings.length}`);
    console.log(`   Internal Docs: ${internalDocs.length}`);

    const startTime = Date.now();
    
    try {
      // Step 1: Validate inputs and check ML service availability
      await this.validateInputsAndService(secFilings, internalDocs);

      // Step 2: Prepare text chunks for analysis
      const secChunks = this.prepareTextChunks(secFilings);
      const internalChunks = this.prepareTextChunks(internalDocs);

      // Step 3: Generate embeddings for all chunks
      console.log('📊 Generating embeddings...');
      const secEmbeddings = await this.mlService.generateEmbeddings(secChunks.map(c => c.text));
      const internalEmbeddings = await this.mlService.generateEmbeddings(internalChunks.map(c => c.text));

      // Step 4: Find semantically similar pairs
      console.log('🧮 Computing semantic similarity matrix...');
      const candidatePairs = this.findSimilarPairs(
        secChunks, internalChunks,
        secEmbeddings, internalEmbeddings
      );

      console.log(`   Found ${candidatePairs.length} candidate pairs`);

      // Step 5: Analyze contradictions with cross-encoder
      console.log('⚖️  Running cross-encoder contradiction analysis...');
      const contradictions = await this.analyzeContradictionsWithCrossEncoder(candidatePairs);

      // Step 6: Enhance with financial sentiment analysis
      console.log('💰 Adding financial sentiment analysis...');
      await this.enhanceWithFinancialSentiment(contradictions);

      // Step 7: Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(contradictions, candidatePairs.length);

      const processingTime = Date.now() - startTime;
      const result: ContradictionAnalysisResult = {
        contradictions: contradictions.sort((a, b) => b.severity - a.severity),
        totalPairsAnalyzed: candidatePairs.length,
        highSeverityContradictions: contradictions.filter(c => c.severity > 80).length,
        processingTimeMs: processingTime,
        qualityMetrics
      };

      console.log(`✅ Semantic contradiction detection complete:`);
      console.log(`   Total contradictions found: ${contradictions.length}`);
      console.log(`   High severity contradictions: ${result.highSeverityContradictions}`);
      console.log(`   Processing time: ${(processingTime / 1000).toFixed(2)}s`);
      console.log(`   Average confidence: ${(qualityMetrics.averageConfidence * 100).toFixed(1)}%`);

      return result;

    } catch (error) {
      console.error('❌ Semantic contradiction detection failed:', error);
      throw new Error(`Semantic contradiction detection failed: ${error}`);
    }
  }

  /**
   * Validate inputs and check ML service availability
   */
  private async validateInputsAndService(secFilings: DocumentPair[], internalDocs: DocumentPair[]): Promise<void> {
    if (!secFilings || secFilings.length === 0) {
      throw new Error('No SEC filings provided for analysis');
    }

    if (!internalDocs || internalDocs.length === 0) {
      throw new Error('No internal documents provided for analysis');
    }

    // Check ML service capabilities
    const capabilities = await this.mlService.getCapabilities();
    if (!capabilities.embeddings) {
      throw new Error('ML service embeddings capability not available');
    }

    if (!capabilities.contradiction_detection) {
      throw new Error('ML service contradiction detection capability not available');
    }

    console.log('✅ Input validation and ML service check passed');
  }

  /**
   * Prepare text chunks for embedding analysis
   */
  private prepareTextChunks(documents: DocumentPair[]): Array<{ 
    docId: string; 
    text: string; 
    chunkIndex: number; 
    originalDoc: DocumentPair 
  }> {
    const chunks: Array<{ 
      docId: string; 
      text: string; 
      chunkIndex: number; 
      originalDoc: DocumentPair 
    }> = [];

    for (const doc of documents) {
      // Split document into manageable chunks (max 512 tokens ≈ 2048 characters)
      const maxChunkSize = 2000;
      const sentences = doc.text.match(/[^.!?]+[.!?]+/g) || [doc.text];
      
      let currentChunk = '';
      let chunkIndex = 0;

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
          // Save current chunk and start new one
          chunks.push({
            docId: doc.id,
            text: this.cleanText(currentChunk.trim()),
            chunkIndex: chunkIndex++,
            originalDoc: doc
          });
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      }

      // Add final chunk
      if (currentChunk.trim().length > 50) {
        chunks.push({
          docId: doc.id,
          text: this.cleanText(currentChunk.trim()),
          chunkIndex: chunkIndex,
          originalDoc: doc
        });
      }
    }

    return chunks;
  }

  /**
   * Clean and normalize text for analysis
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?;:()\-"']/g, '') // Remove special characters
      .trim();
  }

  /**
   * Find semantically similar pairs using cosine similarity
   */
  private findSimilarPairs(
    secChunks: Array<{ docId: string; text: string; chunkIndex: number; originalDoc: DocumentPair }>,
    internalChunks: Array<{ docId: string; text: string; chunkIndex: number; originalDoc: DocumentPair }>,
    secEmbeddings: number[][],
    internalEmbeddings: number[][]
  ): Array<{
    secChunk: { docId: string; text: string; chunkIndex: number; originalDoc: DocumentPair };
    internalChunk: { docId: string; text: string; chunkIndex: number; originalDoc: DocumentPair };
    similarity: number;
  }> {
    const candidatePairs: Array<{
      secChunk: { docId: string; text: string; chunkIndex: number; originalDoc: DocumentPair };
      internalChunk: { docId: string; text: string; chunkIndex: number; originalDoc: DocumentPair };
      similarity: number;
    }> = [];

    for (let i = 0; i < secChunks.length; i++) {
      for (let j = 0; j < internalChunks.length; j++) {
        const similarity = this.cosineSimilarity(secEmbeddings[i], internalEmbeddings[j]);
        
        if (similarity >= this.SIMILARITY_THRESHOLD) {
          candidatePairs.push({
            secChunk: secChunks[i],
            internalChunk: internalChunks[j],
            similarity
          });
        }
      }
    }

    // Sort by similarity and take top candidates
    candidatePairs.sort((a, b) => b.similarity - a.similarity);
    return candidatePairs.slice(0, this.MAX_CANDIDATES);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
    }

    const dotProduct = vec1.reduce((sum, val, idx) => sum + val * vec2[idx], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Analyze contradictions using cross-encoder
   */
  private async analyzeContradictionsWithCrossEncoder(candidatePairs: Array<{
    secChunk: { docId: string; text: string; chunkIndex: number; originalDoc: DocumentPair };
    internalChunk: { docId: string; text: string; chunkIndex: number; originalDoc: DocumentPair };
    similarity: number;
  }>): Promise<SemanticContradiction[]> {
    const contradictions: SemanticContradiction[] = [];

    if (candidatePairs.length === 0) {
      return contradictions;
    }

    // Prepare sentence pairs for cross-encoder
    const sentencePairs: [string, string][] = candidatePairs.map(pair => [
      pair.secChunk.text.substring(0, 256), // Truncate for cross-encoder
      pair.internalChunk.text.substring(0, 256)
    ]);

    // Analyze with cross-encoder
    const predictions = await this.mlService.detectContradictions(sentencePairs);

    // Filter for contradictions and create SemanticContradiction objects
    for (let i = 0; i < predictions.length; i++) {
      const prediction = predictions[i];
      const pair = candidatePairs[i];

      if (prediction.label === 'contradiction' && prediction.contradiction_prob >= this.CONTRADICTION_THRESHOLD) {
        const severity = this.calculateSeverity(prediction, pair.secChunk.originalDoc, pair.internalChunk.originalDoc);
        const contradictionType = this.classifyContradictionType(pair.secChunk.text, pair.internalChunk.text);

        const contradiction: SemanticContradiction = {
          secDocument: pair.secChunk.originalDoc,
          internalDocument: pair.internalChunk.originalDoc,
          contradictionConfidence: prediction.contradiction_prob,
          severity,
          contradictionType,
          evidence: {
            secSnippet: this.extractSnippet(pair.secChunk.text, 150),
            internalSnippet: this.extractSnippet(pair.internalChunk.text, 150),
            confidenceScore: prediction.confidence,
            semanticSimilarity: pair.similarity,
            contextualAnalysis: this.generateContextualAnalysis(pair.secChunk.text, pair.internalChunk.text, prediction)
          }
        };

        contradictions.push(contradiction);
      }
    }

    return contradictions;
  }

  /**
   * Calculate severity score for a contradiction
   */
  private calculateSeverity(
    prediction: ContradictionResult, 
    secDoc: DocumentPair, 
    internalDoc: DocumentPair
  ): number {
    let severity = prediction.contradiction_prob * 100;

    // Adjust based on document context
    if (secDoc.text.toLowerCase().includes('material') || 
        secDoc.text.toLowerCase().includes('significant') ||
        secDoc.text.toLowerCase().includes('risk')) {
      severity += 15;
    }

    if (internalDoc.text.toLowerCase().includes('fraud') || 
        internalDoc.text.toLowerCase().includes('misrepresent') ||
        internalDoc.text.toLowerCase().includes('conceal')) {
      severity += 20;
    }

    // Adjust based on document types
    if (secDoc.type === 'SEC_FILING' && internalDoc.type === 'WHISTLEBLOWER') {
      severity += 10;
    }

    // Temporal considerations
    if (secDoc.date && internalDoc.date) {
      const timeDiff = Math.abs(secDoc.date.getTime() - internalDoc.date.getTime());
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      
      if (daysDiff < 30) {
        severity += 10; // Recent documents are more relevant
      }
    }

    return Math.min(100, Math.max(0, severity));
  }

  /**
   * Classify the type of contradiction
   */
  private classifyContradictionType(secText: string, internalText: string): 'semantic' | 'factual' | 'temporal' | 'financial' {
    const financialKeywords = ['revenue', 'profit', 'loss', 'earnings', 'financial', 'cost', 'expense'];
    const temporalKeywords = ['before', 'after', 'when', 'during', 'until', 'since'];
    const factualKeywords = ['fact', 'evidence', 'proof', 'data', 'statistics'];

    const combinedText = (secText + ' ' + internalText).toLowerCase();

    if (financialKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'financial';
    } else if (temporalKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'temporal';
    } else if (factualKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'factual';
    } else {
      return 'semantic';
    }
  }

  /**
   * Generate contextual analysis of the contradiction
   */
  private generateContextualAnalysis(secText: string, internalText: string, prediction: ContradictionResult): string {
    const confidence = (prediction.contradiction_prob * 100).toFixed(1);
    return `High-confidence contradiction detected (${confidence}%). SEC document and internal document present conflicting information on the same topic with ${(prediction.entailment_prob * 100).toFixed(1)}% entailment probability.`;
  }

  /**
   * Extract a snippet from text for evidence
   */
  private extractSnippet(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    // Try to extract at sentence boundaries
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let snippet = '';
    
    for (const sentence of sentences) {
      if (snippet.length + sentence.length <= maxLength) {
        snippet += sentence;
      } else {
        break;
      }
    }
    
    if (snippet.length === 0) {
      snippet = text.substring(0, maxLength);
    }
    
    return snippet + (text.length > maxLength ? '...' : '');
  }

  /**
   * Enhance contradictions with financial sentiment analysis
   */
  private async enhanceWithFinancialSentiment(contradictions: SemanticContradiction[]): Promise<void> {
    try {
      const capabilities = await this.mlService.getCapabilities();
      
      if (!capabilities.financial_sentiment) {
        console.log('⚠️  Financial sentiment analysis not available, skipping enhancement');
        return;
      }

      for (const contradiction of contradictions) {
        try {
          const secSentiments = await this.mlService.analyzeFinancialSentiment([contradiction.evidence.secSnippet]);
          const internalSentiments = await this.mlService.analyzeFinancialSentiment([contradiction.evidence.internalSnippet]);

          if (secSentiments.length > 0 && internalSentiments.length > 0) {
            const secSentiment = secSentiments[0];
            const internalSentiment = internalSentiments[0];
            
            // Calculate sentiment divergence
            const sentimentDivergence = Math.abs(secSentiment.score - internalSentiment.score);
            
            contradiction.financialSentiment = {
              secSentiment,
              internalSentiment,
              sentimentDivergence
            };

            // Adjust severity based on sentiment divergence
            if (sentimentDivergence > 0.5) {
              contradiction.severity = Math.min(100, contradiction.severity + 10);
            }
          }
        } catch (error) {
          console.warn(`Failed to analyze sentiment for contradiction: ${error}`);
        }
      }

      console.log(`✅ Enhanced ${contradictions.length} contradictions with financial sentiment`);

    } catch (error) {
      console.warn('Failed to enhance with financial sentiment:', error);
    }
  }

  /**
   * Calculate quality metrics for the analysis
   */
  private calculateQualityMetrics(contradictions: SemanticContradiction[], totalPairs: number): {
    averageConfidence: number;
    falsePositiveEstimate: number;
    coverageScore: number;
  } {
    if (contradictions.length === 0) {
      return {
        averageConfidence: 0,
        falsePositiveEstimate: 0,
        coverageScore: 0
      };
    }

    // Calculate average confidence
    const averageConfidence = contradictions.reduce((sum, c) => sum + c.contradictionConfidence, 0) / contradictions.length;

    // Estimate false positive rate based on confidence distribution
    const lowConfidenceCount = contradictions.filter(c => c.contradictionConfidence < 0.85).length;
    const falsePositiveEstimate = lowConfidenceCount / contradictions.length;

    // Coverage score based on proportion of analyzed pairs that yielded contradictions
    const coverageScore = Math.min(1.0, contradictions.length / Math.max(1, totalPairs * 0.1));

    return {
      averageConfidence,
      falsePositiveEstimate,
      coverageScore
    };
  }
}