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

  /** Exact text span or snippet triggering this violation */
  documentSpan?: { start: number; end: number };
  /** Extracted snippet of content (text or table cell) */
  extractedText?: string;
  /** The type of evidence: text, table, footnote */
  evidenceType?: 'text' | 'table' | 'footnote';
  /** Logical explanation why this match triggers the violation */
  triggerLogic?: string;
  /** Estimated penalty or exposure */
  estimatedPenalties?: {
    monetary?: number;
    imprisonment?: number;
    civilFine?: boolean;
  };
  /** Context surrounding the violation in the document */
  context?: string;
  /** Location in the document where violation occurs */
  location?: { start: number; end: number } | null;
  /** All contexts for violations with multiple matches */
  allContexts?: string[];
  /** All locations for violations with multiple matches */
  allLocations?: Array<{ start: number; end: number }>;
}
