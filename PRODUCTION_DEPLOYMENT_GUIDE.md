# NITS Production Deployment Guide

**Version**: 3.0+  
**Last Updated**: October 6, 2025  
**Status**: ✅ PRODUCTION READY

---

## Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

**Expected Output**: ~550 packages installed successfully

### Step 2: Choose Your Deployment Mode

Pick the script that matches your requirements:

#### Option A: Standard Production (Recommended)
```bash
npx tsx deploy/complete_integration_patch.ts
```
**Features**: All core analysis, NLP, financial forensics, Bayesian risk assessment

#### Option B: Advanced Production (With Dashboards)
```bash
npx tsx deploy/nits_deployment_full.ts
```
**Features**: Everything in Option A + SEC EDGAR + Insider Trading + Dashboards

#### Option C: Ultimate (ML-Enhanced)
```bash
# Requires Python ML service (see below)
npx tsx deploy/ultimate_nits_integration.ts
```
**Features**: Everything in Option B + Semantic Analysis + OCR + Knowledge Graphs

### Step 3: Check Output

```bash
ls -lh output/
```

**Expected Files**:
- `analysis_report.md` - Detailed violation analysis
- `corpus_analysis_report.md` - Multi-document correlation
- `threat_dashboard.txt` - ASCII dashboard (Option B)
- `threat_dashboard.html` - Interactive dashboard (Option B)

---

## Detailed Setup Instructions

### Environment Setup

#### 1. System Requirements

**Minimum:**
- Node.js 18+
- 8GB RAM
- 1GB disk space

**Recommended:**
- Node.js 18+
- 16GB RAM
- 2GB disk space
- SSD storage

#### 2. API Keys (Optional)

The system works with demo keys, but you can use production keys:

**Create `.env` file:**
```bash
# GovInfo API Key (optional - has demo fallback)
GOVINFO_API_KEY=your-govinfo-api-key

# SEC EDGAR API Key (optional - for full deployment)
SEC_EDGAR_API_KEY=your-sec-edgar-key

# HuggingFace API Key (optional - for advanced NLP)
HUGGINGFACE_API_KEY=your-huggingface-key
```

**Get API Keys:**
- GovInfo: https://api.govinfo.gov/
- SEC EDGAR: https://www.sec.gov/edgar
- HuggingFace: https://huggingface.co/settings/tokens

#### 3. Input Documents

Place your documents in `sample_docs/`:

```bash
cp /path/to/your/document.pdf sample_docs/
cp /path/to/another/document.txt sample_docs/
```

**Supported Formats:**
- ✅ PDF (digital and scanned)
- ✅ TXT (plain text)
- ✅ More formats with Ultimate NITS

---

## Deployment Modes Explained

### Mode 1: Complete Integration Patch

**Script**: `deploy/complete_integration_patch.ts`  
**Best For**: Standard production deployment

**Includes:**
- ✅ Legal compliance analysis (CFR Title 17, 26)
- ✅ NLP forensic text analysis
- ✅ Financial anomaly detection
- ✅ Bayesian risk assessment
- ✅ Cross-document correlation
- ✅ AI-powered investigation
- ✅ Precision intelligence (extracted text, penalties)
- ✅ Prosecution package generation

**Output:**
- Comprehensive Markdown reports
- Violation summaries with confidence scores
- Estimated penalties and imprisonment
- DOJ referral recommendations

**Run:**
```bash
npx tsx deploy/complete_integration_patch.ts
```

**Expected Runtime**: 3-10 seconds per document

---

### Mode 2: Full Deployment System

**Script**: `deploy/nits_deployment_full.ts`  
**Best For**: Advanced production with dashboards

**Everything in Mode 1, PLUS:**
- ✅ SEC EDGAR auto-fetch integration
- ✅ Form 4 insider trading analysis
- ✅ HuggingFace advanced NLP
- ✅ Multilingual document analysis
- ✅ Visual threat dashboards (TXT + HTML)

**Additional Features:**
- Real-time threat meter visualization
- Insider trading timeline graphs
- Fraud pattern matrices
- Interactive HTML dashboards
- Sentiment analysis with confidence scores

