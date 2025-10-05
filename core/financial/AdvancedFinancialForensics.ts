export interface FinancialData {
  current: FinancialStatement;
  previous: FinancialStatement;
  historical?: FinancialStatement[];
}

export interface FinancialStatement {
  // Income Statement
  revenue: number;
  sales: number;
  cogs: number; // Cost of Goods Sold
  grossProfit: number;
  sga: number; // Selling, General & Administrative expenses
  operatingIncome: number;
  ebit: number; // Earnings Before Interest and Taxes
  netIncome: number;
  
  // Balance Sheet
  currentAssets: number;
  totalAssets: number;
  ppe: number; // Property, Plant & Equipment
  receivables: number;
  retainedEarnings: number;
  currentLiabilities: number;
  totalLiabilities: number;
  ltDebt: number; // Long-term Debt
  sharesOutstanding: number;
  
  // Cash Flow Statement
  operatingCashFlow: number;
  
  // Market Data
  marketCap: number;
  stockPrice?: number;
  
  // Calculated Ratios
  roa?: number; // Return on Assets
  currentRatio?: number;
  assetTurnover?: number;
  grossMargin?: number;
  depreciation?: number;
  
  // Date
  reportDate: Date;
}

export interface BeneishMScore {
  score: number;
  components: {
    dsri: number; // Days Sales in Receivables Index
    gmi: number;  // Gross Margin Index
    aqi: number;  // Asset Quality Index
    sgi: number;  // Sales Growth Index
    depi: number; // Depreciation Index
    sgai: number; // SG&A Index
    lvgi: number; // Leverage Index
    tata: number; // Total Accruals to Total Assets
  };
  interpretation: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AltmanZScore {
  score: number;
  components: {
    x1: number; // Working Capital / Total Assets
    x2: number; // Retained Earnings / Total Assets
    x3: number; // EBIT / Total Assets
    x4: number; // Market Cap / Total Liabilities
    x5: number; // Sales / Total Assets
  };
  interpretation: string;
  distressZone: 'SAFE' | 'GREY' | 'DISTRESS';
}

export interface PiotroskiScore {
  score: number;
  components: {
    profitability: {
      netIncomePositive: boolean;
      operatingCashFlowPositive: boolean;
      roaImprovement: boolean;
      accrualQuality: boolean;
    };
    leverage: {
      leverageDecrease: boolean;
      liquidityIncrease: boolean;
      noNewShares: boolean;
    };
    efficiency: {
      grossMarginImprovement: boolean;
      assetTurnoverImprovement: boolean;
    };
  };
  interpretation: string;
  qualityRating: 'POOR' | 'WEAK' | 'AVERAGE' | 'GOOD' | 'EXCELLENT';
}

export interface BenfordsLawTest {
  passed: boolean;
  chiSquare: number;
  confidence: number;
  observedDistribution: number[];
  expectedDistribution: number[];
  interpretation: string;
  suspiciousDigits: number[];
}

export interface ForensicAnalysisResult {
  beneishMScore: BeneishMScore;
  altmanZScore: AltmanZScore;
  piotroskiScore: PiotroskiScore;
  benfordsLaw: BenfordsLawTest;
  redFlags: string[];
  overallRiskLevel: number; // 0-100
  recommendation: string;
  fraudProbability: number; // 0-1
  processingTimeMs: number;
}

export class AdvancedFinancialForensics {
  
