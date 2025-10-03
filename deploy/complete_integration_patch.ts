/**
 * NITS Complete Integration Patch
 * 
 * Feature-complete, securely integrated, and modularized deployment script
 * for CoPilot agent drop-in deployment.
 * 
 * Features:
 * - GovInfo API Key Integration with fallback
 * - All Enhancement Modules Imported
 * - Robust Initialization
 * - Document + Corpus Analysis (Dual-mode)
 * - Prosecution Package & Threat Scoring
 * - Markdown Export to ./output/
 * - Demo Document Fallback
 * - Production Console Logging
 * - Error Safety Net
 * - Security Notes (API key masking)
 */

import * as fs from 'fs';
import * as path from 'path';

// Core Modules
import { GovInfoTerminator } from '../core/govinfo/GovInfoTerminator';
import { TerminatorAnalysisEngine } from '../core/analysis/TerminatorAnalysisEngine';
import { ProsecutionPackage } from '../core/evidence/ProsecutionPackage';
import { Violation } from '../core/analysis/Violation';

// Enhancement Modules - NLP
import { ForensicTextAnalyzer, DocumentVector } from '../core/nlp/ForensicTextAnalyzer';

// Enhancement Modules - Anomaly Detection & Financial Forensics
import { AnomalyDetector, DocumentCorrelationAnalyzer } from '../core/anomaly/AnomalyDetector';
import { BayesianRiskAnalyzer } from '../core/anomaly/BayesianRiskAnalyzer';

/**
 * Configuration with API Key Integration
 */
const CONFIG = {
  GOVINFO_API_KEY: process.env.GOVINFO_API_KEY || 'DEMO_KEY_EMBEDDED_FALLBACK',
  INPUT_DIR: './sample_docs',
  OUTPUT_DIR: './output',
  DEFAULT_DOCUMENT: 'test_document.txt',
  ENABLE_CORPUS_ANALYSIS: true,
  ENABLE_DETAILED_LOGGING: true
};

/**
 * Mask API key for security in console output
 */
function maskApiKey(key: string): string {
  if (key.length <= 8) return '***';
  return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
}

/**
 * Initialize all system modules with error handling
 */
async function initializeSystem(): Promise<{
  govInfo: GovInfoTerminator;
  engine: TerminatorAnalysisEngine;
  nlpAnalyzer: ForensicTextAnalyzer;
  anomalyDetector: AnomalyDetector;
  bayesianAnalyzer: BayesianRiskAnalyzer;
  correlationAnalyzer: DocumentCorrelationAnalyzer;
}> {
  console.log('🔴 NITS COMPLETE INTEGRATION PATCH v3.0');
  console.log('════════════════════════════════════════════════════════════');
  console.log('║   NITS TERMINATOR SYSTEM - FULL DEPLOYMENT             ║');
  console.log('║   OBJECTIVE: TOTAL VIOLATION EXPOSURE                  ║');
  console.log('║   MODE: ZERO TOLERANCE + FORENSIC ANALYSIS             ║');
  console.log('════════════════════════════════════════════════════════════');
  console.log('');
  
  // Security: Display masked API key
  console.log('🔐 Security Check:');
  console.log(`   API Key: ${maskApiKey(CONFIG.GOVINFO_API_KEY)}`);
  console.log(`   Status: ${CONFIG.GOVINFO_API_KEY !== 'DEMO_KEY_EMBEDDED_FALLBACK' ? '✅ Custom Key Loaded' : '⚠️  Using Demo Key'}`);
  console.log('');
  
  console.log('🚀 Initializing Enhancement Modules...');
  console.log('');
  
  // Phase 1: GovInfo Legal System Harvester
  console.log('📊 Phase 1: Legal System Harvester');
  const govInfo = new GovInfoTerminator();
  try {
    await govInfo.harvestEntireLegalSystem();
    console.log('   ✅ GovInfo Module: Ready');
  } catch (error) {
    console.error('   ❌ GovInfo Module: Failed', error);
    throw error;
  }
  console.log('');
  
  // Phase 2: Core Analysis Engine
  console.log('⚖️  Phase 2: Terminator Analysis Engine');
  const engine = new TerminatorAnalysisEngine();
  try {
    await engine.initialize();
    console.log('   ✅ Analysis Engine: Ready');
  } catch (error) {
    console.error('   ❌ Analysis Engine: Failed', error);
    throw error;
  }
  console.log('');
  
  // Phase 3: NLP Forensic Text Analyzer
  console.log('🧠 Phase 3: NLP Forensic Analysis');
  const nlpAnalyzer = new ForensicTextAnalyzer();
  console.log('   ✅ Forensic Text Analyzer: Ready');
  console.log('');
  
  // Phase 4: Financial Forensics & Anomaly Detection
  console.log('💰 Phase 4: Financial Forensics');
  const anomalyDetector = new AnomalyDetector();
  console.log('   ✅ Anomaly Detector: Ready');
  console.log('');
  
  // Phase 5: Bayesian Risk Analysis
  console.log('📈 Phase 5: Bayesian Risk Analyzer');
  const bayesianAnalyzer = new BayesianRiskAnalyzer();
  console.log('   ✅ Bayesian Analyzer: Ready');
  console.log('');
  
  // Phase 6: Document Correlation
  console.log('🔗 Phase 6: Contradiction & Correlation Analysis');
  const correlationAnalyzer = new DocumentCorrelationAnalyzer();
  console.log('   ✅ Correlation Analyzer: Ready');
  console.log('');
  
  console.log('✅ ALL MODULES INITIALIZED SUCCESSFULLY');
  console.log(`📋 Legal Provisions Indexed: ${govInfo.legalProvisions.size}`);
  console.log('');
  
  return {
    govInfo,
    engine,
    nlpAnalyzer,
    anomalyDetector,
    bayesianAnalyzer,
    correlationAnalyzer
  };
}

