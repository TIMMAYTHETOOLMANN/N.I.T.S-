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

// Utility to append upload metadata to history log
function logUploadHistory(entry: any) {
  const historyPath = path.join(__dirname, '..', 'output', 'upload_history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch (e) {
      history = [];
    }
  }
  history.push(entry);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

// Helper to extract violation context/location
function extractViolationDetails(violations: any[], documentText: string) {
  if (!Array.isArray(violations)) return [];
  return violations.map(v => {
    // Priority 1: Use context field directly from enhanced TerminatorAnalysisEngine
    let context = v.context;
    let location = v.location;
    
    // Priority 2: If no context from engine, try to extract from evidence
    if (!context && v.evidence && Array.isArray(v.evidence) && v.evidence.length > 0) {
      context = v.evidence[0]; // Use first evidence snippet
      // Try to find its location in the document
      if (documentText && typeof context === 'string') {
        const idx = documentText.indexOf(context);
        if (idx !== -1) {
          location = { start: idx, end: idx + context.length };
        }
      }
    }
    
    // Priority 3: Fallback to suspiciousPatterns (for deep pattern analysis)
    if (!context && v.suspiciousPatterns && Array.isArray(v.suspiciousPatterns) && v.suspiciousPatterns.length > 0) {
      context = v.suspiciousPatterns[0];
      if (documentText && typeof context === 'string') {
        const idx = documentText.indexOf(context);
        if (idx !== -1) {
          location = { start: idx, end: idx + context.length };
        }
      }
    }
    
    // Priority 4: Extract meaningful context from document based on violation type
    if (!context && documentText) {
      if (v.type === 'STATUTORY_VIOLATION' && v.statute && v.statute.includes('10b-5')) {
        // Look for securities/fraud related content
        const fraudKeywords = ['disclosure', 'material', 'information', 'statement', 'misleading', 'fraud'];
        for (const keyword of fraudKeywords) {
          const idx = documentText.toLowerCase().indexOf(keyword);
          if (idx !== -1) {
            const contextStart = Math.max(0, idx - 80);
            const contextEnd = Math.min(documentText.length, idx + 120);
            context = documentText.substring(contextStart, contextEnd);
            location = { start: idx, end: idx + keyword.length };
            break;
          }
        }
      } else if (v.type === 'ML_ANOMALY_DETECTED' || v.type === 'BAYESIAN_HIGH_RISK') {
        // Look for financial/risk related content
        const financialKeywords = ['revenue', 'profit', 'financial', 'risk', 'accounting', '$'];
        for (const keyword of financialKeywords) {
          const idx = documentText.toLowerCase().indexOf(keyword.toLowerCase());
          if (idx !== -1) {
            const contextStart = Math.max(0, idx - 80);
            const contextEnd = Math.min(documentText.length, idx + 120);
            context = documentText.substring(contextStart, contextEnd);
            location = { start: idx, end: idx + keyword.length };
            break;
          }
        }
      }
    }
    
    // Final fallback: use description or document excerpt
    if (!context) {
      if (v.description) {
        context = v.description;
      } else if (documentText && documentText.length > 0) {
        // Use first meaningful paragraph from document
        const sentences = documentText.split(/[.!?]+/);
        context = sentences.find(s => s.trim().length > 50)?.trim() + '...' || 
                 documentText.substring(0, Math.min(150, documentText.length)) + '...';
        location = { start: 0, end: Math.min(150, documentText.length) };
      } else {
        context = 'Document content unavailable for analysis';
      }
    }
    
    return {
      ...v,
      context: context || 'Analysis context unavailable',
      location
    };
  });
}

// Single document upload (existing functionality)
app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('index', { results: null, error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const documentText = fs.readFileSync(filePath, 'utf-8');
    latestDocumentContent = documentText; // Store for highlighting endpoint
    const result = await nits.analyzeDocument(filePath);
    
    // Apply the same enhanced violation processing as batch upload
    const enhancedViolations = extractViolationDetails(result?.violations, documentText);
    const enhancedResult = {
      ...result,
      violations: enhancedViolations
    };
    
    // Log upload metadata with violation context/location
    logUploadHistory({
      type: 'single',
      originalName: req.file.originalname,
      uploadTime: new Date().toISOString(),
      filePath,
      threatScore: result?.overallThreatLevel ?? null,
      violationCount: result?.violations?.length ?? null,
      violations: enhancedViolations
    });
    
    res.render('index', { results: enhancedResult, error: null });
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
      date: new Date(),
      originalName: file.originalname
    }));
    console.log(`📂 Processing batch upload: ${uploaded.length} documents`);
    const corpusResult = await nits.analyzeCorpus(uploaded);
    // Auto-export markdown report
    const outputPath = path.join(__dirname, '..', 'output', 'corpus_analysis_report.md');
    nits.exportReport(corpusResult.report, outputPath);
    // Log batch upload metadata with violation context/location
    uploaded.forEach((file, idx) => {
      let documentText = '';
      try { documentText = fs.readFileSync(file.filePath, 'utf-8'); } catch {}
      const doc = corpusResult?.results?.[idx];
      logUploadHistory({
        type: 'batch',
        originalName: file.originalName,
        uploadTime: new Date().toISOString(),
        filePath: file.filePath,
        threatScore: doc?.threatScore ?? null,
        violationCount: doc?.violations?.length ?? null,
        violations: extractViolationDetails(doc?.violations, documentText)
      });
    });
    res.render('index', { results: { corpus: corpusResult }, error: null });
  } catch (error) {
    console.error('❌ Error during batch processing:', error);
    res.render('index', { results: null, error: (error as Error).message });
  }
});

// Endpoint to retrieve upload history (full detail)
app.get('/uploadHistoryFull', (req, res) => {
  const historyPath = path.join(__dirname, '..', 'output', 'upload_history.json');
  if (fs.existsSync(historyPath)) {
    res.sendFile(historyPath);
  } else {
    res.json([]);
  }
});

// Global variable to store the latest analyzed document content
let latestDocumentContent = '';

// Endpoint to serve original document content for highlighting
app.get('/documentContent', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(latestDocumentContent || 'No document content available');
});

async function init() {
  try {
    console.log('🧠 Initializing NITS Core for Batch GUI...');
    nits = new IntegratedNITSCore();
    await nits.initialize();
    app.listen(port, () => {
      console.log(`🚀 NITS GUI Batch Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize NITS Core or start server:', err);
    process.exit(1);
  }
}

init();
