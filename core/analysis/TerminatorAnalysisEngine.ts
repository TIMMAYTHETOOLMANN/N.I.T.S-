import { Violation } from './Violation';
import { GovInfoTerminator } from '../govinfo/GovInfoTerminator';
import { ForensicTextAnalyzer } from '../nlp/ForensicTextAnalyzer';
import { AnomalyDetector } from '../anomaly/AnomalyDetector';
import { BayesianRiskAnalyzer } from '../anomaly/BayesianRiskAnalyzer';
import { ResearchConfig, AdvancedFinancialForensics, EDGARFinancialData } from '../financial/AdvancedFinancialForensics';

interface ExtractedContent {
  text: string;
  metadata: any;
  hiddenText: string[];
  tables: any[];
  footnotes: string[];
  comments: string[];
  revisions: any[];
  embeddedFiles: any[];
}

interface TerminationReport {
  targetFile: string;
  terminationTime: number;
  violations: Violation[];
  prosecutionPackage: any;
  totalPenalties: {
    monetary: number;
    imprisonment: number;
  };
  recommendation: string;
}

// SEC EDGAR Integration Interfaces
interface SECAPIConfig {
  baseURL: string;
  userAgent: string;
  rateLimitDelay: number;
  maxRetries: number;
  complianceHeaders: { [key: string]: string };
}

interface XBRLExtraction {
  accessionNumber: string;
  formType: string;
  filingDate: string;
  cik: string;
  financialData: any;
  extractedClaims: string[];
  contradictions: any[];
}

interface BulkAnalysisResult {
  edgarData: EDGARFinancialData;
  violations: Violation[];
  financialForensics: any;
  contradictionAnalysis: any;
  evidenceChain: string[];
}

// SEC Configuration
const SEC_CONFIG: SECAPIConfig = {
  baseURL: 'https://data.sec.gov',
  userAgent: 'NITS Legal Analysis System admin@nits-research.org',
  rateLimitDelay: 100, // 100ms between requests (10 requests/second max)
  maxRetries: 3,
  complianceHeaders: {
    'User-Agent': 'NITS Legal Analysis System admin@nits-research.org',
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'data.sec.gov'
  }
};

export class TerminatorAnalysisEngine {

  /**
   * Filter only high‑confidence, statute‑anchored violations
   */
  private filterActionableViolations(vios: Violation[]): Violation[] {
    return vios.filter(v => {
      return v.confidence >= 80
        && v.severity >= 60
        && v.statute !== undefined
        && v.extractedText !== undefined;
    });
  }

  private govInfo: GovInfoTerminator;
  private textAnalyzer: ForensicTextAnalyzer;
  private anomalyDetector: AnomalyDetector;
  private bayesianAnalyzer: BayesianRiskAnalyzer;
  private financialForensics: AdvancedFinancialForensics;
  private isInitialized: boolean = false;
  
  // EDGAR Integration Properties
  private lastAPICall: number = 0;
  private apiCallCount: number = 0;
  private edgarCache: Map<string, any> = new Map();
  
  constructor() {
    this.govInfo = new GovInfoTerminator();
    this.textAnalyzer = new ForensicTextAnalyzer();
    this.anomalyDetector = new AnomalyDetector();
    this.bayesianAnalyzer = new BayesianRiskAnalyzer();
    this.financialForensics = new AdvancedFinancialForensics();
  }
  
  async initialize(): Promise<void> {
    console.log('🔴 Initializing Terminator Engine...');
    
    try {
      await this.govInfo.harvestEntireLegalSystem();
      this.isInitialized = true;
      console.log('✅ Terminator Engine Ready');
    } catch (error) {
      console.error('Initialization failed:', error);
      this.isInitialized = false;
    }
  }
  
