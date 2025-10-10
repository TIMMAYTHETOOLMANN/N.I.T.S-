# NITS Vantablack - Local LLM Integration

This module provides local LLM inference capabilities for NITS, enabling offline document analysis without relying on external APIs like OpenAI.

## Overview

The Vantablack module uses llama-node with GGUF models to provide:
- **Offline Analysis**: No internet required after initial setup
- **Privacy**: All data stays local
- **Cost Efficiency**: No API usage fees
- **Customization**: Use any GGUF-compatible model

## Quick Start

### 1. Run Bootstrap Script

```bash
chmod +x scripts/bootstrap_local.sh
./scripts/bootstrap_local.sh
```

This will:
- Install llama-node dependencies
- Download the Nous-Hermes-2-Mistral-7B model (~4GB)
- Configure the system
- Run a test analysis

### 2. Use in Your Code

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';

// Basic usage with default config
const summary = await analyzeWithLLM(documentText, 'summary');

// Custom configuration
const config = {
  modelPath: './models/your-model.gguf',
  temperature: 0.7,
  maxTokens: 2048,
  contextWindow: 8192
};
const analysis = await analyzeWithLLM(documentText, 'violations', config);
```

## Analysis Modes

- **`summary`**: Generate concise summaries
- **`violations`**: Detect legal and regulatory violations
- **`forensic`**: Detailed forensic analysis with anomaly detection

## Directory Structure

```
nits-vantablack/
├── configs/
│   └── mission_context.json    # Configuration file
├── ml_integration/
│   └── local_model.js          # Core LLM integration
└── README.md                   # This file
```

## Configuration

Edit `configs/mission_context.json` to customize:

```json
{
  "llmConfig": {
    "modelName": "your-model-name",
    "modelPath": "./models/your-model.gguf",
    "temperature": 0.7,
    "maxTokens": 2048,
    "contextWindow": 8192,
    "systemPrompt": "Your custom system prompt"
  }
}
```

## System Requirements

- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 5GB free space for model
- **CPU**: Multi-core processor (4+ cores recommended)
- **Node.js**: v16 or higher

## Model Options

The bootstrap script uses Nous-Hermes-2-Mistral-7B by default, but you can use other models:

### Recommended Models

1. **Nous-Hermes-2-Mistral-7B** (Default)
   - Size: ~4GB
   - Good balance of quality and speed
   - Excellent for legal analysis

2. **LLaMA-2-7B**
   - Size: ~4GB
   - General purpose
   - Good instruction following

3. **Mistral-7B-Instruct**
   - Size: ~4GB
   - Fast inference
   - Strong reasoning

### Changing Models

1. Download your preferred GGUF model to `./models/`
2. Update `modelPath` in `configs/mission_context.json`
3. Test with: `node /tmp/test_llm.mjs`

## Troubleshooting

### Out of Memory
- Use a smaller model (Q4_K_M quantization)
- Reduce `contextWindow` in config
- Close other applications

### Slow Inference
- Ensure model uses memory-mapped I/O (`useMmap: true`)
- Increase `nThreads` parameter
- Use faster quantization (Q4_K_M or Q5_K_M)

### Model Not Loading
- Check model file exists in `./models/`
- Verify file is not corrupted (re-download if needed)
- Ensure sufficient disk space

## Integration with NITS Core

The local LLM can be used as a fallback or primary analysis engine:

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';
import { analyzeWithAI } from './core/analysis/AIInvestigator.js';

async function analyzeDocument(text) {
  try {
    // Try local LLM first
    return await analyzeWithLLM(text, 'violations');
  } catch (error) {
    // Fallback to OpenAI if configured
    console.log('Local LLM failed, trying cloud API...');
    return await analyzeWithAI(text);
  }
}
```

## Performance Tips

1. **Batch Processing**: Use `batchAnalyze()` for multiple documents
2. **Model Caching**: Keep model loaded between requests
3. **Quantization**: Q4_K_M provides best speed/quality tradeoff
4. **Context Window**: Use smaller windows for faster inference

## Support

For issues or questions:
- Check existing GitHub issues
- Review llama-node documentation
- Test with the provided bootstrap script