**Run:**
```bash
npx tsx deploy/nits_deployment_full.ts
```

**Expected Runtime**: 5-15 seconds per document

**View Dashboard:**
```bash
# Open in browser
open output/threat_dashboard.html

# Or view in terminal
cat output/threat_dashboard.txt
```

---

### Mode 3: Ultimate NITS (Advanced)

**Script**: `deploy/ultimate_nits_integration.ts`  
**Best For**: Research, high-accuracy requirements, ML integration

**Everything in Mode 2, PLUS:**
- ✅ Advanced PDF extraction with OCR
- ✅ Semantic contradiction detection
- ✅ Multi-model financial forensics
- ✅ Neo4j knowledge graph analysis
- ✅ Python ML service integration

**Requirements:**
```bash
# Install Python dependencies
pip install -r python_requirements.txt

# Start ML service (in separate terminal)
python python_bridge/ml_service.py

# Optional: Start Neo4j
docker run -d --name nits-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/nits_password_2024 \
  neo4j:latest
```

**Run:**
```bash
npx tsx deploy/ultimate_nits_integration.ts
```

**Expected Runtime**: 10-30 seconds per document (depends on ML models)

**Note**: Falls back gracefully if Python ML service is not available.

---

## Configuration Options

### Complete Integration Patch Config

Edit `deploy/complete_integration_patch.ts`:

```typescript
const CONFIG = {
  GOVINFO_API_KEY: process.env.GOVINFO_API_KEY || 'DEMO_KEY_EMBEDDED_FALLBACK',
  INPUT_DIR: './sample_docs',           // Change input location
  OUTPUT_DIR: './output',                // Change output location
  DEFAULT_DOCUMENT: 'test_document.txt', // Default file to analyze
  ENABLE_CORPUS_ANALYSIS: true,          // Multi-document analysis
  ENABLE_DETAILED_LOGGING: true          // Verbose console output
};
```

### Full Deployment Config

Edit `deploy/nits_deployment_full.ts`:

```typescript
const CONFIG = {
  // API Keys
  GOVINFO_API_KEY: process.env.GOVINFO_API_KEY || 'DEMO_KEY_EMBEDDED_FALLBACK',
  SEC_EDGAR_API_KEY: process.env.SEC_EDGAR_API_KEY || 'DEMO_SEC_KEY',
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || 'DEMO_HF_KEY',
  
  // Directories
  INPUT_DIR: './sample_docs',
  OUTPUT_DIR: './output',
  DEFAULT_DOCUMENT: 'test_document.txt',
  
  // Feature Flags
  ENABLE_CORPUS_ANALYSIS: true,
  ENABLE_EDGAR_FETCH: true,
  ENABLE_FORM4_ANALYSIS: true,
  ENABLE_MULTILINGUAL: true,
  ENABLE_DASHBOARD: true,
  ENABLE_DETAILED_LOGGING: true
};
```

---

## Understanding the Output

### Analysis Report Structure

```markdown
# NITS Analysis Report

## Executive Summary
- Threat Score: 0-100
- Violations Detected: Count
- Criminal vs Civil
- Total Penalties

## Analysis Modules
### NLP Forensic Analysis
- Fraud Score
- Suspicious Patterns
- Risk Level

### Legal Violations
For each violation:
- Type (INSIDER_TRADING, FRAUD, etc.)
- Statute (15 U.S.C. § 78u-1)
- Severity (0-100)
- Confidence (0-100%)
- 📄 Extracted Text (NEW)
- 📍 Document Location (NEW)
- 💡 Trigger Logic (NEW)
- ⚖️ Estimated Penalties (NEW)

### Financial Forensics
- Anomaly Score
- Risk Patterns

### Bayesian Risk Assessment
- Overall Risk Score
- Recommendation

## DOJ Referral
- Status (REQUIRED/NOT_REQUIRED)
- Recommended Charges
- Action Items
```

### Threat Dashboard (Full Deployment Only)

**ASCII Dashboard** (`threat_dashboard.txt`):
```
╔════════════════════════════════════════════╗
║        NITS THREAT DASHBOARD              ║
╚════════════════════════════════════════════╝

THREAT LEVEL: [████████░░] 81.7/100

INSIDER TRADING ANALYSIS:
Score: 83.6/100 - IMMEDIATE INVESTIGATION REQUIRED
```

