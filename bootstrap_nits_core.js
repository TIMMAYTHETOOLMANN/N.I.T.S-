// File: bootstrap_nits_core.js
import fs from 'fs';
import path from 'path';

const structure = {
  'core': {
    'govinfo': ['GovInfoTerminator.ts', 'LegalProvision.ts'],
    'analysis': ['TerminatorAnalysisEngine.ts', 'Violation.ts'],
    'nlp': ['BlacklightAnalyzer.ts', 'ForensicTextAnalyzer.ts'],
    'anomaly': ['AnomalyDetector.ts', 'BayesianRiskAnalyzer.ts'],
    'evidence': ['ProsecutionPackage.ts', 'EvidenceInventory.ts']
  },
  'ingestion': {
    'pdf': ['PdfExtractor.ts'],
    'excel': ['ExcelParser.ts'],
    'html': ['HtmlExtractor.ts'],
    'glamor': ['GlamorDocIntegrator.ts']
  },
  'proof': {
    'exporters': ['TCRExporter.ts', 'DOJReferralExporter.ts']
  },
  'tests': {},
  'deploy': ['deploy.sh', 'pipeline.ts'],
  'docs': ['README.md', 'ARCHITECTURE.md']
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeStub(filePath, content = '') {
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
}

function bootstrap(basePath, obj) {
  for (const [name, children] of Object.entries(obj)) {
    const dir = path.join(basePath, name);
    ensureDir(dir);
    if (Array.isArray(children)) {
      for (const fname of children) {
        const fpath = path.join(dir, fname);
        if (!fs.existsSync(fpath)) {
          writeStub(fpath, `// stub: ${fname}\n`);
        }
      }
    } else {
      // subtree
      bootstrap(dir, children);
    }
  }
}

function writeRootFiles(basePath) {
  // package.json
  const pkg = {
    name: 'nits-core-legal-engine',
    version: '0.1.0',
    main: 'deploy/pipeline.js',
    scripts: {
      "start": "ts-node deploy/pipeline.ts",
      "test": "jest"
    },
    dependencies: {},
    devDependencies: {
      "ts-node": "*",
      "typescript": "*",
      "jest": "*"
    }
  };
  writeStub(path.join(basePath, 'package.json'), JSON.stringify(pkg, null, 2));

  // tsconfig.json
  const tsconf = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "strict": true,
      "outDir": "dist",
      "esModuleInterop": true
    },
    "include": ["core", "ingestion", "proof", "deploy"]
  };
  writeStub(path.join(basePath, 'tsconfig.json'), JSON.stringify(tsconf, null, 2));

  // README.md
  writeStub(path.join(basePath, 'README.md'),
    `# NITS Core Legal Engine\n\nThis is the minimal, lethal core repository for NITS.\n` +
    `It contains rule harvesting, analysis, ingestion, evidence export.\n`);

  // ARCHITECTURE.md
  writeStub(path.join(basePath, 'docs/ARCHITECTURE.md'),
    `## Architecture Overview\n\n` +
    `- core/: legal logic and analyzers\n` +
    `- ingestion/: document extraction modules\n` +
    `- proof/: exporters for SEC TCR, DOJ referrals\n` +
    `- deploy/: pipeline & agent entrypoint\n`);
}

// Bootstrap command
function runBootstrap() {
  const base = process.cwd();
  console.log('🔧 Bootstrapping NITS Core Legal Repository...');
  bootstrap(base, structure);
  writeRootFiles(base);
  console.log('✅ Bootstrap complete.');
}

runBootstrap();
