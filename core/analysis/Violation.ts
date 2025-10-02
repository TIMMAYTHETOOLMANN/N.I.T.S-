export interface Penalty {
  type: 'MONETARY' | 'IMPRISONMENT' | 'LICENSE_REVOCATION';
  amount?: number;
  duration?: string;
  unit?: string;
  text: string;
}

export interface Violation {
  type: string;
  statute: string;
  description: string;
  evidence: string[];
  confidence: number;
  severity: number;
  penalties: Penalty[];
  recommendation: string;
}
