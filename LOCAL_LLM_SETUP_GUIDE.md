# NITS Local LLM Setup Guide

## Overview

This guide explains how to set up and use the NITS Local LLM integration for offline document analysis. The system uses llama-node with GGUF models to provide private, cost-free AI analysis capabilities.

## Benefits

- **🔒 Privacy**: All data stays on your machine
- **💰 Cost-Free**: No API usage fees
- **🌐 Offline**: Works without internet after setup
- **⚙️ Customizable**: Use any GGUF-compatible model
- **🚀 Fast**: Local inference with optimized quantization

## Quick Start

### Prerequisites

- **Node.js**: v16 or higher
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: 5GB free for model
- **CPU**: Multi-core processor (4+ cores recommended)

### One-Command Setup

```bash
# Make the script executable
chmod +x scripts/bootstrap_local.sh

# Run the bootstrap script
./scripts/bootstrap_local.sh
```

This will:
1. Install llama-node dependencies
2. Download Nous-Hermes-2-Mistral-7B model (~4GB)
3. Create and configure the system
4. Run a test analysis

### Manual Setup (Alternative)

If you prefer manual installation:

```bash
# 1. Install dependencies
npm install llama-node --save

# 2. Create directories
mkdir -p models nits-vantablack/configs nits-vantablack/ml_integration

# 3. Download model
curl -L -o models/nous-hermes-2-mistral-7b.Q4_K_M.gguf \
  https://huggingface.co/TheBloke/Nous-Hermes-2-Mistral-7B-GGUF/resolve/main/nous-hermes-2-mistral-7b.Q4_K_M.gguf

# 4. Copy configuration files from repository
# (mission_context.json and local_model.js are already in the repo)
```

## Usage Examples

### Basic Document Summary

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';

const documentText = `
  Form 4 was filed on March 15, 2024 by John Doe, CEO of ACME Corp.
  The filing indicates the sale of 100,000 shares at $50 per share,
  totaling $5,000,000.
`;

const summary = await analyzeWithLLM(documentText, 'summary');
console.log('Summary:', summary);
```

### Violation Detection

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';

const violations = await analyzeWithLLM(documentText, 'violations');
console.log('Violations:', violations);
```

### Forensic Analysis

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';

const analysis = await analyzeWithLLM(documentText, 'forensic');
console.log('Forensic Analysis:', analysis);
```

### Custom Configuration

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';

const config = {
  modelPath: './models/your-custom-model.gguf',
  temperature: 0.5,      // Lower = more focused
  maxTokens: 1024,       // Output length limit
  contextWindow: 8192,   // Context size
  systemPrompt: 'You are a SEC compliance analyst.'
};

const result = await analyzeWithLLM(documentText, 'summary', config);
```

### Batch Processing

```javascript
import { batchAnalyze } from './nits-vantablack/ml_integration/local_model.js';

const documents = [
  { name: 'Doc1', text: 'Form 4 filed with violations...' },
  { name: 'Doc2', text: 'Insider trading detected...' }
];

const results = await batchAnalyze(documents, 'summary');
results.forEach(r => console.log(`${r.document}:`, r.analysis));
```

## Analysis Modes

### 1. Summary Mode (`'summary'`)
- Generates concise summaries
- Highlights key legal and regulatory points
- Best for quick document overviews

### 2. Violations Mode (`'violations'`)
- Detects potential legal violations
- Identifies SEC, DOJ, IRS issues
- Provides regulatory compliance analysis

### 3. Forensic Mode (`'forensic'`)
- Detailed forensic analysis
- Identifies anomalies and contradictions
- Comprehensive compliance review

## Configuration

### Configuration File

Edit `nits-vantablack/configs/mission_context.json`:

```json
{
  "llmConfig": {
    "modelName": "nous-hermes-2-mistral-7b",
    "runtime": "llamacpp",
    "modelPath": "./models/nous-hermes-2-mistral-7b.Q4_K_M.gguf",
    "temperature": 0.7,
    "maxTokens": 2048,
    "contextWindow": 8192,
    "systemPrompt": "You are a forensic analyst for legal and ESG documents."
  },
  "analysisSettings": {
    "enableViolationDetection": true,
    "enableSummary": true,
    "enableForensicAnalysis": true,
    "confidenceThreshold": 0.7
  },
  "outputSettings": {
    "format": "markdown",
    "includeMetadata": true,
    "verboseLogging": false
  }
}
```

### Model Selection

The bootstrap script uses Nous-Hermes-2-Mistral-7B by default. You can use other models:

#### Recommended Models

1. **Nous-Hermes-2-Mistral-7B** (Default)
   - Size: ~4GB (Q4_K_M)
   - Best for: Legal analysis, instruction following
   - Download: Included in bootstrap script

2. **Mistral-7B-Instruct**
   - Size: ~4GB (Q4_K_M)
   - Best for: General purpose, fast inference
   - Download: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF

3. **LLaMA-2-7B-Chat**
   - Size: ~4GB (Q4_K_M)
   - Best for: Conversational tasks
   - Download: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF

#### Changing Models

1. Download your preferred GGUF model to `./models/`
2. Update `modelPath` in `mission_context.json`
3. Test: `node nits-vantablack/examples/test_config.mjs`

## Testing

### Configuration Test

```bash
node nits-vantablack/examples/test_config.mjs
```