**HTML Dashboard** (`threat_dashboard.html`):
- Interactive threat meter
- Color-coded severity indicators
- Clickable violation details
- Exportable to PDF

---

## Verification & Testing

### Pre-Deployment Testing

```bash
# Run precision patch tests
npx tsx deploy/test_precision_patch.ts

# Expected output:
# ✅ ALL TESTS PASSED
```

### Post-Deployment Verification

```bash
# Check all output files exist
ls -1 output/

# Expected files:
# analysis_report.md
# corpus_analysis_report.md
# (threat_dashboard.txt if using full deployment)
# (threat_dashboard.html if using full deployment)

# Verify report content
cat output/analysis_report.md | head -50

# Should show comprehensive violation analysis
```

### Health Check

```bash
# Verify system dependencies
npm list | grep -E "axios|cheerio|pdf-parse"

# Check Python diagnostics (if using Ultimate NITS)
python3 diagnostics.py
```

---

## Troubleshooting

### Issue: "Cannot find module"

**Cause**: Dependencies not installed  
**Solution**:
```bash
npm install
```

### Issue: "File not found"

**Cause**: Wrong working directory  
**Solution**:
```bash
cd /path/to/N.I.T.S-
npx tsx deploy/complete_integration_patch.ts
```

### Issue: TypeScript compilation errors

**Cause**: Using `tsc` instead of `tsx`  
**Solution**: Always use `tsx` for execution:
```bash
npx tsx deploy/complete_integration_patch.ts  # ✅ Correct
npx tsc deploy/complete_integration_patch.ts  # ❌ Wrong
```

### Issue: "No violations detected" for valid documents

**Cause**: Document format or content issues  
**Solution**:
1. Check document is readable text/PDF
2. Verify document contains suspicious patterns
3. Check sample documents work first:
```bash
npx tsx deploy/complete_integration_patch.ts
# Should detect 3 violations in test_document.txt
```

### Issue: Python ML service won't start (Ultimate NITS)

**Cause**: Python dependencies not installed  
**Solution**:
```bash
pip install -r python_requirements.txt
python3 python_bridge/ml_service.py
```

---

## Performance Optimization

### For Fast Processing

1. **Use Complete Integration Patch** (Mode 1)
   - Fastest processing
   - No external dependencies
   - 3-5 seconds per document

2. **Disable Unused Features** (Mode 2)
```typescript
ENABLE_EDGAR_FETCH: false,
ENABLE_FORM4_ANALYSIS: false,
ENABLE_MULTILINGUAL: false
```

3. **Batch Processing**
   - Place multiple documents in `sample_docs/`
   - Enable corpus analysis
   - System processes in parallel

### For Maximum Accuracy

1. **Use Ultimate NITS** (Mode 3)
   - Highest accuracy
   - Multiple validation layers
   - Semantic analysis

2. **Enable All Features** (Mode 2)
```typescript
ENABLE_EDGAR_FETCH: true,
ENABLE_FORM4_ANALYSIS: true,
ENABLE_MULTILINGUAL: true,
ENABLE_DASHBOARD: true
```

3. **Use Production API Keys**
   - Replace demo keys in `.env`
   - Get real-time data from SEC EDGAR
   - Access latest legal provisions

---

## Production Best Practices

### 1. Regular Updates

```bash
# Update dependencies monthly
npm update

# Check for security vulnerabilities
npm audit
```

### 2. API Key Rotation

- Rotate API keys quarterly
- Monitor API usage limits
- Use separate keys for dev/prod

### 3. Output Management

```bash
# Archive old reports
mkdir -p archive/$(date +%Y-%m)
mv output/*.md archive/$(date +%Y-%m)/

# Clean old reports (keep last 30 days)
find output/ -name "*.md" -mtime +30 -delete
```

### 4. Monitoring

```bash
# Log all executions
npx tsx deploy/complete_integration_patch.ts 2>&1 | tee logs/$(date +%Y%m%d_%H%M%S).log

# Monitor processing times
tail -f logs/*.log | grep "Processing time"
```

