# NITS Core Legal Engine - Architecture Documentation

## System Overview

The NITS Core Legal Engine is a modular, precision-engineered system for detecting legal violations through multi-level forensic analysis. The architecture is designed for:

- **Surgical Precision**: Minimal false positives through multi-factor validation
- **Scalability**: Modular design allows independent component scaling
- **Extensibility**: New analysis modules can be added without core changes
- **Legal Rigor**: Evidence-based detection with statutory citations

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Deploy Layer                          │
│              (Pipeline Orchestration)                    │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│  Ingestion     │  │    Core      │  │     Proof      │
│   Layer        │  │   Analysis   │  │   Generation   │
│                │  │    Layer     │  │                │
│ • PDF          │  │ • GovInfo    │  │ • TCR Export   │
│ • Excel        │  │ • Analysis   │  │ • DOJ Referral │
│ • HTML         │  │ • NLP        │  │ • Evidence     │
│                │  │ • Anomaly    │  │                │
└────────────────┘  └──────────────┘  └────────────────┘
```

## Core Components

### 1. Legal System Harvesting (`core/govinfo/`)

**GovInfoTerminator**
- Harvests CFR titles from government sources
- Indexes legal provisions for fast lookup
- Maintains criminal liability assessments
- Supports multi-title simultaneous extraction

```typescript
// Key Features:
- CFR Title indexing (Securities: Title 17, Tax: Title 26)
- Provision caching for performance
- Penalty association
- Criminal vs civil classification
```

### 2. Analysis Engine (`core/analysis/`)

**TerminatorAnalysisEngine**
- Multi-level violation detection pipeline
- Integrates NLP, statistical, and rule-based analysis
- Generates comprehensive violation reports

**Analysis Levels:**
1. **Surface Scan** - Pattern matching for known violation indicators
2. **Deep Pattern** - ML-powered forensic text analysis
3. **Legal Cross-Reference** - Statutory compliance checking
4. **ML Anomaly Detection** - Statistical outlier identification

```typescript
interface Violation {
  type: string;              // Violation classification
  statute: string;           // Legal basis (e.g., "15 U.S.C. § 78j(b)")
  description: string;       // Human-readable explanation
  evidence: string[];        // Supporting evidence
  confidence: number;        // Detection confidence (0-100)
  severity: number;          // Risk score (0-100)
  penalties: Penalty[];      // Potential sanctions
  recommendation: string;    // Action recommendation
}
```

### 3. NLP & ML Analysis (`core/nlp/`, `core/anomaly/`)

**ForensicTextAnalyzer**
- Fraud indicator detection
- Language complexity analysis
- Financial terminology density scoring
- Pattern-based risk assessment

**AnomalyDetector**
- Statistical outlier detection
- Profit margin analysis
- Benford's Law validation
- Transaction timing analysis

**BayesianRiskAnalyzer**
- Multi-factor risk assessment
- Confidence scoring through evidence aggregation
- Recommendation generation (IMMEDIATE_INVESTIGATION, ENHANCED_MONITORING, STANDARD_REVIEW)

### 4. Evidence & Prosecution (`core/evidence/`)

**ProsecutionPackage**
- Compiles violations into prosecution-ready format
- Calculates maximum penalties
- Generates strategic recommendations
- Classifies criminal vs civil violations

```typescript
interface ProsecutionPackageData {
  secFormTCR: {
    criminalCount: number;
    civilCount: number;
    totalViolations: number;
  };
  dojReferral: { ... } | null;
  evidenceInventory: string[];
  monetaryImpact: number;
  recommendedCharges: string[];
  prosecutionStrategy: string;
}
```

### 5. Document Ingestion (`ingestion/`)

Modular extractors for different document types:

**PdfExtractor**
- Massive document support (300+ pages)
- Metadata extraction
- Table and footnote parsing

**ExcelParser**
- Multi-sheet workbook support
- Financial metric extraction
- Transaction analysis

**HtmlExtractor**
- Web content extraction
- Link analysis
- Table parsing

## Data Flow

```
1. Document Input
   ↓
2. Ingestion Layer (PDF/Excel/HTML)
   ↓
3. Text Extraction & Normalization
   ↓
4. Legal System Query (GovInfoTerminator)
   ↓
5. Multi-Level Analysis
   ├─ Surface Pattern Detection
   ├─ Forensic Text Analysis
   ├─ Statistical Anomaly Detection
   ├─ Legal Cross-Reference
   └─ Bayesian Risk Assessment
   ↓
6. Violation Aggregation
   ↓
7. Prosecution Package Generation
   ↓
8. Output (TCR, DOJ Referral, Evidence Inventory)
```

## Module Integration

### Analysis Pipeline

```typescript
// 1. Initialize System
const terminator = new GovInfoTerminator();
await terminator.harvestEntireLegalSystem();

const engine = new TerminatorAnalysisEngine();
await engine.initialize();

// 2. Analyze Document
const violations = await engine.terminateDocument(documentText);

// 3. Generate Output
const package = ProsecutionPackage.generate(violations);
const penalties = ProsecutionPackage.calculateMaximumPenalties(violations);
const recommendation = ProsecutionPackage.generateRecommendation(violations);
```

## Performance Considerations

**Memory Management**
- Streaming for large documents
- Chunked processing for 300+ page PDFs
- Provision caching for fast lookup

**Scalability**
- Independent module scaling
- Stateless analysis (except provision cache)
- Parallel violation detection

**Accuracy**
- Multi-level validation reduces false positives
- Confidence scoring on all detections
- Manual review flags for edge cases

## Extension Points

### Adding New Analysis Modules

```typescript
// 1. Implement analysis logic
class NewAnalysisModule {
  analyze(content: ExtractedContent): Violation[] {
    // Custom analysis logic
  }
}

// 2. Integrate into TerminatorAnalysisEngine
private async newAnalysisLevel(content: ExtractedContent): Promise<Violation[]> {
  const module = new NewAnalysisModule();
  return module.analyze(content);
}

// 3. Add to analysis pipeline
violations.push(...await this.newAnalysisLevel(content));
```

### Adding Document Types

```typescript
// 1. Create new extractor
export class NewDocumentExtractor {
  extractFromBuffer(buffer: ArrayBuffer): ExtractedContent {
    // Extraction logic
  }
}

// 2. Use in pipeline
const extractor = new NewDocumentExtractor();
const content = await extractor.extractFromBuffer(buffer);
const violations = await engine.terminateDocument(content.text);
```

## Security & Privacy

- No external API calls (operates locally)
- No data persistence (stateless analysis)
- No PII storage
- Legal provision cache only

## Future Enhancements

**Phase 2: Advanced NLP**
- Sentiment analysis
- Entity relationship extraction
- Timeline construction
- Cross-document correlation

**Phase 3: ML Enhancement**
- Neural network-based fraud detection
- Transfer learning from legal precedents
- Automated feature engineering

**Phase 4: Export Systems**
- SEC TCR form generation
- DOJ referral formatting
- Evidence packaging automation
- Timeline visualization

## Technology Stack

- **TypeScript**: Type safety for legal analysis
- **Node.js**: Runtime environment
- **Modular Architecture**: Independent, replaceable components
- **Zero External Dependencies**: Core analysis runs completely offline

## Testing Strategy

- Unit tests for each analyzer module
- Integration tests for analysis pipeline
- Validation against known legal cases
- False positive rate monitoring

## Deployment

```bash
# Development
npm run start

# Production
npm run build
node dist/deploy/pipeline.js
```

## Monitoring & Logging

- Comprehensive console logging
- Progress tracking for long operations
- Performance timing
- Violation statistics