This verifies:
- Configuration file is valid
- Model directory exists
- Integration module is accessible

### Full Example Test

```bash
node nits-vantablack/examples/example_usage.mjs
```

This demonstrates all analysis modes and features.

## Integration with NITS Core

### Fallback Strategy

Use local LLM as primary with cloud API as fallback:

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';
import { analyzeWithAI } from './core/analysis/AIInvestigator.js';

async function analyzeDocument(text) {
  try {
    // Try local LLM first (private, free)
    return await analyzeWithLLM(text, 'violations');
  } catch (error) {
    console.log('Local LLM unavailable, using cloud API...');
    // Fallback to OpenAI (requires API key)
    return await analyzeWithAI(text);
  }
}
```

### Performance Optimization

```javascript
// Keep model loaded for multiple analyses
let modelLoaded = false;

async function analyzeMultiple(documents) {
  const results = [];
  
  for (const doc of documents) {
    const result = await analyzeWithLLM(doc.text, 'summary');
    results.push({ document: doc.name, result });
  }
  
  return results;
}
```

## Troubleshooting

### Out of Memory Error

**Problem**: System runs out of RAM during inference

**Solutions**:
- Use a smaller model (Q4_K_M quantization)
- Reduce `contextWindow` in config (e.g., 4096 instead of 8192)
- Close other applications
- Upgrade to 16GB RAM

### Slow Inference

**Problem**: Analysis takes too long

**Solutions**:
- Ensure `useMmap: true` in local_model.js
- Use faster quantization (Q4_K_M or Q5_K_M)
- Increase CPU allocation
- Use smaller models

### Model Not Loading

**Problem**: Error loading model file

**Solutions**:
- Verify file exists: `ls -lh models/*.gguf`
- Check file isn't corrupted (re-download if needed)
- Ensure sufficient disk space
- Verify path in config matches actual location

### llama-node Installation Fails

**Problem**: npm install fails for llama-node

**Solutions**:
```bash
# Try with legacy peer deps
npm install llama-node --legacy-peer-deps

# Or use force
npm install llama-node --force

# Or specific version
npm install llama-node@0.1.8
```

### Import Errors

**Problem**: Cannot import local_model.js

**Solutions**:
- Ensure package.json has `"type": "module"`
- Use .mjs extension for test files
- Run from repository root: `node nits-vantablack/examples/test_config.mjs`

## Performance Tips

1. **Batch Processing**: Use `batchAnalyze()` for multiple documents
2. **Model Caching**: Keep model in memory between requests
3. **Quantization**: Q4_K_M provides best speed/quality tradeoff
4. **Context Window**: Use smaller windows for faster inference
5. **Thread Count**: Set `nThreads` to CPU core count - 1

## System Requirements by Model Size

| Model Size | RAM Required | Disk Space | Inference Speed |
|------------|--------------|------------|-----------------|
| 7B Q4_K_M  | 8GB          | 4GB        | Fast            |
| 7B Q5_K_M  | 10GB         | 5GB        | Medium          |
| 7B Q8_0    | 12GB         | 7GB        | Slow            |
| 13B Q4_K_M | 16GB         | 8GB        | Medium          |

## Security Considerations

- Models are downloaded from HuggingFace (verify checksums)
- All processing happens locally (no data sent externally)
- Model files are large - ensure virus scanning is up to date
- Use `.gitignore` to prevent committing model files

## Support and Resources

- **Documentation**: `nits-vantablack/README.md`
- **Examples**: `nits-vantablack/examples/`
- **Configuration**: `nits-vantablack/configs/mission_context.json`
- **Bootstrap Script**: `scripts/bootstrap_local.sh`

## Advanced Topics

### Custom Models

To use your own fine-tuned model:

1. Convert to GGUF format (if needed)
2. Place in `./models/` directory
3. Update `mission_context.json` with model path
4. Test with configuration script

### Memory-Mapped Files

For best performance, models use memory-mapped I/O:

```javascript
await llama.load({
  modelPath: config.modelPath,
  useMmap: true,  // Enable memory mapping
  useMlock: false, // Disable memory locking (safer)
  // ... other options
});
```

### Multi-Threading

Adjust thread count for your CPU:

```javascript
await llama.createCompletion({
  nThreads: 8,  // Use 8 CPU threads
  // ... other options
});
```

## FAQ

**Q: Can I use this with GPU acceleration?**
A: Not currently. llama-node uses CPU-based inference. For GPU acceleration, consider using llama.cpp directly or other tools.

**Q: How much does the model download cost?**
A: The download itself is free from HuggingFace. Only bandwidth costs apply.

**Q: Can I use multiple models simultaneously?**
A: Yes, but each model requires its own memory allocation. Ensure sufficient RAM.

**Q: Is this production-ready?**
A: Yes, for CPU-based inference. Performance depends on your hardware specifications.

**Q: How does this compare to OpenAI API?**
A: Local models offer privacy and no costs, but may have lower quality and slower inference than cloud-based GPT-4.

## Changelog

- **v1.0.0** (2024-10-10): Initial release
  - Bootstrap script for one-command setup
  - Support for Nous-Hermes-2-Mistral-7B
  - Three analysis modes (summary, violations, forensic)
  - Batch processing support
  - Configuration management

## License

This integration follows the same license as NITS Core. Model licenses vary by provider (check HuggingFace model cards).
