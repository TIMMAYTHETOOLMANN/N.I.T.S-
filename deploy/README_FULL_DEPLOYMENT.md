# NITS Full Deployment Script

## 🚀 Overview

The `nits_deployment_full.ts` script is the **complete forensic analysis platform** with all advanced capabilities integrated for production deployment.

## ✅ Features

This deployment script includes:

- **🧠 Full NITS Core analysis** - Complete legal violation detection with 4-level analysis
- **🛰️ SEC EDGAR auto-fetch** - Automated SEC filing retrieval and analysis
- **📦 Insider trading analysis (Form 4)** - Dedicated insider trading pattern detection
- **🤖 HuggingFace NLP integration** - Advanced ML-powered fraud detection
- **🌍 Multilingual NLP extension** - Multi-language document analysis
- **📊 Visual threat dashboard generator** - Interactive HTML + ASCII dashboards

## 📁 Output Location

All reports and dashboards are rendered to `./output/`:

```
output/
├── analysis_report.md              # Comprehensive analysis report
├── corpus_analysis_report.md       # Multi-document analysis (if enabled)
├── threat_dashboard.txt            # ASCII dashboard
└── threat_dashboard.html           # Interactive HTML dashboard
```

## 🚀 Quick Start

### Basic Execution

```bash
npx tsx deploy/nits_deployment_full.ts
```

### With Custom API Keys

```bash
# Set environment variables
export GOVINFO_API_KEY="your-govinfo-key"
export SEC_EDGAR_API_KEY="your-sec-key"
export HUGGINGFACE_API_KEY="your-hf-key"

# Run the script
npx tsx deploy/nits_deployment_full.ts
```

### Using .env File (Recommended)

```bash
# Create .env file
cat > .env << EOF
GOVINFO_API_KEY=your-govinfo-key
SEC_EDGAR_API_KEY=your-sec-key
HUGGINGFACE_API_KEY=your-hf-key
EOF

# Run the script
npx tsx deploy/nits_deployment_full.ts
```

## 📊 Module Breakdown

### Core Analysis Modules

1. **Legal System Harvester** (GovInfo)
   - Indexes CFR Titles 17 and 26
   - Cross-references all legal provisions
   - Provides statute-level violation detection

2. **Terminator Analysis Engine**
   - 4-level violation detection (Surface, Deep, Legal, ML)
   - Pattern matching and anomaly detection
   - Confidence scoring for each violation

3. **NLP Forensic Analyzer**
   - Fraud score calculation
   - Suspicious pattern detection
   - Risk level assessment

4. **Bayesian Risk Analyzer**
   - Statistical risk assessment
   - Probability-based predictions
   - Recommendation generation

5. **Financial Anomaly Detector**
   - Metric extraction
   - Statistical anomaly detection
   - Pattern analysis

6. **Document Correlation Analyzer**
   - Cross-document pattern detection
   - Entity linking
   - Timeline construction

### Enhanced Modules

7. **SEC EDGAR Auto-Fetch**
   - Fetches company filings by CIK
   - Downloads filing content
   - Extracts financial statements
   - Mock implementation for demo (connect to real SEC API in production)

8. **Form 4 Insider Trading Analyzer**
   - Detects insider trading patterns
   - Analyzes timing of trades
   - Flags suspicious activities
   - Generates insider trading scores

9. **HuggingFace NLP Integration**
   - Sentiment analysis
   - Emotion detection (deceptive, anxious, evasive)
   - Advanced fraud pattern detection
   - ML-powered predictions
   - Mock implementation (connect to real HuggingFace API in production)

10. **Multilingual NLP Extension**
    - Language detection (Russian, Chinese, Japanese, Korean, etc.)
    - Cross-lingual analysis
    - Cultural context flagging
    - International fraud pattern detection

11. **Visual Threat Dashboard Generator**
    - ASCII dashboard for terminal
    - HTML dashboard for browsers
    - Real-time metrics visualization
    - Color-coded threat levels

## 📋 Configuration

Edit the `CONFIG` object in `nits_deployment_full.ts`:

```typescript
const CONFIG = {
  GOVINFO_API_KEY: process.env.GOVINFO_API_KEY || 'DEMO_KEY_EMBEDDED_FALLBACK',
  SEC_EDGAR_API_KEY: process.env.SEC_EDGAR_API_KEY || 'DEMO_SEC_KEY',
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || 'DEMO_HF_KEY',
  INPUT_DIR: './sample_docs',
  OUTPUT_DIR: './output',
  DEFAULT_DOCUMENT: 'test_document.txt',
  ENABLE_CORPUS_ANALYSIS: true,    // Multi-document analysis
  ENABLE_EDGAR_FETCH: true,        // SEC EDGAR integration
  ENABLE_FORM4_ANALYSIS: true,     // Insider trading analysis
  ENABLE_MULTILINGUAL: true,       // Multi-language support
  ENABLE_DASHBOARD: true,          // Visual dashboards
  ENABLE_DETAILED_LOGGING: true    // Verbose output
};
```

## 🧪 Testing

