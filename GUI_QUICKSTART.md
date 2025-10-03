# NITS GUI Quick Start

## 🚀 Start the GUI in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run start:gui
```

### 3. Open Browser
```
http://localhost:4000
```

## 📋 What You'll See

1. **Upload Form** - Drop or select a document (.pdf, .txt, .xlsx, .html)
2. **Analyze Button** - Click to trigger full forensic analysis
3. **Results Panel** - View threat level, violations, and recommendations

## 🎯 Try It Now

Upload `sample_docs/test_document.txt` to see:
- **Threat Level**: 100/100 (High Risk)
- **Violations**: 4 detected
- **Types**: Insider Trading, Fraud, Compliance, Deep Pattern Analysis

## 🔧 Configuration

### Change Port
```bash
GUI_PORT=8080 npm run start:gui
```

### Set API Key
```bash
export GOVINFO_API_KEY="your-api-key"
npm run start:gui
```

## 📖 Full Documentation

- **Complete Guide**: [GUI_README.md](GUI_README.md)
- **Implementation Details**: [GUI_IMPLEMENTATION_SUMMARY.md](GUI_IMPLEMENTATION_SUMMARY.md)
- **System Overview**: [README.md](README.md)

## ❓ Troubleshooting

**Port already in use?**
```bash
GUI_PORT=4001 npm run start:gui
```

**Dependencies missing?**
```bash
npm install
```

**Analysis fails?**
- Ensure file is readable
- Check file format (.txt, .pdf, .xlsx, .html)
- Verify file contains text content

---

**That's it! You're ready to analyze documents with NITS GUI.**
