# NITS Batch Upload GUI - Quick Start Guide

## Overview

The NITS Forensic GUI now supports **batch document upload** for corpus-level analysis with cross-document correlation. This enables you to analyze multiple documents simultaneously and identify patterns across your entire document set.

## Features

✅ **Batch Upload**: Upload up to 200 documents at once  
✅ **Corpus Analysis**: Analyze documents as a cohesive corpus with cross-document correlation  
✅ **Auto-Categorization**: Automatic document type classification  
✅ **Report Generation**: Automatic export of corpus analysis reports to `./output/`  
✅ **Fiscal-Year Ingestion**: Support for timeline-based analysis  
✅ **Backward Compatible**: Single document upload still works as before

## Starting the GUI Server

### Option 1: Standard GUI (Single Document Upload Only)
```bash
npm run start:gui
```

### Option 2: Batch Upload GUI (Recommended)
```bash
npm run start:gui:batch
```

Both servers run on `http://localhost:4000` by default. You can change the port:
```bash
GUI_PORT=8080 npm run start:gui:batch
```

## Using the Batch Upload Feature

1. **Start the server** (see above)
2. **Open your browser** to `http://localhost:4000`
3. **Select files**:
   - Use the "Batch Upload (Corpus Analysis)" section
   - Click "Choose File" and select multiple documents (Ctrl/Cmd + Click)
   - Supported formats: `.pdf`, `.txt`, `.xlsx`, `.html`
4. **Click "📚 Analyze Batch"**
5. **View results**:
   - Document-by-document analysis
   - Aggregate statistics across corpus
   - Cross-document correlation analysis
   - Automatic report export to `./output/corpus_analysis_report.md`

## Single Document Upload

The original single-document upload is still available:
1. Use the "Upload Document for Analysis" section
2. Select one document
3. Click "🔍 Analyze Document"

## Output Files

### Single Document Analysis
- Results displayed in GUI immediately
- No automatic file export (can be added if needed)

### Batch/Corpus Analysis
- Results displayed in GUI immediately
- **Automatic export** to `./output/corpus_analysis_report.md`
- Report includes:
  - Document-by-document summary
  - Aggregate statistics
  - Cross-document correlation analysis
  - Enforcement recommendations

## API Endpoints

### GET /
Home page with upload forms

### POST /upload
Single document upload
- Body: `multipart/form-data` with `document` field
- Returns: Analysis results rendered in GUI

### POST /uploadBatch
Batch document upload
- Body: `multipart/form-data` with `documents` field (array)
- Max files: 200
- Returns: Corpus analysis results rendered in GUI

## Example Usage

### Analyzing Multiple SEC Filings
1. Collect all 10-K, 10-Q, and Form 4 filings for a company
2. Upload them all at once using batch upload
3. Review cross-document findings for patterns
4. Check `./output/corpus_analysis_report.md` for detailed analysis

### Analyzing Investor Communications
1. Gather all investor emails, presentations, and communications
2. Batch upload for corpus-level fraud detection
3. Identify coordinated misrepresentations across documents

## Technical Details

### Implementation Files
- **Server**: `deploy/gui_batch_patch.ts`
- **Core Logic**: `deploy/complete_integration_patch.ts` (IntegratedNITSCore class)
- **Template**: `gui_views/index.ejs`
- **Scripts**: `package.json`

### Core Methods Added to IntegratedNITSCore
```typescript
// Analyze multiple documents as a corpus
async analyzeCorpus(docs: Array<{
  filePath: string;
  type?: string;
  date?: Date;
}>): Promise<{ results: any[]; report: string; }>

// Export report to file
exportReport(report: string, outputPath: string): void
```

## Troubleshooting

### "No files uploaded" error
- Ensure you've selected at least one file
- Check that file formats are supported (.pdf, .txt, .xlsx, .html)

### Server won't start
- Check if port 4000 is already in use
- Verify all dependencies are installed: `npm install`
- Check TypeScript compilation: `npx tsc --noEmit`

### Upload directory issues
- The `uploads/` directory should exist (auto-created)
- It's excluded from git via `.gitignore`
- Temporary files are stored here during analysis

## Security Notes

- Uploaded files are temporarily stored in `uploads/` directory
- Files are not automatically deleted after analysis (consider cleanup scripts for production)
- API keys are masked in console output
- Review `.gitignore` to ensure sensitive files aren't committed

## Next Steps

- Add automatic file cleanup after analysis
- Implement progress indicators for long-running corpus analysis
- Add filtering/sorting options for corpus results
- Implement timeline visualization for fiscal-year analysis
- Add export options (PDF, JSON, CSV)

## Support

For issues or questions:
1. Check the TypeScript compilation: `npx tsc --noEmit`
2. Review server logs for error details
3. Verify all dependencies are installed
4. Check that the NITS core modules are properly initialized