### 5. Error Handling

- Always check exit codes
- Capture stderr for debugging
- Set up alerting for failures

```bash
#!/bin/bash
if npx tsx deploy/complete_integration_patch.ts; then
    echo "✅ Analysis successful"
else
    echo "❌ Analysis failed"
    # Send alert
fi
```

---

## Integration with Other Systems

### REST API Wrapper (Example)

```javascript
// server.js
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.post('/analyze', (req, res) => {
  exec('npx tsx deploy/complete_integration_patch.ts', (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, output: stdout });
  });
});

app.listen(3000, () => console.log('NITS API running on port 3000'));
```

### Scheduled Analysis (Cron)

```bash
# crontab -e
# Run analysis daily at 2 AM
0 2 * * * cd /path/to/N.I.T.S- && npx tsx deploy/complete_integration_patch.ts >> logs/cron.log 2>&1
```

### CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/nits-analysis.yml
name: NITS Analysis
on: [push]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx tsx deploy/complete_integration_patch.ts
      - uses: actions/upload-artifact@v2
        with:
          name: analysis-reports
          path: output/*.md
```

---

## Support & Documentation

### Primary Documentation
- **Quick Start**: `QUICKSTART.md`
- **Full Verification**: `COMPREHENSIVE_VERIFICATION_REPORT.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Precision Intelligence**: `PRECISION_PATCH_SUMMARY.md`

### Script-Specific Guides
- **Integration Patch**: `deploy/README_INTEGRATION_PATCH.md`
- **Enhancement Patch**: `deploy/README_ENHANCEMENT_PATCH.md`
- **Ultimate NITS**: `ULTIMATE_NITS_README.md`

### System Architecture
- **System Overview**: `ULTIMATE_NITS_SYSTEM_OVERVIEW.md`
- **Deployment Status**: `DEPLOYMENT_COMPLETE.txt`

---

## Success Criteria

Your deployment is successful when:

✅ **All Tests Pass**
```bash
npx tsx deploy/test_precision_patch.ts
# Output: ✅ ALL TESTS PASSED
```

✅ **Reports Generate Successfully**
```bash
ls output/analysis_report.md
# File exists and contains violation analysis
```

✅ **Violations Detected**
```bash
cat output/analysis_report.md | grep "Violations Detected"
# Shows: Violations Detected: 3
```

✅ **No Errors in Console**
```bash
npx tsx deploy/complete_integration_patch.ts 2>&1 | grep -i error
# No critical errors shown
```

---

## FAQ

**Q: Do I need API keys to use the system?**  
A: No. The system includes demo keys with embedded data. Production API keys are optional for real-time external data.

**Q: Which deployment mode should I use?**  
A: Start with Complete Integration Patch (Mode 1) for production. Upgrade to Full Deployment (Mode 2) for dashboards.

**Q: How long does analysis take?**  
A: 3-10 seconds per document for standard modes, 10-30 seconds for Ultimate NITS with ML.

**Q: Can I analyze multiple documents at once?**  
A: Yes. Place all documents in `sample_docs/` and enable corpus analysis.

**Q: What document formats are supported?**  
A: PDF and TXT for all modes. Ultimate NITS supports additional formats with OCR.

**Q: Is the system production-ready?**  
A: Yes. All components have been tested and verified. See COMPREHENSIVE_VERIFICATION_REPORT.md.

---

## Version History

- **v3.0** (Oct 2025) - Complete Integration Patch, Full Deployment System
- **v1.0** (Oct 2025) - Precision Intelligence Enhancement
- **v1.0** (Oct 2025) - Ultimate NITS Core

---

## Contact & Support

For issues, questions, or feature requests:
1. Check documentation files listed above
2. Review troubleshooting section
3. Run diagnostics: `python3 diagnostics.py`
4. Check test results: `npx tsx deploy/test_precision_patch.ts`

---

**Status**: ✅ PRODUCTION READY  
**Last Verified**: October 6, 2025  
**System Version**: NITS Terminator v3.0+

---

*Deploy with confidence. All systems verified and operational.*