### Test with Sample Documents

```bash
# Uses default sample documents in ./sample_docs/
npx tsx deploy/nits_deployment_full.ts
```

### Test with Custom Documents

```bash
# 1. Add your documents to sample_docs/
cp /path/to/your/document.txt sample_docs/

# 2. Update CONFIG.DEFAULT_DOCUMENT if needed

# 3. Run the script
npx tsx deploy/nits_deployment_full.ts
```

### Verify Output

```bash
# Check generated files
ls -la output/

# View ASCII dashboard
cat output/threat_dashboard.txt

# Open HTML dashboard in browser
open output/threat_dashboard.html  # macOS
xdg-open output/threat_dashboard.html  # Linux
start output/threat_dashboard.html  # Windows
```

## 📊 Sample Output

### Console Output

```
🔴 NITS FULL DEPLOYMENT v3.0
════════════════════════════════════════════════════════════
║   NITS TERMINATOR SYSTEM - FULL DEPLOYMENT             ║
║   OBJECTIVE: TOTAL VIOLATION EXPOSURE                  ║
║   MODE: ZERO TOLERANCE + FORENSIC ANALYSIS             ║
║   ENHANCED: SEC EDGAR + ML + DASHBOARD                 ║
════════════════════════════════════════════════════════════

🔐 Security Check:
   GovInfo API Key: DEMO******************BACK
   SEC EDGAR API Key: DEMO****_KEY
   HuggingFace API Key: DEMO***_KEY
   Status: ⚠️  Using Demo Keys

✅ ALL MODULES INITIALIZED SUCCESSFULLY
📋 Legal Provisions Indexed: 5

📊 Analysis Summary:
   Violations Detected: 4
   Threat Score: 75.0/100
   Criminal Violations: 2
   Total Penalties: $25,000,000
   Insider Trading Score: 61.5/100
   SEC Filings Analyzed: 1

📁 Output Files:
   - ./output/analysis_report.md
   - ./output/threat_dashboard.txt
   - ./output/threat_dashboard.html
   - ./output/corpus_analysis_report.md
```

### Visual Dashboard

The HTML dashboard provides:
- Real-time threat metrics with progress bars
- Violation breakdown by severity
- NLP analysis summary
- SEC EDGAR intelligence
- Actionable recommendations

## 🔒 Security Notes

- API keys are masked in console output
- Demo keys are used by default (safe for testing)
- Production deployment requires real API keys
- All keys should be stored in `.env` file, not hardcoded
- Add `.env` to `.gitignore` to prevent key leaks

## 🚨 Production Deployment

### Prerequisites

1. Node.js v14+ installed
2. TypeScript and tsx installed
3. Valid API keys for:
   - GovInfo API
   - SEC EDGAR API
   - HuggingFace API (optional)

### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd N.I.T.S-
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run Deployment Script**
   ```bash
   npx tsx deploy/nits_deployment_full.ts
   ```

5. **Review Output**
   - Check `./output/` directory for reports
   - Open `threat_dashboard.html` for visual analysis
   - Review violation details in markdown reports

## 🔄 Integration with CI/CD

### GitHub Actions Example

```yaml
name: NITS Full Analysis
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npx tsx deploy/nits_deployment_full.ts
        env:
          GOVINFO_API_KEY: ${{ secrets.GOVINFO_API_KEY }}
          SEC_EDGAR_API_KEY: ${{ secrets.SEC_EDGAR_API_KEY }}
          HUGGINGFACE_API_KEY: ${{ secrets.HUGGINGFACE_API_KEY }}
      - uses: actions/upload-artifact@v2
        with:
          name: analysis-reports
          path: output/
```

## 📚 Documentation

- Full analysis methodology: See `IMPLEMENTATION_SUMMARY.md`
- Core integration: See `deploy/README_INTEGRATION_PATCH.md`
- Quick start guide: See `QUICKSTART.md`

## 🆘 Troubleshooting

### Common Issues

**Issue**: `Module not found` errors
```bash
# Solution: Install dependencies
npm install
```

**Issue**: `Cannot read file` errors
```bash
# Solution: Ensure sample_docs/ directory exists with test documents
mkdir -p sample_docs
cp your-document.txt sample_docs/
```

**Issue**: `Permission denied` on output directory
```bash
# Solution: Create output directory with correct permissions
mkdir -p output
chmod 755 output
```

**Issue**: API key errors (if using real APIs)
```bash
# Solution: Verify API keys are set correctly
echo $GOVINFO_API_KEY
# Or check .env file exists and is loaded
```

## 🎯 Next Steps

After successful deployment:

1. ✅ Review generated reports in `./output/`
2. ✅ Analyze threat dashboard for high-priority issues
3. ✅ Investigate flagged violations
4. ✅ Generate prosecution packages for criminal violations
5. ✅ Coordinate with SEC/DOJ for enforcement actions

## 📞 Support

For issues or questions:
- Check documentation in `docs/` directory
- Review implementation summary
- Open an issue on GitHub

---

**Ready to launch forensic airstrikes on command. 🚀**
