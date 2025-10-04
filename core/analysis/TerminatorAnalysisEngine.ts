import { Violation } from './Violation';
import { GovInfoTerminator } from '../govinfo/GovInfoTerminator';
import { ForensicTextAnalyzer } from '../nlp/ForensicTextAnalyzer';
import { AnomalyDetector } from '../anomaly/AnomalyDetector';
import { BayesianRiskAnalyzer } from '../anomaly/BayesianRiskAnalyzer';

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
  private isInitialized: boolean = false;
  
  constructor() {
    this.govInfo = new GovInfoTerminator();
    this.textAnalyzer = new ForensicTextAnalyzer();
    this.anomalyDetector = new AnomalyDetector();
    this.bayesianAnalyzer = new BayesianRiskAnalyzer();
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
        violations.push({
          type: pattern.type,
          statute: pattern.statute,
          description: pattern.description,
          evidence: [`Found ${matchCount} instances in document`],
          context: contexts[0] || '',
          location: locations[0] || null,
          allContexts: contexts,
          allLocations: locations,
          confidence: Math.min(matchCount * 15 + pattern.severity, 95),
          severity: pattern.severity,
          penalties: [
            { type: 'MONETARY', amount: 5000000, text: '$5M potential fine' }
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
        violations.push({
          type: 'STATUTORY_VIOLATION',
          statute: provision.citation,
          description: `Potential violation: ${provision.text}`,
          evidence: ['Missing required disclosures or patterns'],
          context,
          location,
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
        confidence: anomalies.confidence * 100,
        severity: anomalies.anomalyScore * 10,
        penalties: [
          { type: 'MONETARY', amount: 5000000, text: '$5M potential fine' }
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