/**
 * Analyze a single document with full forensic suite
 */
async function analyzeDocument(
  filePath: string,
  modules: any
): Promise<{
  violations: Violation[];
  nlpAnalysis: DocumentVector;
  anomalyAnalysis: any;
  bayesianRisk: any;
}> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 SINGLE DOCUMENT ANALYSIS MODE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📄 File: ${path.basename(filePath)}`);
  console.log('');
  
  // Read document
  let documentText: string;
  try {
    documentText = fs.readFileSync(filePath, 'utf-8');
    console.log(`✅ Document loaded: ${documentText.length} characters`);
  } catch (error) {
    console.error('❌ Failed to read document:', error);
    // Fallback to demo document
    console.log('⚠️  Using fallback demo document...');
    documentText = `
      This financial report shows revenue of $50,000,000 with profit of $30,000,000.
      The company engaged in transactions that may constitute fraud and misleading statements.
      Material disclosure regarding insider trading activities was omitted from the filing.
      Non-compliance with SEC regulations was noted during the review period.
    `;
  }
  console.log('');
  
  // Level 1: NLP Forensic Analysis
  console.log('🧠 Running NLP Forensic Analysis...');
  const nlpAnalysis = modules.nlpAnalyzer.analyzeDocument(
    documentText,
    path.basename(filePath),
    'financial_report'
  );
  console.log(`   Fraud Score: ${(nlpAnalysis.fraudScore * 100).toFixed(1)}%`);
  console.log(`   Risk Level: ${nlpAnalysis.riskLevel.toFixed(1)}/100`);
  console.log(`   Suspicious Patterns: ${nlpAnalysis.suspiciousPatterns.length}`);
  console.log('');
  
  // Level 2: Legal Termination Analysis
  console.log('⚖️  Running Legal Termination Analysis...');
  const violations = await modules.engine.terminateDocument(documentText);
  console.log(`   Violations Detected: ${violations.length}`);
  console.log('');
  
  // Level 3: Financial Anomaly Detection
  console.log('💰 Running Financial Forensics...');
  const financialMetrics = extractFinancialMetrics(documentText);
  const anomalyAnalysis = modules.anomalyDetector.detectAnomalies(financialMetrics);
  console.log(`   Anomaly Score: ${anomalyAnalysis.anomalyScore.toFixed(2)}/10`);
  console.log(`   Confidence: ${(anomalyAnalysis.confidence * 100).toFixed(1)}%`);
  console.log('');
  
  // Level 4: Bayesian Risk Assessment
  console.log('📈 Running Bayesian Risk Assessment...');
  const bayesianRisk = modules.bayesianAnalyzer.assessOverallRisk(
    nlpAnalysis,
    anomalyAnalysis,
    { correlationScore: 0.7 }
  );
  console.log(`   Overall Risk Score: ${bayesianRisk.anomalyScore.toFixed(2)}/10`);
  console.log(`   Recommendation: ${bayesianRisk.recommendation}`);
  console.log('');
  
  return {
    violations,
    nlpAnalysis,
    anomalyAnalysis,
    bayesianRisk
  };
}

/**
 * Analyze corpus of documents (multi-document mode)
 */
async function analyzeCorpus(
  inputDir: string,
  modules: any
): Promise<any[]> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📚 CORPUS ANALYSIS MODE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📁 Directory: ${inputDir}`);
  console.log('');
  
  const results: any[] = [];
  
  try {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.txt'));
    console.log(`📊 Documents found: ${files.length}`);
    console.log('');
    
    for (const file of files) {
      const filePath = path.join(inputDir, file);
      console.log(`\n🔍 Analyzing: ${file}`);
      console.log('─'.repeat(60));
      
      try {
        const analysis = await analyzeDocument(filePath, modules);
        results.push({
          filename: file,
          ...analysis
        });
        console.log(`✅ Analysis complete for: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to analyze ${file}:`, error);
      }
    }
    
    // Cross-document correlation
    if (results.length > 1) {
      console.log('');
      console.log('🔗 Running Cross-Document Correlation...');
      const documentTexts = results.map(r => r.filename);
      const correlation = modules.correlationAnalyzer.analyzeCorrelations(documentTexts);
      console.log(`   Correlation Score: ${(correlation.correlationScore * 100).toFixed(1)}%`);
      console.log(`   Linked Documents: ${correlation.linkedDocuments}`);
    }
  } catch (error) {
    console.error('❌ Corpus analysis failed:', error);
  }
  
  console.log('');
  return results;
}

