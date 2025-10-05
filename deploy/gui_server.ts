import express = require('express');
import multer = require('multer');
import * as path from 'path';
import { IntegratedNITSCore } from './complete_integration_patch';

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = process.env.GUI_PORT ? parseInt(process.env.GUI_PORT) : 4001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'gui_views'));

let nits: IntegratedNITSCore;

async function initCore() {
  nits = new IntegratedNITSCore();
  await nits.initialize();
}

app.get('/', (req, res) => {
  res.render('index', { results: null, error: null });
});

app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('index', { results: null, error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const result = await nits.analyzeDocument(filePath);
    // Optionally remove the temp upload after analysis
    res.render('index', { results: result, error: null });
  } catch (err) {
    const error = err as Error;
    res.render('index', { results: null, error: error.toString() });
  }
});

app.listen(port, async () => {
  await initCore();
  console.log(`🚀 GUI server listening at http://localhost:${port}`);
});
