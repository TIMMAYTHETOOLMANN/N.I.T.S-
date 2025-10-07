/**
 * JUNI: Footer Microtext Scanner
 * Detects hidden statements and fine print in document footers
 */

export interface FooterViolation {
  type: 'FOOTER_MICRO_VIOLATION';
  extractedText: string;
  pageNumber: number;
  triggerKeyword: string;
  confidence: number;
}

export class FooterMicrotextScanner {
  private keywordSet: Set<string>;

  constructor(keywords: string[]) {
    this.keywordSet = new Set(keywords.map(k => k.toLowerCase()));
  }

  scanFooters(pages: Array<{ text: string; pageNum: number }>): FooterViolation[] {
    const violations: FooterViolation[] = [];

    for (const page of pages) {
      const lines = page.text.split('\n');
      const footerLines = lines.slice(-3);

      footerLines.forEach((line, idx) => {
        const lowercaseLine = line.toLowerCase();
        const words = lowercaseLine.split(/\W+/);

        for (const word of words) {
          if (this.keywordSet.has(word)) {
            const linePosition = lines.length - 3 + idx;
            const confidence = this.calculateFooterConfidence(
              line,
              word,
              linePosition,
              lines.length
            );

            violations.push({
              type: 'FOOTER_MICRO_VIOLATION',
              extractedText: line.trim(),
              pageNumber: page.pageNum,
              triggerKeyword: word,
              confidence: confidence
            });

            break;
          }
        }
      });
    }

    console.log(`🔍 Footer scan: ${violations.length} violations found`);
    return violations;
  }

  private calculateFooterConfidence(
    line: string,
    keyword: string,
    linePosition: number,
    totalLines: number
  ): number {
    let confidence = 0.6;

    if (linePosition === totalLines - 1) confidence += 0.2;
    if (line === line.toUpperCase()) confidence += 0.1;
    if (line.length < 100) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}
