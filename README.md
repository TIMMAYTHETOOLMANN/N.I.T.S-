# NITS Core Legal Engine

[![Status](https://img.shields.io/badge/status-operational-brightgreen)]()
[![Version](https://img.shields.io/badge/version-3.0-blue)]()
[![Mode](https://img.shields.io/badge/mode-zero_tolerance-red)]()

**Objective:** Total Violation Exposure  
**Mission:** Forensic legal analysis with surgical precision

## Overview

This is the minimal, lethal core repository for NITS - a precision-engineered legal violation detection system. The system harvests legal provisions, performs multi-level forensic analysis, and generates prosecution packages with maximum penalty calculations.

## Features

✅ **Legal System Harvesting**
- CFR Title indexing (Securities, Tax Law)
- Automated provision extraction
- Cross-reference database

✅ **Multi-Level Analysis Engine**
- Surface pattern detection
- Deep forensic text analysis
- ML-powered anomaly detection
- Bayesian risk assessment
- Statistical violation scoring

✅ **Prosecution Package Generation**
- Evidence compilation
- Penalty calculations
- DOJ/SEC referral recommendations
- Criminal vs. civil classification

✅ **Document Ingestion**
- PDF extraction
- Excel parsing
- HTML content extraction

## Architecture

```
core/
├── govinfo/          # Legal provision harvesting
│   ├── GovInfoTerminator.ts
│   └── LegalProvision.ts
├── analysis/         # Violation detection engine
│   ├── TerminatorAnalysisEngine.ts
│   └── Violation.ts
├── nlp/             # Forensic text analysis
│   ├── ForensicTextAnalyzer.ts
│   └── BlacklightAnalyzer.ts
├── anomaly/         # Statistical detection
│   ├── AnomalyDetector.ts
│   └── BayesianRiskAnalyzer.ts
└── evidence/        # Prosecution package
    ├── ProsecutionPackage.ts
    └── EvidenceInventory.ts

ingestion/
├── pdf/             # PDF document parsing
├── excel/           # Spreadsheet analysis
├── html/            # Web content extraction
└── glamor/          # Public communications

proof/
└── exporters/       # TCR, DOJ referral generation
```

## Quick Start

```bash
# Install dependencies
npm install

# Run the legal engine
npm run start
```

## Usage Example

```typescript
import { TerminatorAnalysisEngine } from './core/analysis/TerminatorAnalysisEngine';
import { ProsecutionPackage } from './core/evidence/ProsecutionPackage';

// Initialize engine
const engine = new TerminatorAnalysisEngine();
await engine.initialize();

// Analyze document
const violations = await engine.terminateDocument(documentText);

// Generate prosecution package
const package = ProsecutionPackage.generate(violations);
const penalties = ProsecutionPackage.calculateMaximumPenalties(violations);

console.log(`Violations: ${violations.length}`);
console.log(`Total Penalties: $${penalties.monetary.toLocaleString()}`);
console.log(`Prison Time: ${penalties.imprisonment} years`);
```

## Output Example

```
🔴 NITS-CORE: Launching Legal Engine
════════════════════════════════════════════
║   NITS TERMINATOR SYSTEM v3.0 - CORE    ║
║   OBJECTIVE: TOTAL VIOLATION EXPOSURE   ║
║   MODE: ZERO TOLERANCE                  ║
════════════════════════════════════════════

✅ Legal engine initialized
⚖️ CFR Titles harvested: 5 provisions indexed
🧠 Violations cross-referenced: Multi-level analysis ready

💣 Termination report generated
═══════════════════════════════════════
📊 Total violations detected: 3
🔴 Criminal violations: 2
⚠️  Civil violations: 1
💰 Total penalties: $15,000,000
⛓️  Prison time: 0 years
⚖️  Strategy: AGGRESSIVE_CRIMINAL_PROSECUTION
📋 Recommendation: SEC_ENFORCEMENT_WITH_CRIMINAL_INVESTIGATION
═══════════════════════════════════════
```

## Migration Status

**Phase 1: Core Modules (COMPLETE ✅)**
- [x] GovInfoTerminator - Legal system harvesting
- [x] TerminatorAnalysisEngine - Multi-level analysis
- [x] ForensicTextAnalyzer - ML-powered text analysis
- [x] AnomalyDetector - Statistical anomaly detection
- [x] BayesianRiskAnalyzer - Multi-factor risk assessment
- [x] ProsecutionPackage - Evidence compilation

**Phase 2: Document Ingestion (COMPLETE ✅)**
- [x] PDF extraction framework
- [x] Excel parsing framework
- [x] HTML content extraction

**Phase 3: Exporters (Pending)**
- [ ] SEC TCR exporter
- [ ] DOJ referral generator
- [ ] Evidence inventory system

## Technology Stack

- **TypeScript** - Type-safe legal analysis
- **Node.js** - Runtime environment
- **ts-node** - Development execution

## Legal Compliance

This system is designed for legal compliance analysis and violation detection. All analysis results should be reviewed by qualified legal counsel before taking enforcement action.

## License

See LICENSE file for details.
