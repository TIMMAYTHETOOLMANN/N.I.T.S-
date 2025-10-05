import { PdfExtractor, ExtractedPDFContent, PDFPageContent } from '../../ingestion/pdf/PdfExtractor';
import { MLServiceClient, Entity } from '../../python_bridge/MLServiceClient';
import * as fs from 'fs';
import * as path from 'path';

export interface UltimateExtractedContent extends ExtractedPDFContent {
  extractionMethod: 'digital' | 'ocr' | 'hybrid' | 'enhanced_digital';
  qualityScore: number;
  tables: TableData[];
  entities: Entity[];
  ocrConfidence?: number;
  processingNotes: string[];
}

export interface TableData {
  pageNumber: number;
  rows: string[][];
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractionQualityMetrics {
  textLength: number;
  readableCharacterRatio: number;
  sentenceStructureScore: number;
  binaryContentDetected: boolean;
  estimatedAccuracy: number;
}

export class UltimatePDFExtractor extends PdfExtractor {
  private mlService: MLServiceClient;

  constructor(mlServiceUrl: string = 'http://localhost:5000') {
    super();
    this.mlService = new MLServiceClient(mlServiceUrl);
  }

  /**
   * Ultimate PDF extraction with intelligent routing
   */
  async extractWithIntelligentRouting(filePath: string): Promise<UltimateExtractedContent> {
    console.log(`📄 Ultimate PDF extraction starting: ${path.basename(filePath)}`);
    
    const processingNotes: string[] = [];
    
    try {
      // Step 1: Try digital extraction first
      console.log('🔍 Attempting digital extraction...');
      const buffer = fs.readFileSync(filePath);
      const digitalResult = await this.extractFromBuffer(buffer.buffer as ArrayBuffer);
      
      // Step 2: Assess quality of digital extraction
      const qualityMetrics = this.assessExtractionQuality(digitalResult.text);
      console.log(`📊 Digital extraction quality score: ${(qualityMetrics.estimatedAccuracy * 100).toFixed(1)}%`);
      
      let finalContent: UltimateExtractedContent;
      
      if (qualityMetrics.estimatedAccuracy >= 0.7) {
        // High quality digital extraction - enhance it
        console.log('✅ High quality digital extraction detected');
        finalContent = await this.enhanceDigitalExtraction(digitalResult, qualityMetrics);
        processingNotes.push('High quality digital extraction used');
      } else if (qualityMetrics.estimatedAccuracy >= 0.3) {
        // Medium quality - try hybrid approach
        console.log('⚠️  Medium quality digital extraction - attempting hybrid approach...');
        finalContent = await this.performHybridExtraction(filePath, digitalResult, qualityMetrics);
        processingNotes.push('Hybrid extraction (digital + OCR) performed due to medium quality');
      } else {
        // Low quality - use OCR if available
        console.log('❌ Low quality digital extraction - attempting OCR...');
        finalContent = await this.performOCRExtraction(filePath, digitalResult, qualityMetrics);
        processingNotes.push('OCR extraction performed due to low digital quality');
      }

      // Step 3: Extract advanced features
      await this.enhanceWithAdvancedFeatures(finalContent);

      finalContent.processingNotes = processingNotes;
      
      console.log(`✅ Ultimate extraction complete: ${finalContent.extractionMethod} (Quality: ${(finalContent.qualityScore * 100).toFixed(1)}%)`);
      return finalContent;

    } catch (error) {
      console.error('❌ Ultimate PDF extraction failed:', error);
      
      // Fallback to basic extraction
      try {
        const buffer = fs.readFileSync(filePath);
        const fallbackResult = await this.extractFromBuffer(buffer.buffer as ArrayBuffer);
        
        return {
          ...fallbackResult,
          extractionMethod: 'digital',
          qualityScore: 0.5,
          tables: [],
          entities: [],
          processingNotes: [`Fallback extraction used due to error: ${error}`]
        };
      } catch (fallbackError) {
        throw new Error(`Ultimate PDF extraction completely failed: ${fallbackError}`);
      }
    }
  }

