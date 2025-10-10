# NITS Core Legal Engine

[![Status](https://img.shields.io/badge/status-operational-brightgreen)]()
[![Version](https://img.shields.io/badge/version-3.0-blue)]()
[![Mode](https://img.shields.io/badge/mode-zero_tolerance-red)]()

**Objective:** Total Violation Exposure  
**Mission:** Forensic legal analysis with surgical precision

## Overview

This is the minimal, lethal core repository for NITS - a precision-engineered legal violation detection system. The system harvests legal provisions, performs multi-level forensic analysis, and generates prosecution packages with maximum penalty calculations.

## Features

✅ **ML Service with OCR** 🧠 NEW
- Python-based ML service for advanced document processing
- OCR capabilities for scanned PDFs (Tesseract + Poppler)
- Semantic analysis and contradiction detection
- Financial sentiment analysis with transformer models
- One-command automated setup script
- See [QUICK_SETUP_ML_SERVICE.md](QUICK_SETUP_ML_SERVICE.md) or [ML_SERVICE_SETUP_GUIDE.md](ML_SERVICE_SETUP_GUIDE.md)

✅ **Deployment & Fix Guide** 🔧
- Comprehensive deployment guide with 7 critical fixes
- Python implementation with enhanced error handling
- System diagnostics and validation tools
- Production-ready with all security fixes applied
- See [DEPLOYMENT_FIX_GUIDE.md](DEPLOYMENT_FIX_GUIDE.md)

✅ **AI Investigator** 🤖
- GPT-4 powered intelligent document analysis
- Automated SEC, DOJ, IRS violation detection
- Legal statute citation and recommendations
- Integrates seamlessly with existing analysis pipeline
- See [AI_INVESTIGATOR_README.md](AI_INVESTIGATOR_README.md)

✅ **Local LLM Integration** 🧠 NEW
- Offline document analysis with local GGUF models
- Privacy-first: All data stays on your machine
- No API costs or rate limits
- Supports llama-node with GGUF models (Mistral, LLaMA-2, etc.)
- One-command bootstrap script for setup
- See [nits-vantablack/README.md](nits-vantablack/README.md)

✅ **Web-Based GUI** 🎯
- Lightweight web interface for document analysis
- Drag-and-drop file upload
- Real-time analysis results with visual threat indicators
- Detailed violation breakdown with severity scoring
- Easy testing and validation workflow

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
│   ├── Violation.ts
│   └── AIInvestigator.ts     # 🤖 NEW: GPT-4 AI analysis
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

ml_service/          # 🧠 NEW: Python ML Service
├── main.py          # Flask API server
├── requirements.txt # ML dependencies
└── setup_ml_service.sh  # Automated setup

proof/
└── exporters/       # TCR, DOJ referral generation
```

## Quick Start

### Option 1: Python Deployment (Production Ready) 🔧 NEW
```bash
# Install Python dependencies
pip install PyMuPDF pandas scikit-learn fuzzywuzzy python-Levenshtein nltk

# Run system diagnostics
python diagnostics.py

# Run critical fixes demo
python critical_fixes.py

# Check deployment guide
cat DEPLOYMENT_FIX_GUIDE.md
```

See [DEPLOYMENT_FIX_GUIDE.md](DEPLOYMENT_FIX_GUIDE.md) for complete deployment instructions.

### Option 2: AI Investigator Mode 🤖
```bash
# Install dependencies
npm install

# Configure API key (copy .env.example to .env and add your OpenAI key)
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=your_key_here

# Run AI analysis test
npx tsx test_ai_investigator.ts

# Check AI report
cat output/ai_test_document.md
```

See [AI_INVESTIGATOR_README.md](AI_INVESTIGATOR_README.md) for full documentation.

### Option 3: Local LLM Mode (Offline) 🧠 NEW
```bash
# One-command setup
chmod +x scripts/bootstrap_local.sh
./scripts/bootstrap_local.sh

# This will:
# - Install llama-node dependencies
# - Download Nous-Hermes-2-Mistral-7B model (~4GB)
# - Configure the system
# - Run a test analysis

# Use in your code
node -e "
import('./nits-vantablack/ml_integration/local_model.js').then(async ({ analyzeWithLLM }) => {
  const result = await analyzeWithLLM('Your document text here', 'summary');
  console.log(result);
});
"
```

See [nits-vantablack/README.md](nits-vantablack/README.md) for full documentation.

### Option 4: GUI Mode (Easiest) 🎯
```bash
# Install dependencies
npm install

# Start the GUI server
npm run start:gui

# Open browser to http://localhost:4000
# Upload documents and view results in real-time
```

See [GUI_README.md](GUI_README.md) for full GUI documentation.

### Option 4: Complete Integration Patch (TypeScript)
```bash
# Install dependencies
npm install

# Run the complete integration patch
npx tsx deploy/complete_integration_patch.ts

# View generated reports
ls -l output/
```

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

### Option 5: Core Legal Engine
```bash
# Run the core legal engine
npm run start
```

## Usage Example

### AI Investigator Integration 🤖

```typescript
import { IntegratedNITSCore } from './deploy/complete_integration_patch';

// Initialize NITS Core with AI capabilities
const nits = new IntegratedNITSCore();
await nits.initialize();

// Run AI-powered analysis
await nits.analyzeUsingAI('./sample_docs/test_document.txt');
// Output: ./output/ai_test_document.md

// Or run traditional analysis
const result = await nits.analyzeDocument('./sample_docs/test_document.txt');
console.log(`Threat Level: ${result.overallThreatLevel}/100`);
console.log(`Violations: ${result.violations.length}`);
```

### Core Engine Usage

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

## Complete Integration Patch ⭐ NEW

**Status: PRODUCTION READY ✅**

The Complete Integration Patch (`deploy/complete_integration_patch.ts`) provides a fully-integrated, feature-complete analysis system:

✅ **All Enhancement Modules Integrated**
- GovInfo API Key Integration with security masking
- NLP Forensic Analysis
- Financial Forensics & Anomaly Detection
- Bayesian Risk Assessment
- Cross-Document Correlation Analysis

✅ **Dual-Mode Analysis**
- Single document analysis
- Corpus analysis (multiple documents)

✅ **Automated Reporting**
- Professional Markdown reports
- Prosecution package generation
- Threat scoring (0-100)
- DOJ referral automation

📚 **Documentation**
- [Complete Integration Patch Guide](deploy/README_INTEGRATION_PATCH.md)
- [Quick Start Guide](QUICKSTART.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

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

**Phase 3: Complete Integration Patch (COMPLETE ✅)**
- [x] Full system integration script
- [x] Markdown report exporters
- [x] Corpus analysis capabilities
- [x] API key management with security
- [x] Production logging system

**Phase 4: GUI Interface (COMPLETE ✅)** 🎯 NEW
- [x] Web-based GUI server (Express + EJS)
- [x] File upload with drag-and-drop support
- [x] Real-time analysis visualization
- [x] Threat level indicators with color coding
- [x] Detailed violation breakdown
- [x] IntegratedNITSCore wrapper class

## Technology Stack

- **TypeScript** - Type-safe legal analysis
- **Node.js** - Runtime environment
- **ts-node** - Development execution

## Legal Compliance

This system is designed for legal compliance analysis and violation detection. All analysis results should be reviewed by qualified legal counsel before taking enforcement action.

## License

See LICENSE file for details.