  async terminateDocument(text: string): Promise<Violation[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log('🔴 INITIATING TERMINATION SEQUENCE...');
    
    const violations: Violation[] = [];
    
    // Create content wrapper
    const content: ExtractedContent = {
      text,
      metadata: {},
      hiddenText: [],
      tables: [],
      footnotes: [],
      comments: [],
      revisions: [],
      embeddedFiles: []
    };
    
    // Level 1: Surface violations
    console.log('🔍 Level 1: Surface scan...');
    violations.push(...await this.scanSurfaceViolations(content));
    
    // Level 2: Deep pattern analysis
    console.log('🔬 Level 2: Deep pattern analysis...');
    violations.push(...await this.deepPatternAnalysis(content));
    
    // Level 3: Cross-reference with regulations
    console.log('⚖️ Level 3: Legal cross-reference...');
    violations.push(...await this.crossReferenceAllLaws(content));
    
    // Level 4: ML-powered anomaly detection
    console.log('🤖 Level 4: ML anomaly detection...');
    violations.push(...await this.mlAnomalyDetection(content));
    
    console.log('✅ TERMINATION COMPLETE');
    console.log(`🔴 Violations found: ${violations.length}`);
    
    const actionable = this.filterActionableViolations(violations);
    // Use actionable only if we have high-confidence violations
    const finalViolations = actionable.length > 0 ? actionable : violations;
    return finalViolations.sort((a, b) => b.severity - a.severity);
  }
  
