# NITS Local LLM - Quick Reference Card

## Setup (One Command)

```bash
chmod +x scripts/bootstrap_local.sh && ./scripts/bootstrap_local.sh
```

## Basic Usage

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';

// Summary
const summary = await analyzeWithLLM(text, 'summary');

// Violations
const violations = await analyzeWithLLM(text, 'violations');

// Forensic Analysis
const forensic = await analyzeWithLLM(text, 'forensic');
```

## Batch Processing

```javascript
import { batchAnalyze } from './nits-vantablack/ml_integration/local_model.js';

const docs = [
  { name: 'Doc1', text: '...' },
  { name: 'Doc2', text: '...' }
];

const results = await batchAnalyze(docs, 'summary');
```

## Custom Config

```javascript
const config = {
  modelPath: './models/your-model.gguf',
  temperature: 0.7,
  maxTokens: 2048,
  contextWindow: 8192
};

const result = await analyzeWithLLM(text, 'summary', config);
```

## Testing

```bash
# Test configuration
node nits-vantablack/examples/test_config.mjs

# Run examples
node nits-vantablack/examples/example_usage.mjs
```

## File Locations

| File | Purpose |
|------|---------|
| `scripts/bootstrap_local.sh` | Setup script |
| `nits-vantablack/ml_integration/local_model.js` | Core module |
| `nits-vantablack/configs/mission_context.json` | Configuration |
| `nits-vantablack/examples/` | Usage examples |
| `LOCAL_LLM_SETUP_GUIDE.md` | Full documentation |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Out of memory | Use smaller model or reduce contextWindow |
| Slow inference | Check useMmap: true, increase nThreads |
| Model not found | Run bootstrap script, check modelPath |
| Import errors | Ensure package.json has "type": "module" |

## Analysis Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `summary` | Concise summary | Quick overview |
| `violations` | Legal violations | Compliance check |
| `forensic` | Detailed analysis | Deep investigation |

## System Requirements

- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 5GB for model
- **CPU**: 4+ cores
- **Node.js**: v16+

## Quick Fallback Pattern

```javascript
async function analyze(text) {
  try {
    // Local LLM (private, free)
    return await analyzeWithLLM(text, 'violations');
  } catch (error) {
    // Cloud API fallback
    return await analyzeWithAI(text);
  }
}
```

## Model Options

| Model | Size | Best For |
|-------|------|----------|
| Nous-Hermes-2-Mistral-7B | 4GB | Legal analysis (default) |
| Mistral-7B-Instruct | 4GB | General purpose |
| LLaMA-2-7B-Chat | 4GB | Conversational |

## Configuration Quick Edit

```bash
# Edit config
nano nits-vantablack/configs/mission_context.json

# Test changes
node nits-vantablack/examples/test_config.mjs
```

## Documentation Links

- Full Guide: `LOCAL_LLM_SETUP_GUIDE.md`
- Module Docs: `nits-vantablack/README.md`
- Examples: `nits-vantablack/examples/`

---

**Need Help?** See `LOCAL_LLM_SETUP_GUIDE.md` for detailed documentation.
