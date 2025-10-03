# Batch Upload - Quick Start

## 🚀 Start the Server

```bash
npm run start:gui:batch
```

## 🌐 Open GUI

```
http://localhost:4000
```

## 📤 Upload Documents

### Single Document
1. Use "Upload Document for Analysis" section
2. Choose one file
3. Click "🔍 Analyze Document"

### Batch Upload (NEW!)
1. Use "Batch Upload (Corpus Analysis)" section
2. Choose multiple files (Ctrl/Cmd + Click)
3. Click "📚 Analyze Batch"
4. Results shown in GUI
5. Report auto-saved to `./output/corpus_analysis_report.md`

## 📊 What You Get

**Single Document:**
- Violations list
- Threat score
- Recommendation

**Batch Upload:**
- Document-by-document analysis
- Total violations across corpus
- Average fraud score
- Cross-document correlation
- Aggregate statistics
- Markdown report export

## 🔧 Configuration

**Change Port:**
```bash
GUI_PORT=8080 npm run start:gui:batch
```

**Supported Formats:**
- `.pdf`
- `.txt`
- `.xlsx`
- `.html`

**Max Files per Batch:**
200 files

## 📁 Output Location

```
./output/corpus_analysis_report.md
```

## 📖 Full Documentation

- See `BATCH_UPLOAD_README.md` for detailed usage
- See `IMPLEMENTATION_SUMMARY_BATCH_UPLOAD.md` for technical details

## ✅ Verified Working

- ✅ TypeScript compiles
- ✅ Server starts
- ✅ Both upload forms work
- ✅ Corpus analysis tested (3 docs, 9 violations)
- ✅ Reports generate successfully
- ✅ Cross-document correlation works (36.2%)

---

**Ready for your 175 + 10 document sets!** 🎉