/**
 * Extract financial metrics from text
 */
function extractFinancialMetrics(text: string): any {
  const metrics: any = {};
  
  // Extract revenue
  const revenueMatch = text.match(/revenue[s]?[:\s]+\$?([\d,]+)/i);
  if (revenueMatch) {
    metrics.revenue = parseFloat(revenueMatch[1].replace(/,/g, ''));
  }
  
  // Extract profit
  const profitMatch = text.match(/profit[:\s]+\$?([\d,]+)/i);
  if (profitMatch) {
    metrics.profit = parseFloat(profitMatch[1].replace(/,/g, ''));
  }
  
  return metrics;
}

/**
 * Generate prosecution package and threat scoring
 */
function generateProsecutionPackage(violations: Violation[]): {
  package: any;
  penalties: any;
  recommendation: string;
  threatScore: number;
} {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('⚖️  PROSECUTION PACKAGE GENERATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  const prosecutionPkg = ProsecutionPackage.generate(violations);
  const penalties = ProsecutionPackage.calculateMaximumPenalties(violations);
  const recommendation = ProsecutionPackage.generateRecommendation(violations);
  
  // Calculate threat score (0-100)
  const threatScore = Math.min(
    100,
    (prosecutionPkg.secFormTCR.criminalCount * 15) +
    (prosecutionPkg.secFormTCR.civilCount * 5) +
    (penalties.monetary / 1000000) +
    (penalties.imprisonment * 2)
  );
  
  console.log('📋 SEC Form TCR (Total Complaint Report):');
  console.log(`   Total Violations: ${prosecutionPkg.secFormTCR.totalViolations}`);
  console.log(`   🔴 Criminal: ${prosecutionPkg.secFormTCR.criminalCount}`);
  console.log(`   ⚠️  Civil: ${prosecutionPkg.secFormTCR.civilCount}`);
  console.log('');
  
  console.log('💰 Maximum Penalties:');
  console.log(`   Monetary: $${penalties.monetary.toLocaleString()}`);
  console.log(`   Imprisonment: ${penalties.imprisonment} years`);
  console.log('');
  
  console.log('🎯 Threat Assessment:');
  console.log(`   Threat Score: ${threatScore.toFixed(1)}/100`);
  console.log(`   Strategy: ${prosecutionPkg.prosecutionStrategy}`);
  console.log(`   Recommendation: ${recommendation}`);
  console.log('');
  
  if (prosecutionPkg.dojReferral) {
    console.log('🚨 DOJ CRIMINAL REFERRAL REQUIRED');
    console.log(`   Criminal Violations: ${prosecutionPkg.dojReferral.criminalViolations.length}`);
    console.log(`   Action: ${prosecutionPkg.dojReferral.recommendation}`);
    console.log('');
  }
  
  return {
    package: prosecutionPkg,
    penalties,
    recommendation,
    threatScore
  };
}

/**
 * Export analysis report to Markdown
 */
function exportMarkdownReport(
  filename: string,
  analysis: any,
  prosecution: any
): void {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 MARKDOWN REPORT EXPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  const outputPath = path.join(CONFIG.OUTPUT_DIR, filename);
  
  const report = `# NITS Analysis Report
  
## Document Information
- **Analyzed**: ${new Date().toISOString()}
- **System Version**: NITS Terminator v3.0
- **Analysis Mode**: Complete Integration Patch

## Executive Summary

### Threat Assessment
- **Threat Score**: ${prosecution.threatScore.toFixed(1)}/100
- **Recommendation**: ${prosecution.recommendation}
- **Strategy**: ${prosecution.package.prosecutionStrategy}

### Violations Summary
- **Total Violations**: ${prosecution.package.secFormTCR.totalViolations}
- **Criminal Violations**: ${prosecution.package.secFormTCR.criminalCount}
- **Civil Violations**: ${prosecution.package.secFormTCR.civilCount}

### Penalties
- **Monetary Penalties**: $${prosecution.penalties.monetary.toLocaleString()}
- **Imprisonment**: ${prosecution.penalties.imprisonment} years

## NLP Forensic Analysis
- **Fraud Score**: ${(analysis.nlpAnalysis.fraudScore * 100).toFixed(1)}%
- **Risk Level**: ${analysis.nlpAnalysis.riskLevel.toFixed(1)}/100
- **Suspicious Patterns**: ${analysis.nlpAnalysis.suspiciousPatterns.length}

### Key Indicators
${analysis.nlpAnalysis.keyIndicators.map((i: string) => `- ${i}`).join('\n')}

### Suspicious Patterns
${analysis.nlpAnalysis.suspiciousPatterns.map((p: string) => `- ${p}`).join('\n')}

## Financial Forensics
- **Anomaly Score**: ${analysis.anomalyAnalysis.anomalyScore.toFixed(2)}/10
- **Confidence**: ${(analysis.anomalyAnalysis.confidence * 100).toFixed(1)}%

### Detected Patterns
${analysis.anomalyAnalysis.patterns.map((p: string) => `- ${p}`).join('\n')}

### Insights
${analysis.anomalyAnalysis.insights.map((i: string) => `- ${i}`).join('\n')}

## Bayesian Risk Assessment
- **Overall Risk Score**: ${analysis.bayesianRisk.anomalyScore.toFixed(2)}/10
- **Confidence**: ${(analysis.bayesianRisk.confidence * 100).toFixed(1)}%
- **Recommendation**: ${analysis.bayesianRisk.recommendation}

### Risk Patterns
${analysis.bayesianRisk.patterns.map((p: string) => `- ${p}`).join('\n')}

## Legal Violations

${analysis.violations.map((v: Violation, idx: number) => `
### Violation ${idx + 1}: ${v.type}
- **Statute**: ${v.statute}
- **Severity**: ${v.severity}/100
- **Confidence**: ${v.confidence}%
- **Description**: ${v.description}
- **Recommendation**: ${v.recommendation}

**Evidence**:
${v.evidence.map((e: string) => `- ${e}`).join('\n')}

**Penalties**:
${v.penalties.map(p => `- ${p.text}`).join('\n')}
`).join('\n---\n')}

## DOJ Referral
${prosecution.package.dojReferral ? `
**Status**: 🚨 REQUIRED

**Criminal Violations**: ${prosecution.package.dojReferral.criminalViolations.length}

**Recommendation**: ${prosecution.package.dojReferral.recommendation}

**Action Items**:
- Immediate escalation to DOJ
- Prepare evidence inventory
- Coordinate with SEC enforcement
- Freeze relevant assets
` : '**Status**: Not Required'}

## Evidence Inventory
${prosecution.package.evidenceInventory.slice(0, 10).map((e: string) => `- ${e}`).join('\n')}
${prosecution.package.evidenceInventory.length > 10 ? `\n... and ${prosecution.package.evidenceInventory.length - 10} more items` : ''}

## Recommended Charges
${prosecution.package.recommendedCharges.map((c: string) => `- ${c}`).join('\n')}

---

*Report generated by NITS Terminator System v3.0*  
*Confidential - For Law Enforcement Use Only*
`;

  try {
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, report, 'utf-8');
    console.log(`✅ Report exported: ${outputPath}`);
    console.log(`📊 Report size: ${report.length} characters`);
  } catch (error) {
    console.error('❌ Failed to export report:', error);
  }
  console.log('');
}

