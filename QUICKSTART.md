# NITS Complete Integration Patch - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies (if not already installed)

```bash
npm install
```

### Step 2: Add Your Documents

Place your documents in the `sample_docs/` directory:

```bash
# Example
cp /path/to/your/financial_report.txt sample_docs/
```

### Step 3: Run Analysis

```bash
npx tsx deploy/complete_integration_patch.ts
```

That's it! Check the `output/` directory for detailed Markdown reports.

---

## 📋 What You Get

### Automatic Analysis
- ✅ **NLP Forensic Analysis** - Fraud pattern detection
- ✅ **Legal Violation Detection** - Multi-level regulatory compliance check
- ✅ **Financial Forensics** - Anomaly and statistical analysis
- ✅ **Bayesian Risk Assessment** - Combined threat scoring
- ✅ **Prosecution Package** - Ready-to-use legal framework

### Output Reports
- 📄 `output/analysis_report.md` - Individual document analysis
- 📚 `output/corpus_analysis_report.md` - Multi-document analysis

---

## 🔑 Custom API Key (Optional)

To use a real GovInfo API key instead of the demo key:

```bash
# Set environment variable
export GOVINFO_API_KEY="your-actual-api-key-here"

# Run the script
npx tsx deploy/complete_integration_patch.ts
```

Or create a `.env` file:

```bash
echo "GOVINFO_API_KEY=your-actual-api-key-here" > .env
```

---

## 📊 Example Output

```
🔴 NITS COMPLETE INTEGRATION PATCH v3.0
════════════════════════════════════════════════════════════
║   NITS TERMINATOR SYSTEM - FULL DEPLOYMENT             ║
║   OBJECTIVE: TOTAL VIOLATION EXPOSURE                  ║
║   MODE: ZERO TOLERANCE + FORENSIC ANALYSIS             ║
════════════════════════════════════════════════════════════

🔐 Security Check:
   API Key: TEST****************5678
   Status: ✅ Custom Key Loaded

✅ ALL MODULES INITIALIZED SUCCESSFULLY
📋 Legal Provisions Indexed: 5

📊 Analysis Summary:
   Violations Detected: 4
   Threat Score: 100.0/100
   Criminal Violations: 2
   Total Penalties: $25,000,000

📁 Output Files:
   - ./output/analysis_report.md
   - ./output/corpus_analysis_report.md

🚀 System ready for production deployment
```

---

## 🛠️ Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "No such file or directory"
Make sure the `sample_docs/` directory exists:
```bash
mkdir -p sample_docs
```

### "tsx command not found"
Install tsx:
```bash
npm install -D tsx
```

---

## 📚 Documentation

- **Full Documentation**: `deploy/README_INTEGRATION_PATCH.md`
- **Architecture Guide**: `docs/ARCHITECTURE.md`
- **Migration Guide**: `docs/MIGRATION_SUMMARY.md`

---

## 🎯 Next Steps

1. ✅ Run the demo with provided `test_document.txt`
2. 📄 Add your own documents to `sample_docs/`
3. 🔍 Review generated reports in `output/`
4. 🔧 Customize configuration in `complete_integration_patch.ts`
5. 🚀 Deploy to production

---

**Status**: Production Ready ✅ | CoPilot Ready ✅ | Feature Complete ✅
