// File: deploy/gui_batch_patch.ts
// PURPOSE: Upgrade GUI server to support batch upload, corpus ingestion, timeline correlation

import express = require('express');
import multer = require('multer');
import * as path from 'path';
import { IntegratedNITSCore } from './complete_integration_patch';

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = process.env.GUI_PORT ? parseInt(process.env.GUI_PORT) : 4000;
let nits: IntegratedNITSCore;

async function initCore(): Promise<void> {
  nits = new IntegratedNITSCore();
  await nits.initialize();
}

// Serve static GUI views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'gui_views'));

app.get('/', (req, res) => {
  res.render('index', { results: null, error: null });
});

// Single document upload (existing functionality)
app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('index', { results: null, error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const result = await nits.analyzeDocument(filePath);
    res.render('index', { results: result, error: null });
  } catch (err) {
    const error = err as Error;
    res.render('index', { results: null, error: error.toString() });
  }
});

// NEW: handle multiple file upload (batch)
app.post('/uploadBatch', upload.array('documents', 200), async (req, res) => {
  try {
    if (!req.files || (req.files as any[]).length === 0) {
      return res.render('index', { results: null, error: 'No files uploaded' });
    }

    const uploaded = (req.files as any[]).map(f => f.path);
    console.log(`🔁 Batch upload: ${uploaded.length} files`);

    // Build corpus metadata list
    const docs = uploaded.map(fp => ({
      filePath: fp,
      type: 'SEC_OR_INVESTOR',  // classification heuristic
      date: new Date()         // optional: parse from filename if possible
    }));

    const corpusResult = await nits.analyzeCorpus(docs);

    // Optionally export reports
    nits.exportReport(corpusResult.report, './output/corpus_analysis_report.md');

    res.render('index', { results: { corpus: corpusResult }, error: null });
  } catch (err) {
    console.error('Batch upload error:', err);
    const error = err as Error;
    res.render('index', { results: null, error: error.toString() });
  }
});

// Start server
app.listen(port, async () => {
  await initCore();
  console.log(`🚀 GUI server with batch upload listening at http://localhost:${port}`);
});