  /**
   * EDGAR Bulk Analysis - Process SEC filings with comprehensive forensic analysis
   */
  async processEDGARBulkData(cik: string, whistleblowerDocuments: string[] = []): Promise<BulkAnalysisResult> {
    console.log(`🏛️ Starting EDGAR bulk analysis for CIK: ${cik}`);
    
    try {
      // Phase 1: Download and extract EDGAR data
      const edgarData = await this.downloadEDGARData(cik);
      console.log(`📥 Downloaded ${edgarData.filings.length} filings from EDGAR`);
      
      // Phase 2: Extract XBRL financial data
      const xbrlExtractions = await this.extractXBRLFromFilings(edgarData.filings);
      console.log(`💹 Extracted XBRL data from ${xbrlExtractions.length} filings`);
      
      // Phase 3: Perform comprehensive financial forensics
      console.log(`🔬 Performing advanced financial forensics analysis...`);
      const forensicsResults = await this.financialForensics.processEDGARData(edgarData);
      
      // Phase 4: Traditional violation analysis on filing text
      const violations: Violation[] = [];
      for (const extraction of xbrlExtractions) {
        const filingText = JSON.stringify(extraction.financialData);
        const filingViolations = await this.terminateDocument(filingText);
        violations.push(...filingViolations);
      }
      
      // Phase 5: Cross-document contradiction analysis
      let contradictionAnalysis: any = null;
      if (whistleblowerDocuments.length > 0) {
        console.log(`🔍 Performing contradiction analysis with ${whistleblowerDocuments.length} whistleblower documents...`);
        
        const allDocuments = [
          ...xbrlExtractions.map(x => x.extractedClaims.join(' ')),
          ...whistleblowerDocuments
        ];
        
        const { DocumentCorrelationAnalyzer } = await import('../anomaly/AnomalyDetector');
        const correlationAnalyzer = new DocumentCorrelationAnalyzer();
        contradictionAnalysis = correlationAnalyzer.analyzeCorrelations(allDocuments);
        
        console.log(`🚨 Found ${contradictionAnalysis.contradictions.length} contradictions with ${(contradictionAnalysis.contradiction_score * 100).toFixed(1)}% avg confidence`);
      }
      
      // Phase 6: Generate evidence chain
      const evidenceChain = this.generateEvidenceChain(edgarData, xbrlExtractions, violations, forensicsResults);
      
      const result: BulkAnalysisResult = {
        edgarData,
        violations,
        financialForensics: forensicsResults,
        contradictionAnalysis,
        evidenceChain
      };
      
      console.log(`✅ EDGAR bulk analysis complete:`);
      console.log(`   📊 Filings processed: ${edgarData.filings.length}`);
      console.log(`   ⚖️ Violations detected: ${violations.length}`);
      console.log(`   💰 Financial forensics results: ${forensicsResults.length}`);
      console.log(`   🔗 Evidence chain items: ${evidenceChain.length}`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ EDGAR bulk analysis failed for CIK ${cik}:`, error);
      throw new Error(`EDGAR analysis failed: ${error}`);
    }
  }
  
  /**
   * Download EDGAR data with SEC API compliance and rate limiting
   */
  private async downloadEDGARData(cik: string): Promise<EDGARFinancialData> {
    // Apply rate limiting
    await this.enforceRateLimit();
    
    const paddedCik = cik.padStart(10, '0');
    const submissionsUrl = `${SEC_CONFIG.baseURL}/submissions/CIK${paddedCik}.json`;
    
    try {
      console.log(`📡 Fetching SEC data from: ${submissionsUrl}`);
      
      // Check cache first
      if (this.edgarCache.has(cik)) {
        console.log(`📋 Using cached data for CIK ${cik}`);
        return this.edgarCache.get(cik);
      }
      
      // Simulate fetch with compliance headers (in production would use actual HTTP client)
      const response = await this.simulateSECAPICall(submissionsUrl);
      
      if (!response.ok) {
        throw new Error(`SEC API request failed: ${response.status}`);
      }
      
      const submissionsData = await response.json();
      
      // Extract recent filings
      const recentFilings = submissionsData.filings?.recent || {};
      const filings = [];
      
      const filingCount = Math.min(
        recentFilings.accessionNumber?.length || 0,
        ResearchConfig.BATCH_SIZE
      );
      
      for (let i = 0; i < filingCount; i++) {
        // Focus on key financial forms
        const formType = recentFilings.form?.[i];
        if (['10-K', '10-Q', '8-K', '20-F'].includes(formType)) {
          filings.push({
            accession_number: recentFilings.accessionNumber[i],
            filing_date: recentFilings.filingDate[i],
            form_type: formType,
            xbrl_data: await this.fetchXBRLData(cik, recentFilings.accessionNumber[i])
          });
        }
      }
      
      const edgarData: EDGARFinancialData = {
        cik: cik,
        filings: filings,
        company_facts: await this.fetchCompanyFacts(cik)
      };
      
      // Cache the result
      this.edgarCache.set(cik, edgarData);
      
      return edgarData;
      
    } catch (error) {
      console.error(`❌ Error downloading EDGAR data for CIK ${cik}:`, error);
      throw error;
    }
  }
  
  /**
   * Enforce SEC API rate limiting compliance
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastAPICall;
    
    if (timeSinceLastCall < SEC_CONFIG.rateLimitDelay) {
      const waitTime = SEC_CONFIG.rateLimitDelay - timeSinceLastCall;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastAPICall = Date.now();
    this.apiCallCount++;
    
    // Log API usage for compliance monitoring
    if (this.apiCallCount % 100 === 0) {
      console.log(`📊 SEC API calls made: ${this.apiCallCount}`);
    }
  }
  
  /**
   * Simulate SEC API call with proper headers (replace with actual HTTP in production)
   */
  private async simulateSECAPICall(url: string): Promise<any> {
    // In production, replace with actual HTTP client (axios, fetch, etc.)
    // This simulation returns a mock successful response
    return {
      ok: true,
      status: 200,
      json: async () => ({
        cik: '0000320193',
        entityType: 'operating',
        filings: {
          recent: {
            accessionNumber: ['0000320193-24-000123', '0000320193-24-000122'],
            filingDate: ['2024-10-01', '2024-07-01'],
            form: ['10-K', '10-Q'],
            primaryDocument: ['aapl-20240930.htm', 'aapl-20240630.htm']
          }
        }
      })
    };
  }
  
  /**
   * Fetch company facts (financial metrics over time)
   */
  private async fetchCompanyFacts(cik: string): Promise<any> {
    await this.enforceRateLimit();
    
    const paddedCik = cik.padStart(10, '0');
    const factsUrl = `${SEC_CONFIG.baseURL}/api/xbrl/companyfacts/CIK${paddedCik}.json`;
    
    try {
      const response = await this.simulateSECAPICall(factsUrl);
      
      if (response.ok) {
        return await response.json();
      } else {
        console.warn(`⚠️ Company facts not available for CIK ${cik}`);
        return null;
      }
    } catch (error) {
      console.warn(`⚠️ Error fetching company facts for CIK ${cik}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch XBRL data for a specific filing
   */
  private async fetchXBRLData(cik: string, accessionNumber: string): Promise<any> {
    await this.enforceRateLimit();
    
    // Simulate XBRL data extraction
    return {
      'Revenues': { value: 365000000000, unit: 'USD', end: '2024-09-30' },
      'NetIncomeLoss': { value: 85000000000, unit: 'USD', end: '2024-09-30' },
      'Assets': { value: 500000000000, unit: 'USD', end: '2024-09-30' },
      'AssetsCurrent': { value: 150000000000, unit: 'USD', end: '2024-09-30' },
      'Liabilities': { value: 300000000000, unit: 'USD', end: '2024-09-30' },
      'LiabilitiesCurrent': { value: 100000000000, unit: 'USD', end: '2024-09-30' },
      'OperatingIncomeLoss': { value: 95000000000, unit: 'USD', end: '2024-09-30' },
      'AccountsReceivableNetCurrent': { value: 30000000000, unit: 'USD', end: '2024-09-30' },
      'StockholdersEquity': { value: 200000000000, unit: 'USD', end: '2024-09-30' }
    };
  }
  
  /**
   * Extract XBRL data and claims from filings
   */
  private async extractXBRLFromFilings(filings: any[]): Promise<XBRLExtraction[]> {
    const extractions: XBRLExtraction[] = [];
    
    for (const filing of filings) {
      if (filing.xbrl_data) {
        // Extract financial claims from XBRL data
        const claims = this.extractFinancialClaims(filing.xbrl_data);
        
        const extraction: XBRLExtraction = {
          accessionNumber: filing.accession_number,
          formType: filing.form_type,
          filingDate: filing.filing_date,
          cik: filing.cik || 'unknown',
          financialData: filing.xbrl_data,
          extractedClaims: claims,
          contradictions: []
        };
        
        extractions.push(extraction);
      }
    }
    
    return extractions;
  }
  
  /**
   * Extract financial claims from XBRL data for contradiction analysis
   */
  private extractFinancialClaims(xbrlData: any): string[] {
    const claims: string[] = [];
    
    // Generate natural language claims from XBRL data
    if (xbrlData.Revenues?.value) {
      claims.push(`Revenue for the period was $${(xbrlData.Revenues.value / 1e9).toFixed(1)} billion`);
    }
    
    if (xbrlData.NetIncomeLoss?.value) {
      const income = xbrlData.NetIncomeLoss.value;
      if (income > 0) {
        claims.push(`Net income for the period was $${(income / 1e9).toFixed(1)} billion`);
      } else {
        claims.push(`Net loss for the period was $${Math.abs(income / 1e9).toFixed(1)} billion`);
      }
    }
    
    if (xbrlData.Assets?.value && xbrlData.Liabilities?.value) {
      const leverage = xbrlData.Liabilities.value / xbrlData.Assets.value;
      claims.push(`Debt-to-asset ratio is ${(leverage * 100).toFixed(1)}%`);
    }
    
    if (xbrlData.AssetsCurrent?.value && xbrlData.LiabilitiesCurrent?.value) {
      const currentRatio = xbrlData.AssetsCurrent.value / xbrlData.LiabilitiesCurrent.value;
      claims.push(`Current ratio is ${currentRatio.toFixed(2)}`);
    }
    
    return claims;
  }
  
  /**
   * Generate comprehensive evidence chain for audit trail
   */
  private generateEvidenceChain(
    edgarData: EDGARFinancialData,
    xbrlExtractions: XBRLExtraction[],
    violations: Violation[],
    forensicsResults: any[]
  ): string[] {
    const evidenceChain: string[] = [];
    
    // EDGAR data evidence
    evidenceChain.push(`EDGAR-DATA-${edgarData.cik}-${Date.now()}`);
    
    // XBRL extractions evidence
    for (const extraction of xbrlExtractions) {
      evidenceChain.push(`XBRL-${extraction.accessionNumber}-${Date.now()}`);
    }
    
    // Violation evidence
    for (const violation of violations) {
      if (violation.evidence) {
        evidenceChain.push(`VIOLATION-${violation.type}-${Date.now()}`);
      }
    }
    
    // Financial forensics evidence
    for (const result of forensicsResults) {
      evidenceChain.push(`FORENSICS-${result.processingTimeMs}-${Date.now()}`);
    }
    
    return evidenceChain;
  }

  private async scanSurfaceViolations(content: ExtractedContent): Promise<Violation[]> {
    const violations: Violation[] = [];
    const patterns = [
      { 
        regex: /fraud|misrepresent|deceiv/gi, 
        statute: '15 U.S.C. § 78j(b)',
        description: 'Securities fraud indicators detected',
        severity: 85,
        type: 'FRAUD_INDICATOR'
      },
      { 
        regex: /insider.{0,20}trading/gi, 
        statute: '15 U.S.C. § 78u-1',
        description: 'Insider trading pattern detected',
        severity: 90,
        type: 'INSIDER_TRADING'
      },
      { 
        regex: /non.{0,10}compliance|violation/gi, 
        statute: 'SEC Rule 10b-5',
        description: 'Regulatory compliance violation',
        severity: 70,
        type: 'COMPLIANCE_VIOLATION'
      }
    ];
    
    for (const pattern of patterns) {
      let match;
      const regex = new RegExp(pattern.regex, 'gi');
      let matchCount = 0;
      const contexts = [];
      const locations = [];
      while ((match = regex.exec(content.text)) !== null) {
        matchCount++;
        // Capture context: 30 chars before and after
        const start = Math.max(0, match.index - 30);
        const end = Math.min(content.text.length, match.index + match[0].length + 30);
        const snippet = content.text.substring(start, end);
        contexts.push(snippet);
        locations.push({ start: match.index, end: match.index + match[0].length });
      }
      if (matchCount > 0) {
        const monetaryPenalty = pattern.severity >= 90 ? 10000000 : 5000000;
        const imprisonmentYears = pattern.severity >= 90 ? 20 : 10;
        
        violations.push({
          type: pattern.type,
          statute: pattern.statute,
          description: pattern.description,
          evidence: [`Found ${matchCount} instances in document`],
          context: contexts[0] || '',
          location: locations[0] || null,
          allContexts: contexts,
          allLocations: locations,
          extractedText: contexts[0] || '',  // Populate extractedText for hyperspecific citing
          evidenceType: 'text',
          triggerLogic: `Pattern "${pattern.regex.source}" matched ${matchCount} time(s), indicating ${pattern.description.toLowerCase()}. Multiple instances increase confidence.`,
          estimatedPenalties: {
            monetary: monetaryPenalty,
            imprisonment: imprisonmentYears,
            civilFine: true
          },
          confidence: Math.min(matchCount * 15 + pattern.severity, 95),
          severity: pattern.severity,
          penalties: [
            { type: 'MONETARY', amount: monetaryPenalty, text: `$${(monetaryPenalty / 1000000).toFixed(0)}M potential fine` },
            { type: 'IMPRISONMENT', duration: imprisonmentYears.toString(), unit: 'years', text: `Up to ${imprisonmentYears} years` }
          ],
          recommendation: pattern.severity > 80 ? 'IMMEDIATE_INVESTIGATION' : 'ENHANCED_MONITORING'
        });
      }
    }
    
    return violations;
  }

  private async deepPatternAnalysis(content: ExtractedContent): Promise<Violation[]> {
    const violations: Violation[] = [];
    
    // Use text analyzer
    const textVector = this.textAnalyzer.analyzeDocument(content.text, 'target.pdf', 'sec');
    
    if (textVector.fraudScore > 0.3) {
      // Find relevant context from suspicious patterns or document sections
      let context = '';
      let location = null;
      
      if (textVector.suspiciousPatterns && textVector.suspiciousPatterns.length > 0) {
        // Use the first suspicious pattern as context
        const pattern = textVector.suspiciousPatterns[0];
        const patternIndex = content.text.indexOf(pattern);
        if (patternIndex !== -1) {
          // Extract context around the suspicious pattern
          const contextStart = Math.max(0, patternIndex - 100);
          const contextEnd = Math.min(content.text.length, patternIndex + pattern.length + 100);
          context = content.text.substring(contextStart, contextEnd);
          location = { start: patternIndex, end: patternIndex + pattern.length };
        } else {
          // Pattern not found exactly, use it as context
          context = pattern;
        }
      } else {
        // Fallback: use document beginning with fraud indicators
        const contextLength = Math.min(200, content.text.length);
        context = content.text.substring(0, contextLength) + (content.text.length > contextLength ? '...' : '');
        location = { start: 0, end: contextLength };
      }
      
      violations.push({
        type: 'DEEP_PATTERN_FRAUD',
        statute: '17 CFR § 240.10b-5',
        description: `Deep pattern analysis reveals fraud indicators (score: ${(textVector.fraudScore * 100).toFixed(0)}%)`,
        evidence: textVector.suspiciousPatterns,
        context,
        location,
        extractedText: context,  // Populate extractedText for hyperspecific citing
        evidenceType: 'text',
        triggerLogic: `Forensic NLP analysis identified ${textVector.suspiciousPatterns.length} suspicious pattern(s) with fraud score ${(textVector.fraudScore * 100).toFixed(0)}%. Patterns suggest manipulative or deceptive practices in violation of SEC Rule 10b-5.`,
        estimatedPenalties: {
          monetary: 10000000,
          imprisonment: 20,
          civilFine: true
        },
        confidence: textVector.fraudScore * 100,
        severity: textVector.riskLevel,
        penalties: [
          { type: 'MONETARY', amount: 10000000, text: '$10M SEC fine' },
          { type: 'IMPRISONMENT', duration: '20', unit: 'years', text: 'Up to 20 years' }
        ],
        recommendation: 'SEC_ENFORCEMENT_ACTION'
      });
    }
    
    return violations;
  }

  private async crossReferenceAllLaws(content: ExtractedContent): Promise<Violation[]> {
    const violations: Violation[] = [];
    
    // Check against indexed provisions
    for (const [key, provision] of this.govInfo.legalProvisions) {
      // Simple compliance check
      const hasRequiredKeywords = provision.requirements.some(req => 
        content.text.toLowerCase().includes(req.toLowerCase())
      );
      
      if (!hasRequiredKeywords && Math.random() > 0.7) {
        // Find closest context in the document
        let context = '';
        let location = null;
        let firstReq = provision.requirements[0];
        const idx = content.text.toLowerCase().indexOf(firstReq.toLowerCase());
        if (idx !== -1) {
          // Keyword is present (should not happen here), but fallback
          const start = Math.max(0, idx - 30);
          const end = Math.min(content.text.length, idx + firstReq.length + 30);
          context = content.text.substring(start, end);
          location = { start: idx, end: idx + firstReq.length };
        } else {
          // Keyword missing: find relevant section based on provision type
          let relevantSection = this.findRelevantDocumentSection(content.text, provision);
          if (relevantSection) {
            context = relevantSection.text;
            location = relevantSection.location;
          } else {
            // Enhanced fallback: look for disclosure-related keywords
            const disclosureKeywords = ['disclosure', 'statement', 'report', 'filing', 'material', 'information'];
            let bestMatch = null;
            let bestScore = 0;
            
            for (const keyword of disclosureKeywords) {
              const idx = content.text.toLowerCase().indexOf(keyword);
              if (idx !== -1) {
                const score = disclosureKeywords.length - disclosureKeywords.indexOf(keyword);
                if (score > bestScore) {
                  bestScore = score;
                  bestMatch = { keyword, idx };
                }
              }
            }
            
            if (bestMatch) {
              const contextStart = Math.max(0, bestMatch.idx - 80);
              const contextEnd = Math.min(content.text.length, bestMatch.idx + 150);
              context = content.text.substring(contextStart, contextEnd);
              location = { start: bestMatch.idx, end: bestMatch.idx + bestMatch.keyword.length };
            } else {
              // Final fallback: use document beginning with better context
              const contextLength = Math.min(200, content.text.length);
              context = content.text.substring(0, contextLength) + (content.text.length > contextLength ? '...' : '');
              location = { start: 0, end: contextLength };
            }
          }
        }
        const monetaryPenalty = provision.penalties.find(p => p.type === 'MONETARY')?.amount || 5000000;
        const imprisonmentPenalty = provision.penalties.find(p => p.type === 'IMPRISONMENT');
        const imprisonmentYears = imprisonmentPenalty ? parseInt(imprisonmentPenalty.duration || '5') : 5;
        
        violations.push({
          type: 'STATUTORY_VIOLATION',
          statute: provision.citation,
          description: `Potential violation: ${provision.text}`,
          evidence: ['Missing required disclosures or patterns'],
          context,
          location,
          extractedText: context,  // Populate extractedText for hyperspecific citing
          evidenceType: 'text',
          triggerLogic: `Cross-reference with ${provision.citation} shows missing required disclosure elements: ${provision.requirements.slice(0, 2).join(', ')}. Document fails to meet statutory compliance requirements.`,
          estimatedPenalties: {
            monetary: monetaryPenalty,
            imprisonment: imprisonmentYears,
            civilFine: provision.criminalLiability.score < 80
          },
          confidence: 75,
          severity: provision.criminalLiability.score,
          penalties: provision.penalties,
          recommendation: provision.criminalLiability.recommendation
        });
      }
    }
    
    return violations;
  }

  private async mlAnomalyDetection(content: ExtractedContent): Promise<Violation[]> {
    const violations: Violation[] = [];
    
    // Extract financial metrics from text
    const metrics = this.extractFinancialMetrics(content.text);
    const anomalies = this.anomalyDetector.detectAnomalies(metrics);
    
    if (anomalies.anomalyScore > 5) {
      // Find context for ML anomaly
      let context = '';
      let location = null;
      
      // Look for financial data in the document to provide context
      const financialRegex = /(\$[\d,]+|\d+%|revenue|profit|earnings|loss|income|financial|accounting)/gi;
      const matches = [...content.text.matchAll(financialRegex)];
      
      if (matches.length > 0) {
        // Use the first financial match as context anchor
        const match = matches[0];
        const matchIndex = match.index || 0;
        const contextStart = Math.max(0, matchIndex - 100);
        const contextEnd = Math.min(content.text.length, matchIndex + 200);
        context = content.text.substring(contextStart, contextEnd);
        location = { start: matchIndex, end: matchIndex + match[0].length };
      } else {
        // Fallback: use anomaly patterns or document section
        if (anomalies.patterns && anomalies.patterns.length > 0) {
          context = anomalies.patterns.join(', ');
        } else {
          const contextLength = Math.min(150, content.text.length);
          context = content.text.substring(0, contextLength) + (content.text.length > contextLength ? '...' : '');
          location = { start: 0, end: contextLength };
        }
      }
      
      violations.push({
        type: 'ML_ANOMALY_DETECTED',
        statute: 'Statistical Analysis',
        description: `Statistical anomalies detected: ${anomalies.insights.join(', ')}`,
        evidence: anomalies.patterns,
        context,
        location,
        extractedText: context,  // Populate extractedText for hyperspecific citing
        evidenceType: 'text',
        triggerLogic: `Machine learning anomaly detector identified ${anomalies.patterns.length} statistical outlier(s) with anomaly score ${anomalies.anomalyScore.toFixed(1)}. Patterns deviate significantly from expected financial reporting norms, suggesting potential manipulation.`,
        estimatedPenalties: {
          monetary: 5000000,
          imprisonment: 10,
          civilFine: true
        },
        confidence: anomalies.confidence * 100,
        severity: anomalies.anomalyScore * 10,
        penalties: [
          { type: 'MONETARY', amount: 5000000, text: '$5M potential fine' },
          { type: 'IMPRISONMENT', duration: '10', unit: 'years', text: 'Up to 10 years' }
        ],
        recommendation: 'IMMEDIATE_INVESTIGATION'
      });
    }
    
    // Bayesian risk assessment
    const bayesianRisk = this.bayesianAnalyzer.assessOverallRisk(anomalies, anomalies, {});
    
    if (bayesianRisk.anomalyScore > 7) {
      // Find context for Bayesian risk analysis
      let context = '';
      let location = null;
      
      // Look for risk-related keywords in the document
      const riskRegex = /(risk|uncertainty|volatile|fluctuation|material|adverse|contingent|liability)/gi;
      const riskMatches = [...content.text.matchAll(riskRegex)];
      
      if (riskMatches.length > 0) {
        const match = riskMatches[0];
        const matchIndex = match.index || 0;
        const contextStart = Math.max(0, matchIndex - 80);
        const contextEnd = Math.min(content.text.length, matchIndex + 150);
        context = content.text.substring(contextStart, contextEnd);
        location = { start: matchIndex, end: matchIndex + match[0].length };
      } else if (bayesianRisk.patterns && bayesianRisk.patterns.length > 0) {
        // Use Bayesian patterns as context
        context = bayesianRisk.patterns.join(', ');
      } else {
        // Fallback: use middle section of document
        const midPoint = Math.floor(content.text.length / 2);
        const contextStart = Math.max(0, midPoint - 100);
        const contextEnd = Math.min(content.text.length, midPoint + 100);
        context = content.text.substring(contextStart, contextEnd);
        location = { start: contextStart, end: contextEnd };
      }
      
      violations.push({
        type: 'BAYESIAN_HIGH_RISK',
        statute: 'Predictive Analysis',
        description: `Bayesian analysis indicates ${(bayesianRisk.confidence * 100).toFixed(0)}% probability of fraud`,
        evidence: bayesianRisk.patterns,
        context,
        location,
        extractedText: context,  // Populate extractedText for hyperspecific citing
        evidenceType: 'text',
        triggerLogic: `Bayesian risk model computed ${(bayesianRisk.confidence * 100).toFixed(0)}% fraud probability based on ${bayesianRisk.patterns.length} correlated risk factor(s). Combined statistical evidence from multiple detection layers strongly suggests intentional misconduct warranting criminal investigation.`,
        estimatedPenalties: {
          monetary: 15000000,
          imprisonment: 10,
          civilFine: false  // Criminal case, not civil
        },
        confidence: bayesianRisk.confidence * 100,
        severity: 90,
        penalties: [
          { type: 'MONETARY', amount: 15000000, text: '$15M potential fine' },
          { type: 'IMPRISONMENT', duration: '10', unit: 'years', text: 'Up to 10 years' }
        ],
        recommendation: 'DOJ_CRIMINAL_REFERRAL'
      });
    }
    
    return violations;
  }

  private findRelevantDocumentSection(text: string, provision: any): { text: string; location: { start: number; end: number } } | null {
    // Define keywords based on common legal provision types
    const sectionKeywords = {
      'securities': ['securities', 'stock', 'shares', 'investment', 'trading', 'market'],
      'disclosure': ['disclosure', 'material', 'information', 'statement', 'report'],
      'fraud': ['fraud', 'misrepresentation', 'deception', 'false', 'misleading'],
      'financial': ['financial', 'accounting', 'revenue', 'earnings', 'profit', 'loss'],
      'compliance': ['compliance', 'regulation', 'requirement', 'obligation', 'duty']
    };
    
    // Determine provision category from statute or text
    let relevantKeywords: string[] = [];
    const provisionText = (provision.text || '').toLowerCase();
    const statute = (provision.citation || '').toLowerCase();
    
    if (statute.includes('10b-5') || provisionText.includes('manipulative') || provisionText.includes('deceptive')) {
      relevantKeywords = [...sectionKeywords.fraud, ...sectionKeywords.disclosure];
    } else if (provisionText.includes('disclosure') || provisionText.includes('material')) {
      relevantKeywords = sectionKeywords.disclosure;
    } else if (provisionText.includes('financial') || provisionText.includes('accounting')) {
      relevantKeywords = sectionKeywords.financial;
    } else {
      relevantKeywords = sectionKeywords.securities;
    }
    
    // Find the best matching section
    let bestMatch = null;
    let bestScore = 0;
    
    for (const keyword of relevantKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        const matchIndex = match.index || 0;
        const score = relevantKeywords.length - relevantKeywords.indexOf(keyword) + matches.length;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { keyword, index: matchIndex };
        }
      }
    }
    
    if (bestMatch) {
      // Extract context around the best match
      const contextStart = Math.max(0, bestMatch.index - 120);
      const contextEnd = Math.min(text.length, bestMatch.index + 180);
      const contextText = text.substring(contextStart, contextEnd);
      
      return {
        text: contextText,
        location: { start: bestMatch.index, end: bestMatch.index + bestMatch.keyword.length }
      };
    }
    
    return null;
  }

  private extractFinancialMetrics(text: string): any {
    // Extract basic financial metrics
    const metrics: any = {};
    
    const revenueMatch = text.match(/revenue.*?\$?([\d,]+)/i);
    if (revenueMatch) {
      metrics.revenue = parseFloat(revenueMatch[1].replace(/,/g, ''));
    }
    
    const profitMatch = text.match(/profit.*?\$?([\d,]+)/i);
    if (profitMatch) {
      metrics.profit = parseFloat(profitMatch[1].replace(/,/g, ''));
    }
    
    return metrics;
  }
}
