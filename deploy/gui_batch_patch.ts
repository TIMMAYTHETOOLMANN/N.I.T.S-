// File: deploy/gui_batch_patch.ts
// 🔥 NITS GUI Batch Ingestion Extension
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { IntegratedNITSCore } from './complete_integration_patch';

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.GUI_PORT ? parseInt(process.env.GUI_PORT) : 4000;
let nits: IntegratedNITSCore;

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
  } catch (error) {
    console.error('❌ Error during document processing:', error);
    res.render('index', { results: null, error: (error as Error).message });
  }
});

// Batch upload (corpus analysis)
app.post('/uploadBatch', upload.array('documents', 200), async (req, res) => {
  try {
    const uploaded = (req.files as Express.Multer.File[]).map(file => ({
      filePath: file.path,
      type: 'SEC_OR_INVESTOR',
      date: new Date(), // Optional: Enhance with date extraction logic
    }));

    console.log(`📂 Processing batch upload: ${uploaded.length} documents`);
    const corpusResult = await nits.analyzeCorpus(uploaded);

    // Auto-export markdown report
    const outputPath = path.join(__dirname, '..', 'output', 'corpus_analysis_report.md');
    nits.exportReport(corpusResult.report, outputPath);

    res.render('index', { results: { corpus: corpusResult }, error: null });
  } catch (error) {
    console.error('❌ Error during batch processing:', error);
    res.render('index', { results: null, error: (error as Error).message });
  }
});

async function init() {
  console.log('🧠 Initializing NITS Core for Batch GUI...');
  nits = new IntegratedNITSCore();
  await nits.initialize();
  app.listen(port, () => {
    console.log(`🚀 NITS GUI Batch Server running at http://localhost:${port}`);
  });
}

init();