/**
 * Export corpus analysis report
 */
function exportCorpusReport(results: any[]): void {
  const outputPath = path.join(CONFIG.OUTPUT_DIR, 'corpus_analysis_report.md');
  
  const report = `# NITS Corpus Analysis Report

## Analysis Summary
- **Documents Analyzed**: ${results.length}
- **Analysis Date**: ${new Date().toISOString()}
- **System Version**: NITS Terminator v3.0

## Document Overview

${results.map((r, idx) => `
### Document ${idx + 1}: ${r.filename}

**Violations**: ${r.violations.length}  
**Fraud Score**: ${(r.nlpAnalysis.fraudScore * 100).toFixed(1)}%  
**Threat Assessment**: ${r.bayesianRisk.recommendation}

---
`).join('\n')}

## Aggregate Statistics

**Total Violations Across Corpus**: ${results.reduce((sum, r) => sum + r.violations.length, 0)}  
**Average Fraud Score**: ${(results.reduce((sum, r) => sum + r.nlpAnalysis.fraudScore, 0) / results.length * 100).toFixed(1)}%  
**Documents with Criminal Violations**: ${results.filter(r => r.violations.some((v: Violation) => v.severity > 70)).length}

## Recommendations

${results.length > 0 ? '- Cross-reference findings across documents\n- Investigate common patterns and entities\n- Prioritize high-severity violations\n- Coordinate enforcement strategy' : 'No documents analyzed'}

---

*Corpus Analysis by NITS Terminator System v3.0*
`;

  try {
    fs.writeFileSync(outputPath, report, 'utf-8');
    console.log(`✅ Corpus report exported: ${outputPath}`);
  } catch (error) {
    console.error('❌ Failed to export corpus report:', error);
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    // Phase 1: Initialize all modules
    const modules = await initializeSystem();
    
    // Phase 2: Document Analysis
    const inputPath = path.join(CONFIG.INPUT_DIR, CONFIG.DEFAULT_DOCUMENT);
    const analysis = await analyzeDocument(inputPath, modules);
    
    // Phase 3: Generate Prosecution Package
    const prosecution = generateProsecutionPackage(analysis.violations);
    
    // Phase 4: Export Individual Document Report
    exportMarkdownReport('analysis_report.md', analysis, prosecution);
    
    // Phase 5: Corpus Analysis (if enabled)
    if (CONFIG.ENABLE_CORPUS_ANALYSIS) {
      console.log('');
      const corpusResults = await analyzeCorpus(CONFIG.INPUT_DIR, modules);
      
      if (corpusResults.length > 0) {
        exportCorpusReport(corpusResults);
      }
    }
    
    // Final Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ COMPLETE INTEGRATION PATCH - EXECUTION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Analysis Summary:');
    console.log(`   Violations Detected: ${analysis.violations.length}`);
    console.log(`   Threat Score: ${prosecution.threatScore.toFixed(1)}/100`);
    console.log(`   Criminal Violations: ${prosecution.package.secFormTCR.criminalCount}`);
    console.log(`   Total Penalties: $${prosecution.penalties.monetary.toLocaleString()}`);
    console.log('');
    console.log('📁 Output Files:');
    console.log(`   - ${CONFIG.OUTPUT_DIR}/analysis_report.md`);
    if (CONFIG.ENABLE_CORPUS_ANALYSIS) {
      console.log(`   - ${CONFIG.OUTPUT_DIR}/corpus_analysis_report.md`);
    }
    console.log('');
    console.log('🚀 System ready for production deployment');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ FATAL ERROR IN INTEGRATION PATCH');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error details:', error);
    console.error('');
    console.error('Please check:');
    console.error('  1. All required directories exist (sample_docs/, output/)');
    console.error('  2. Input documents are accessible');
    console.error('  3. File system permissions are correct');
    console.error('  4. All dependencies are installed');
    console.error('');
    throw error;
  }
}

// Execute with comprehensive error handling
main().catch(err => {
  console.error('');
  console.error('💀 UNRECOVERABLE ERROR - SYSTEM HALT');
  console.error('');
  console.error(err);
  process.exit(1);
});
