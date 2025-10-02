// Prosecution package builder for evidence compilation

import { Violation } from '../analysis/Violation';

export interface ProsecutionPackageData {
  secFormTCR: {
    criminalCount: number;
    civilCount: number;
    totalViolations: number;
  };
  dojReferral: {
    criminalViolations: Violation[];
    recommendation: string;
  } | null;
  evidenceInventory: string[];
  witnessPool: any[];
  assetTrace: any[];
  timelineOfEvents: any[];
  monetaryImpact: number;
  recommendedCharges: string[];
  prosecutionStrategy: string;
}

export class ProsecutionPackage {
  static generate(violations: Violation[]): ProsecutionPackageData {
    const criminalViolations = violations.filter(v => v.severity > 70);
    const civilViolations = violations.filter(v => v.severity > 30 && v.severity <= 70);
    
    return {
      secFormTCR: {
        criminalCount: criminalViolations.length,
        civilCount: civilViolations.length,
        totalViolations: violations.length
      },
      dojReferral: criminalViolations.length > 0 ? {
        criminalViolations,
        recommendation: 'IMMEDIATE_PROSECUTION'
      } : null,
      evidenceInventory: violations.map(v => v.evidence).flat(),
      witnessPool: [],
      assetTrace: [],
      timelineOfEvents: [],
      monetaryImpact: violations.reduce((sum, v) => {
        const monetaryPenalty = v.penalties.find(p => p.type === 'MONETARY');
        return sum + (monetaryPenalty?.amount || 0);
      }, 0),
      recommendedCharges: violations.map(v => v.statute),
      prosecutionStrategy: criminalViolations.length > 0 ? 
        'AGGRESSIVE_CRIMINAL_PROSECUTION' : 
        'CIVIL_ENFORCEMENT'
    };
  }

  static calculateMaximumPenalties(violations: Violation[]): { monetary: number; imprisonment: number } {
    let monetary = 0;
    let imprisonment = 0;
    
    for (const violation of violations) {
      for (const penalty of violation.penalties) {
        if (penalty.type === 'MONETARY' && penalty.amount) {
          monetary += penalty.amount;
        } else if (penalty.type === 'IMPRISONMENT' && penalty.duration) {
          imprisonment += parseFloat(penalty.duration);
        }
      }
    }
    
    return { monetary, imprisonment };
  }

  static generateRecommendation(violations: Violation[]): string {
    const criminalCount = violations.filter(v => v.severity > 80).length;
    
    if (criminalCount > 5) {
      return 'IMMEDIATE_DOJ_REFERRAL_CRIMINAL_PROSECUTION';
    } else if (criminalCount > 0) {
      return 'SEC_ENFORCEMENT_WITH_CRIMINAL_INVESTIGATION';
    } else if (violations.length > 10) {
      return 'AGGRESSIVE_CIVIL_ENFORCEMENT';
    } else if (violations.length > 0) {
      return 'ENHANCED_MONITORING_AND_COMPLIANCE';
    } else {
      return 'NO_SIGNIFICANT_VIOLATIONS_DETECTED';
    }
  }
}