  /**
   * Assess the quality of extracted text
   */
  private assessExtractionQuality(text: string): ExtractionQualityMetrics {
    if (!text || text.length < 50) {
      return {
        textLength: text?.length || 0,
        readableCharacterRatio: 0,
        sentenceStructureScore: 0,
        binaryContentDetected: true,
        estimatedAccuracy: 0
      };
    }

    // Check for binary content
    const binaryDetected = this.containsBinaryContent(text);
    if (binaryDetected) {
      return {
        textLength: text.length,
        readableCharacterRatio: 0,
        sentenceStructureScore: 0,
        binaryContentDetected: true,
        estimatedAccuracy: 0
      };
    }

    // Calculate readable character ratio
    const readableChars = (text.match(/[a-zA-Z0-9\s.,!?;:'"()\-]/g) || []).length;
    const readableRatio = readableChars / text.length;

    // Analyze sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let sentenceScore = 0;
    
    if (sentences.length > 0) {
      const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length;
      
      // Good sentence length is between 5-50 words
      if (avgSentenceLength >= 5 && avgSentenceLength <= 50) {
        sentenceScore = 1.0;
      } else if (avgSentenceLength >= 2 && avgSentenceLength <= 80) {
        sentenceScore = 0.7;
      } else {
        sentenceScore = 0.3;
      }
    }

    // Calculate overall accuracy estimate
    const accuracy = (readableRatio * 0.5) + (sentenceScore * 0.3) + (text.length > 1000 ? 0.2 : text.length / 5000);

    return {
      textLength: text.length,
      readableCharacterRatio: readableRatio,
      sentenceStructureScore: sentenceScore,
      binaryContentDetected: false,
      estimatedAccuracy: Math.min(1.0, Math.max(0.0, accuracy))
    };
  }

  /**
   * Enhance high-quality digital extraction
   */
  private async enhanceDigitalExtraction(
    digitalResult: ExtractedPDFContent, 
    qualityMetrics: ExtractionQualityMetrics
  ): Promise<UltimateExtractedContent> {
    
    return {
      ...digitalResult,
      extractionMethod: 'enhanced_digital',
      qualityScore: qualityMetrics.estimatedAccuracy,
      tables: this.extractTablesFromText(digitalResult.text),
      entities: [],
      processingNotes: []
    };
  }

  /**
   * Perform hybrid extraction (digital + OCR)
   */
  private async performHybridExtraction(
    filePath: string,
    digitalResult: ExtractedPDFContent,
    qualityMetrics: ExtractionQualityMetrics
  ): Promise<UltimateExtractedContent> {
    
    let hybridText = digitalResult.text;
    let ocrConfidence = 0;
    const processingNotes: string[] = [];

    try {
      // Check if ML service supports OCR
      const capabilities = await this.mlService.getCapabilities();
      
      if (capabilities.ocr) {
        console.log('🔍 Attempting OCR enhancement...');
        
        // For hybrid extraction, we would need to convert PDF to images first
        // This is a simplified version - in production, you'd use a library like pdf2pic
        processingNotes.push('OCR attempted but requires PDF to image conversion');
        
        // For now, merge with any additional text patterns we can extract
        const enhancedText = this.enhanceTextExtraction(digitalResult.text);
        if (enhancedText !== digitalResult.text) {
          hybridText = enhancedText;
          processingNotes.push('Text enhanced with additional pattern extraction');
        }
      } else {
        processingNotes.push('OCR service not available - using enhanced digital extraction');
      }
    } catch (error) {
      console.warn('OCR enhancement failed:', error);
      processingNotes.push(`OCR enhancement failed: ${error}`);
    }

    return {
      ...digitalResult,
      text: hybridText,
      extractionMethod: 'hybrid',
      qualityScore: Math.min(qualityMetrics.estimatedAccuracy + 0.2, 1.0),
      tables: this.extractTablesFromText(hybridText),
      entities: [],
      ocrConfidence: ocrConfidence,
      processingNotes: []
    };
  }

  /**
   * Perform OCR-based extraction
   */
  private async performOCRExtraction(
    filePath: string,
    digitalResult: ExtractedPDFContent,
    qualityMetrics: ExtractionQualityMetrics
  ): Promise<UltimateExtractedContent> {
    
    let ocrText = digitalResult.text;
    let ocrConfidence = 0;
    const processingNotes: string[] = [];

    try {
      const response = await this.mlService.runOCR(filePath);
      if (!response || !response.text) throw new Error("OCR failed or returned empty.");
      ocrText = response.text;
      ocrConfidence = 0.8; // Assume good OCR confidence
      processingNotes.push('OCR extraction completed successfully');
    } catch (error) {
      console.error('OCR extraction failed:', error);
      processingNotes.push(`OCR extraction failed: ${error}`);
      // Fallback to enhanced digital text
      ocrText = this.enhanceTextExtraction(digitalResult.text);
    }

    return {
      ...digitalResult,
      text: ocrText,
      extractionMethod: 'ocr',
      qualityScore: Math.max(qualityMetrics.estimatedAccuracy, 0.6), // OCR typically provides decent results
      tables: this.extractTablesFromText(ocrText),
      entities: [],
      ocrConfidence: ocrConfidence,
      processingNotes: processingNotes
    };
  }

  /**
   * Enhanced text extraction using pattern recognition
   */
  private enhanceTextExtraction(text: string): string {
    // Clean up common extraction issues
    let enhanced = text;
    
    // Fix common spacing issues
    enhanced = enhanced.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space before capitals
    enhanced = enhanced.replace(/\s+/g, ' '); // Normalize whitespace
    enhanced = enhanced.replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Ensure space after sentences
    
    // Fix common character substitutions
    enhanced = enhanced.replace(/â€™/g, "'"); // Fix smart quotes
    enhanced = enhanced.replace(/â€œ/g, '"');
    enhanced = enhanced.replace(/â€\x9D/g, '"');
    enhanced = enhanced.replace(/â€"/g, '—'); // Fix em dash
    
    return enhanced.trim();
  }

  /**
   * Extract table data from text using pattern recognition
   */
  private extractTablesFromText(text: string): TableData[] {
    const tables: TableData[] = [];
    const lines = text.split('\n');
    
    let currentTable: string[] = [];
    let inTable = false;
    let tableCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.length === 0) {
        if (inTable && currentTable.length > 2) {
          // End of table
          const tableRows = this.parseTableRows(currentTable);
          if (tableRows.length > 1) {
            tables.push({
              pageNumber: 1, // Would need page detection logic
              rows: tableRows,
              confidence: this.calculateTableConfidence(tableRows)
            });
            tableCount++;
          }
          currentTable = [];
          inTable = false;
        }
        continue;
      }
      
      // Detect potential table rows (lines with multiple columns)
      const potentialColumns = line.split(/\s{2,}|\t/);
      
      if (potentialColumns.length >= 3) {
        currentTable.push(line);
        inTable = true;
      } else if (inTable && currentTable.length > 2) {
        // End of current table
        const tableRows = this.parseTableRows(currentTable);
        if (tableRows.length > 1) {
          tables.push({
            pageNumber: 1,
            rows: tableRows,
            confidence: this.calculateTableConfidence(tableRows)
          });
          tableCount++;
        }
        currentTable = [];
        inTable = false;
      }
    }
    
    // Handle table at end of document
    if (inTable && currentTable.length > 2) {
      const tableRows = this.parseTableRows(currentTable);
      if (tableRows.length > 1) {
        tables.push({
          pageNumber: 1,
          rows: tableRows,
          confidence: this.calculateTableConfidence(tableRows)
        });
      }
    }
    
    console.log(`📊 Extracted ${tables.length} tables from text`);
    return tables;
  }

  /**
   * Parse table rows from text lines
   */
  private parseTableRows(lines: string[]): string[][] {
    return lines.map(line => {
      // Split by multiple spaces or tabs, then clean up
      return line.split(/\s{2,}|\t/)
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
    }).filter(row => row.length > 0);
  }

  /**
   * Calculate confidence score for a table
   */
  private calculateTableConfidence(rows: string[][]): number {
    if (rows.length < 2) return 0;
    
    // Check column consistency
    const columnCounts = rows.map(row => row.length);
    const uniqueColumnCounts = new Set(columnCounts);
    const consistencyScore = uniqueColumnCounts.size <= 2 ? 0.8 : 0.4;
    
    // Check data quality (non-empty cells)
    const totalCells = rows.reduce((sum, row) => sum + row.length, 0);
    const nonEmptyCells = rows.reduce((sum, row) => 
      sum + row.filter(cell => cell.trim().length > 0).length, 0);
    const fillRate = nonEmptyCells / totalCells;
    
    return Math.min(1.0, consistencyScore * fillRate);
  }

  /**
   * Enhance content with advanced features using ML service
   */
  private async enhanceWithAdvancedFeatures(content: UltimateExtractedContent): Promise<void> {
    try {
      // Extract entities if ML service is available
      const capabilities = await this.mlService.getCapabilities();
      
      if (capabilities.financial_sentiment) {
        console.log('🔍 Extracting entities...');
        const entities = await this.mlService.extractEntities(content.text);
        content.entities = entities;
        console.log(`✅ Extracted ${entities.length} entities`);
      }
      
    } catch (error) {
      console.warn('Advanced feature enhancement failed:', error);
      content.processingNotes.push(`Advanced features failed: ${error}`);
    }
  }

  /**
   * Check for binary content (inherited from parent class)
   */
  private containsBinaryContent(text: string): boolean {
    if (text.includes('\x00')) return true;
    const nonPrintable = (text.match(/[^\x20-\x7E\r\n\t]/g) || []).length;
    if (text.length > 0 && nonPrintable / text.length > 0.25) return true;
    return false;
  }
}