  /**
   * Perform comprehensive financial forensics analysis
   */
  async performComprehensiveAnalysis(data: FinancialData): Promise<ForensicAnalysisResult> {
    console.log('💰 Starting comprehensive financial forensics analysis...');
    const startTime = Date.now();
    
    try {
      // Validate input data
      this.validateFinancialData(data);
      
      // Calculate all forensic indicators
      console.log('📊 Calculating Beneish M-Score...');
      const beneishScore = this.calculateBeneishMScore(data);
      
      console.log('📊 Calculating Altman Z-Score...');
      const altmanScore = this.calculateAltmanZScore(data);
      
      console.log('📊 Calculating Piotroski F-Score...');
      const piotroskiScore = this.calculatePiotroskiScore(data);
      
      console.log('📊 Performing Benford\'s Law test...');
      const benfordsLaw = this.performBenfordsLawTest(data);
      
      // Identify red flags
      const redFlags = this.identifyRedFlags(beneishScore, altmanScore, piotroskiScore, benfordsLaw);
      
      // Calculate overall risk and fraud probability
      const overallRiskLevel = this.calculateOverallRisk(beneishScore, altmanScore, piotroskiScore, benfordsLaw);
      const fraudProbability = this.calculateFraudProbability(beneishScore, benfordsLaw);
      
      // Generate recommendation
      const recommendation = this.generateRecommendation(overallRiskLevel, fraudProbability, redFlags);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Financial forensics analysis complete:`);
      console.log(`   Overall Risk Level: ${overallRiskLevel}/100`);
      console.log(`   Fraud Probability: ${(fraudProbability * 100).toFixed(1)}%`);
      console.log(`   Red Flags: ${redFlags.length}`);
      console.log(`   Processing Time: ${processingTime}ms`);
      
      return {
        beneishMScore: beneishScore,
        altmanZScore: altmanScore,
        piotroskiScore: piotroskiScore,
        benfordsLaw: benfordsLaw,
        redFlags: redFlags,
        overallRiskLevel: overallRiskLevel,
        recommendation: recommendation,
        fraudProbability: fraudProbability,
        processingTimeMs: processingTime
      };
      
    } catch (error) {
      console.error('❌ Financial forensics analysis failed:', error);
      throw new Error(`Financial forensics analysis failed: ${error}`);
    }
  }

  /**
   * Calculate Beneish M-Score for earnings manipulation detection
   */
  private calculateBeneishMScore(data: FinancialData): BeneishMScore {
    const curr = data.current;
    const prev = data.previous;

    // Days Sales in Receivables Index (DSRI)
    const currDSR = curr.receivables / curr.sales;
    const prevDSR = prev.receivables / prev.sales;
    const dsri = currDSR / prevDSR;

    // Gross Margin Index (GMI)
    const currGM = curr.grossProfit / curr.sales;
    const prevGM = prev.grossProfit / prev.sales;
    const gmi = prevGM / currGM;

    // Asset Quality Index (AQI)
    const currAQ = 1 - (curr.currentAssets + curr.ppe) / curr.totalAssets;
    const prevAQ = 1 - (prev.currentAssets + prev.ppe) / prev.totalAssets;
    const aqi = currAQ / prevAQ;

    // Sales Growth Index (SGI)
    const sgi = curr.sales / prev.sales;

    // Depreciation Index (DEPI)
    const currDepRate = curr.depreciation! / (curr.depreciation! + curr.ppe);
    const prevDepRate = prev.depreciation! / (prev.depreciation! + prev.ppe);
    const depi = prevDepRate / currDepRate;

    // SG&A Index (SGAI)
    const currSGARate = curr.sga / curr.sales;
    const prevSGARate = prev.sga / prev.sales;
    const sgai = currSGARate / prevSGARate;

    // Leverage Index (LVGI)
    const currLev = (curr.ltDebt + curr.currentLiabilities) / curr.totalAssets;
    const prevLev = (prev.ltDebt + prev.currentLiabilities) / prev.totalAssets;
    const lvgi = currLev / prevLev;

    // Total Accruals to Total Assets (TATA)
    const totalAccruals = curr.netIncome - curr.operatingCashFlow;
    const tata = totalAccruals / curr.totalAssets;

    // Calculate M-Score using the original Beneish formula
    const mScore = -4.84 + 0.92 * dsri + 0.528 * gmi + 0.404 * aqi +
                   0.892 * sgi + 0.115 * depi - 0.172 * sgai +
                   4.679 * tata - 0.327 * lvgi;

    // Determine risk level and interpretation
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let interpretation: string;

    if (mScore > -1.78) {
      riskLevel = 'CRITICAL';
      interpretation = 'High probability of earnings manipulation. M-Score indicates likely manipulator.';
    } else if (mScore > -2.22) {
      riskLevel = 'HIGH';
      interpretation = 'Elevated risk of earnings manipulation. Requires investigation.';
    } else if (mScore > -2.76) {
      riskLevel = 'MEDIUM';
      interpretation = 'Moderate risk of earnings manipulation. Monitor closely.';
    } else {
      riskLevel = 'LOW';
      interpretation = 'Low probability of earnings manipulation.';
    }

    return {
      score: mScore,
      components: { dsri, gmi, aqi, sgi, depi, sgai, lvgi, tata },
      interpretation,
      riskLevel
    };
  }

  /**
   * Calculate Altman Z-Score for bankruptcy prediction
   */
  private calculateAltmanZScore(data: FinancialData): AltmanZScore {
    const curr = data.current;

    // Working Capital / Total Assets
    const x1 = (curr.currentAssets - curr.currentLiabilities) / curr.totalAssets;

    // Retained Earnings / Total Assets
    const x2 = curr.retainedEarnings / curr.totalAssets;

    // EBIT / Total Assets
    const x3 = curr.ebit / curr.totalAssets;

    // Market Cap / Total Liabilities
    const x4 = curr.marketCap / curr.totalLiabilities;

    // Sales / Total Assets
    const x5 = curr.sales / curr.totalAssets;

    // Calculate Z-Score
    const zScore = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 0.99 * x5;

    // Determine distress zone and interpretation
    let distressZone: 'SAFE' | 'GREY' | 'DISTRESS';
    let interpretation: string;

    if (zScore > 3.0) {
      distressZone = 'SAFE';
      interpretation = 'Company is in the safe zone with low bankruptcy risk.';
    } else if (zScore >= 1.8) {
      distressZone = 'GREY';
      interpretation = 'Company is in the grey zone with moderate bankruptcy risk.';
    } else {
      distressZone = 'DISTRESS';
      interpretation = 'Company is in the distress zone with high bankruptcy risk.';
    }

    return {
      score: zScore,
      components: { x1, x2, x3, x4, x5 },
      interpretation,
      distressZone
    };
  }

  /**
   * Calculate Piotroski F-Score for fundamental analysis
   */
  private calculatePiotroskiScore(data: FinancialData): PiotroskiScore {
    const curr = data.current;
    const prev = data.previous;
    let score = 0;

    // Profitability signals (4 points)
    const netIncomePositive = curr.netIncome > 0;
    if (netIncomePositive) score++;

    const operatingCashFlowPositive = curr.operatingCashFlow > 0;
    if (operatingCashFlowPositive) score++;

    const roaImprovement = curr.roa! > prev.roa!;
    if (roaImprovement) score++;

    const accrualQuality = curr.operatingCashFlow > curr.netIncome;
    if (accrualQuality) score++;

    // Leverage, liquidity, and source of funds (3 points)
    const currLeverage = curr.ltDebt / curr.totalAssets;
    const prevLeverage = prev.ltDebt / prev.totalAssets;
    const leverageDecrease = currLeverage < prevLeverage;
    if (leverageDecrease) score++;

    const liquidityIncrease = curr.currentRatio! > prev.currentRatio!;
    if (liquidityIncrease) score++;

    const noNewShares = curr.sharesOutstanding <= prev.sharesOutstanding;
    if (noNewShares) score++;

    // Operating efficiency (2 points)
    const grossMarginImprovement = curr.grossMargin! > prev.grossMargin!;
    if (grossMarginImprovement) score++;

    const assetTurnoverImprovement = curr.assetTurnover! > prev.assetTurnover!;
    if (assetTurnoverImprovement) score++;

    // Determine quality rating and interpretation
    let qualityRating: 'POOR' | 'WEAK' | 'AVERAGE' | 'GOOD' | 'EXCELLENT';
    let interpretation: string;

    if (score >= 8) {
      qualityRating = 'EXCELLENT';
      interpretation = 'Excellent fundamental strength. High-quality company.';
    } else if (score >= 6) {
      qualityRating = 'GOOD';
      interpretation = 'Good fundamental strength. Solid company fundamentals.';
    } else if (score >= 4) {
      qualityRating = 'AVERAGE';
      interpretation = 'Average fundamental strength. Mixed signals.';
    } else if (score >= 2) {
      qualityRating = 'WEAK';
      interpretation = 'Weak fundamental strength. Poor company fundamentals.';
    } else {
      qualityRating = 'POOR';
      interpretation = 'Very poor fundamental strength. Significant financial weakness.';
    }

    return {
      score,
      components: {
        profitability: {
          netIncomePositive,
          operatingCashFlowPositive,
          roaImprovement,
          accrualQuality
        },
        leverage: {
          leverageDecrease,
          liquidityIncrease,
          noNewShares
        },
        efficiency: {
          grossMarginImprovement,
          assetTurnoverImprovement
        }
      },
      interpretation,
      qualityRating
    };
  }

  /**
   * Perform Benford's Law test for detecting data manipulation
   */
  private performBenfordsLawTest(data: FinancialData): BenfordsLawTest {
    // Extract all financial figures from current and previous periods
    const figures = this.extractFinancialFigures(data);
    
    // Get first digits
    const firstDigits = figures
      .filter(f => f > 0)
      .map(f => parseInt(String(Math.abs(f)).charAt(0)))
      .filter(d => d >= 1 && d <= 9);

    if (firstDigits.length < 30) {
      return {
        passed: false,
        chiSquare: 0,
        confidence: 0,
        observedDistribution: [],
        expectedDistribution: [],
        interpretation: 'Insufficient data for Benford\'s Law test (minimum 30 data points required)',
        suspiciousDigits: []
      };
    }

    // Expected Benford's distribution
    const expectedDistribution = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];

    // Calculate observed distribution
    const digitCounts = new Array(10).fill(0);
    firstDigits.forEach(digit => digitCounts[digit]++);
    
    const total = firstDigits.length;
    const observedDistribution = digitCounts.map(count => count / total);

    // Chi-square test
    let chiSquare = 0;
    const suspiciousDigits: number[] = [];
    
    for (let digit = 1; digit <= 9; digit++) {
      const expected = expectedDistribution[digit] * total;
      const observed = digitCounts[digit];
      
      if (expected > 0) {
        const contribution = Math.pow(observed - expected, 2) / expected;
        chiSquare += contribution;
        
        // Check if this digit contributes significantly to deviation
        if (contribution > 3.84) { // Critical value for 1 degree of freedom at 95%
          suspiciousDigits.push(digit);
        }
      }
    }

    // Critical value for 8 degrees of freedom at 95% confidence: 15.507
    const passed = chiSquare < 15.507;
    const confidence = Math.max(0, 1 - (chiSquare / 50));

    const interpretation = passed 
      ? 'Financial figures follow Benford\'s Law distribution - likely authentic data'
      : `Significant deviation from Benford\'s Law detected (χ² = ${chiSquare.toFixed(2)}) - possible data manipulation`;

    return {
      passed,
      chiSquare,
      confidence,
      observedDistribution,
      expectedDistribution,
      interpretation,
      suspiciousDigits
    };
  }

  /**
   * Extract all financial figures for Benford's Law analysis
   */
  private extractFinancialFigures(data: FinancialData): number[] {
    const figures: number[] = [];
    
    const addFigures = (statement: FinancialStatement) => {
      figures.push(
        statement.revenue,
        statement.sales,
        statement.cogs,
        statement.grossProfit,
        statement.sga,
        statement.operatingIncome,
        statement.ebit,
        statement.netIncome,
        statement.currentAssets,
        statement.totalAssets,
        statement.ppe,
        statement.receivables,
        statement.retainedEarnings,
        statement.currentLiabilities,
        statement.totalLiabilities,
        statement.ltDebt,
        statement.operatingCashFlow,
        statement.marketCap
      );
      
      if (statement.depreciation) figures.push(statement.depreciation);
    };

    addFigures(data.current);
    addFigures(data.previous);
    
    if (data.historical) {
      data.historical.forEach(addFigures);
    }

    return figures.filter(f => !isNaN(f) && isFinite(f) && f !== 0);
  }

  /**
   * Identify red flags based on all analyses
   */
  private identifyRedFlags(
    beneish: BeneishMScore,
    altman: AltmanZScore,
    piotroski: PiotroskiScore,
    benford: BenfordsLawTest
  ): string[] {
    const redFlags: string[] = [];

    // Beneish M-Score red flags
    if (beneish.riskLevel === 'CRITICAL') {
      redFlags.push(`🚨 CRITICAL: Beneish M-Score (${beneish.score.toFixed(3)}) indicates high probability of earnings manipulation`);
    } else if (beneish.riskLevel === 'HIGH') {
      redFlags.push(`⚠️ HIGH RISK: Beneish M-Score (${beneish.score.toFixed(3)}) suggests possible earnings manipulation`);
    }

    // Component-specific red flags
    if (beneish.components.dsri > 1.5) {
      redFlags.push('⚠️ Significant increase in days sales in receivables - possible revenue recognition issues');
    }
    if (beneish.components.tata > 0.1) {
      redFlags.push('⚠️ High total accruals relative to assets - potential earnings management');
    }

    // Altman Z-Score red flags
    if (altman.distressZone === 'DISTRESS') {
      redFlags.push(`🚨 FINANCIAL DISTRESS: Altman Z-Score (${altman.score.toFixed(2)}) indicates high bankruptcy risk`);
    }

    // Piotroski F-Score red flags
    if (piotroski.qualityRating === 'POOR' || piotroski.qualityRating === 'WEAK') {
      redFlags.push(`⚠️ WEAK FUNDAMENTALS: Piotroski F-Score (${piotroski.score}/9) indicates poor financial quality`);
    }

    // Benford's Law red flags
    if (!benford.passed && benford.chiSquare > 0) {
      redFlags.push(`🚨 DATA MANIPULATION: Benford's Law test failed (χ² = ${benford.chiSquare.toFixed(2)}) - possible financial data manipulation`);
      
      if (benford.suspiciousDigits.length > 0) {
        redFlags.push(`🔍 Suspicious leading digits detected: ${benford.suspiciousDigits.join(', ')}`);
      }
    }

    return redFlags;
  }

  /**
   * Calculate overall risk level (0-100)
   */
  private calculateOverallRisk(
    beneish: BeneishMScore,
    altman: AltmanZScore,
    piotroski: PiotroskiScore,
    benford: BenfordsLawTest
  ): number {
    let risk = 0;

    // Beneish M-Score contribution (0-40 points)
    if (beneish.riskLevel === 'CRITICAL') {
      risk += 40;
    } else if (beneish.riskLevel === 'HIGH') {
      risk += 30;
    } else if (beneish.riskLevel === 'MEDIUM') {
      risk += 20;
    } else {
      risk += 5;
    }

    // Altman Z-Score contribution (0-25 points)
    if (altman.distressZone === 'DISTRESS') {
      risk += 25;
    } else if (altman.distressZone === 'GREY') {
      risk += 15;
    } else {
      risk += 5;
    }

    // Piotroski F-Score contribution (0-20 points)
    const piotroskiRisk = Math.max(0, (9 - piotroski.score) * 2.22);
    risk += piotroskiRisk;

    // Benford's Law contribution (0-15 points)
    if (!benford.passed) {
      risk += 15;
    } else {
      risk += Math.max(0, (1 - benford.confidence) * 10);
    }

    return Math.min(100, Math.max(0, Math.round(risk)));
  }

  /**
   * Calculate fraud probability (0-1)
   */
  private calculateFraudProbability(beneish: BeneishMScore, benford: BenfordsLawTest): number {
    let probability = 0;

    // Base probability from Beneish M-Score
    if (beneish.riskLevel === 'CRITICAL') {
      probability = 0.85; // 85% base probability
    } else if (beneish.riskLevel === 'HIGH') {
      probability = 0.65;
    } else if (beneish.riskLevel === 'MEDIUM') {
      probability = 0.35;
    } else {
      probability = 0.15;
    }

    // Adjust based on Benford's Law
    if (!benford.passed) {
      probability = Math.min(0.95, probability + 0.2);
    }

    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Generate comprehensive recommendation
   */
  private generateRecommendation(overallRisk: number, fraudProbability: number, redFlags: string[]): string {
    if (overallRisk >= 80 && fraudProbability >= 0.7 && redFlags.length >= 3) {
      return 'IMMEDIATE SEC ENFORCEMENT ACTION RECOMMENDED: Multiple critical fraud indicators detected. Consider criminal referral to DOJ.';
    } else if (overallRisk >= 60 && fraudProbability >= 0.5) {
      return 'ENHANCED INVESTIGATION REQUIRED: Significant fraud indicators detected. Initiate formal SEC investigation.';
    } else if (overallRisk >= 40) {
      return 'INCREASED MONITORING: Moderate risk indicators detected. Enhanced oversight and additional disclosures recommended.';
    } else if (overallRisk >= 25) {
      return 'ROUTINE MONITORING: Some risk indicators present. Continue standard regulatory oversight.';
    } else {
      return 'STANDARD OVERSIGHT: Financial metrics appear normal. Continue routine monitoring.';
    }
  }

  /**
   * Validate financial data completeness and consistency
   */
  private validateFinancialData(data: FinancialData): void {
    if (!data.current || !data.previous) {
      throw new Error('Both current and previous financial statements are required');
    }

    const requiredFields = [
      'revenue', 'sales', 'cogs', 'grossProfit', 'sga', 'netIncome', 'ebit',
      'currentAssets', 'totalAssets', 'ppe', 'receivables', 'retainedEarnings',
      'currentLiabilities', 'totalLiabilities', 'ltDebt', 'operatingCashFlow',
      'marketCap', 'sharesOutstanding'
    ];

    for (const field of requiredFields) {
      if (typeof data.current[field as keyof FinancialStatement] !== 'number' || 
          typeof data.previous[field as keyof FinancialStatement] !== 'number') {
        throw new Error(`Missing or invalid financial data field: ${field}`);
      }
    }

    // Validate calculated ratios or calculate them if missing
    if (!data.current.roa) {
      data.current.roa = data.current.netIncome / data.current.totalAssets;
    }
    if (!data.previous.roa) {
      data.previous.roa = data.previous.netIncome / data.previous.totalAssets;
    }

    if (!data.current.currentRatio) {
      data.current.currentRatio = data.current.currentAssets / data.current.currentLiabilities;
    }
    if (!data.previous.currentRatio) {
      data.previous.currentRatio = data.previous.currentAssets / data.previous.currentLiabilities;
    }

    if (!data.current.assetTurnover) {
      data.current.assetTurnover = data.current.sales / data.current.totalAssets;
    }
    if (!data.previous.assetTurnover) {
      data.previous.assetTurnover = data.previous.sales / data.previous.totalAssets;
    }

    if (!data.current.grossMargin) {
      data.current.grossMargin = data.current.grossProfit / data.current.sales;
    }
    if (!data.previous.grossMargin) {
      data.previous.grossMargin = data.previous.grossProfit / data.previous.sales;
    }

    // Set default depreciation if not provided
    if (!data.current.depreciation) {
      data.current.depreciation = data.current.totalAssets * 0.05; // Estimate 5% depreciation
    }
    if (!data.previous.depreciation) {
      data.previous.depreciation = data.previous.totalAssets * 0.05;
    }

    console.log('✅ Financial data validation completed');
  }
}