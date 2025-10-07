/**
 * JUNI: Keyword Expansion Engine
 * Advanced keyword expansion with corpus learning and co-occurrence analysis
 */

export interface KeywordMetrics {
  word: string;
  frequency: number;
  cooccurrence: number;
}

export class KeywordEngine {
  
  // INJECTION_POINT: keyword_expansion
  
  private keywords: string[] = [];

  private readonly SEED_KEYWORDS = [
    'fraud', 'misstatement', 'omit', 'omission', 'undisclosed', 'material',
    'inaccurate', 'restatement', 'channel stuffing', 'off-balance', 'deferred',
    'undisclosed liability', 'related party', 'undisclosed transactions',
    'revenue recognition', 'cookie jar', 'round tripping', 'bill and hold'
  ];

  constructor() {
    this.keywords = [...this.SEED_KEYWORDS];
  }

  expandKeywords(corpus: string[]): string[] {
    const wordCounts = new Map<string, number>();
    const cooccurrenceMatrix = new Map<string, Set<string>>();

    // Count word frequencies and track co-occurrences
    for (const doc of corpus) {
      const tokens = doc.toLowerCase().split(/\W+/);
      const uniqueTokens = new Set(tokens);

      for (const token of tokens) {
        if (token.length > 3) {
          wordCounts.set(token, (wordCounts.get(token) || 0) + 1);

          // Track co-occurrence with seed keywords
          if (!cooccurrenceMatrix.has(token)) {
            cooccurrenceMatrix.set(token, new Set());
          }
          for (const seedKw of this.SEED_KEYWORDS) {
            if (uniqueTokens.has(seedKw.toLowerCase())) {
              cooccurrenceMatrix.get(token)!.add(seedKw);
            }
          }
        }
      }
    }

    // Score candidates based on frequency and co-occurrence
    const candidates: KeywordMetrics[] = Array.from(wordCounts.entries())
      .filter(([w, count]) => {
        const isNotSeed = !this.SEED_KEYWORDS.some(kw => kw.toLowerCase() === w);
        const isFrequent = count > 5;
        const hasCooccurrence = cooccurrenceMatrix.get(w)?.size || 0 > 0;
        return isNotSeed && isFrequent && hasCooccurrence;
      })
      .map(([word, frequency]) => ({
        word,
        frequency,
        cooccurrence: cooccurrenceMatrix.get(word)?.size || 0
      }))
      .sort((a, b) => {
        // Sort by co-occurrence first, then frequency
        if (b.cooccurrence !== a.cooccurrence) {
          return b.cooccurrence - a.cooccurrence;
        }
        return b.frequency - a.frequency;
      })
      .slice(0, 50);

    const expandedKeywords = this.SEED_KEYWORDS.concat(
      candidates.map(c => c.word)
    );

    console.log(`🔍 Expanded keywords: ${this.SEED_KEYWORDS.length} → ${expandedKeywords.length}`);
    console.log(`   Top candidates: ${candidates.slice(0, 5).map(c => c.word).join(', ')}`);

    this.keywords = expandedKeywords;
    return expandedKeywords;
  }

  getKeywords(): string[] {
    return [...this.keywords];
  }
}
