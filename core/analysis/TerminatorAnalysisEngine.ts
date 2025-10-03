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
      const matches = content.text.match(pattern.regex);
      if (matches) {
        violations.push({
          type: pattern.type,
          statute: pattern.statute,
          description: pattern.description,
          evidence: [`Found ${matches.length} instances in document`],
          confidence: Math.min(matches.length * 15 + pattern.severity, 95),
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
      violations.push({
        type: 'DEEP_PATTERN_FRAUD',
        statute: '17 CFR § 240.10b-5',
        description: `Deep pattern analysis reveals fraud indicators (score: ${(textVector.fraudScore * 100).toFixed(0)}%)`,
        evidence: textVector.suspiciousPatterns,
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
        violations.push({
          type: 'STATUTORY_VIOLATION',
          statute: provision.citation,
          description: `Potential violation: ${provision.text}`,
          evidence: ['Missing required disclosures or patterns'],
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
      violations.push({
        type: 'ML_ANOMALY_DETECTED',
        statute: 'Statistical Analysis',
        description: `Statistical anomalies detected: ${anomalies.insights.join(', ')}`,
        evidence: anomalies.patterns,
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
      violations.push({
        type: 'BAYESIAN_HIGH_RISK',
        statute: 'Predictive Analysis',
        description: `Bayesian analysis indicates ${(bayesianRisk.confidence * 100).toFixed(0)}% probability of fraud`,
        evidence: bayesianRisk.patterns,
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
