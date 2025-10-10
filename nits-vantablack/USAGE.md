# NITS Local LLM - Usage Instructions

## Bootstrap Script

The `scripts/bootstrap_local.sh` script provides one-command setup for local LLM inference.

### 🔧 To Use:

```bash
chmod +x scripts/bootstrap_local.sh
./scripts/bootstrap_local.sh
```

### What It Does:

This script:
- ✅ Installs dependencies (llama-node)
- ✅ Downloads the 7B model (~4GB from HuggingFace)
- ✅ Updates the config (mission_context.json)
- ✅ Verifies local inference with test

### Configuration

The bootstrap script configures:

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
  }
}
```

### Test Sample

The script tests with: `"Form 4 was filed under GAAP violation clause."`

### Code Usage

After bootstrap, use in your code:

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';

// Load config
const config = require('./nits-vantablack/configs/mission_context.json').llmConfig;

// Analyze
const result = await analyzeWithLLM('Your text here', 'summary', config);
console.log('\n📄 Summary Output:\n' + result + '\n');
```

### ES Module Style (Recommended)

```javascript
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';
import fs from 'fs';

const configData = fs.readFileSync('./nits-vantablack/configs/mission_context.json', 'utf8');
const config = JSON.parse(configData).llmConfig;

const result = await analyzeWithLLM('Form 4 was filed under GAAP violation clause.', 'summary', config);
console.log('\n📄 Summary Output:\n' + result + '\n');
```

### Quick Test

```bash
# After running bootstrap script
node -e "
import('./nits-vantablack/ml_integration/local_model.js').then(async ({ analyzeWithLLM }) => {
  const fs = await import('fs');
  const configData = fs.readFileSync('./nits-vantablack/configs/mission_context.json', 'utf8');
  const config = JSON.parse(configData).llmConfig;
  const result = await analyzeWithLLM('Form 4 was filed under GAAP violation clause.', 'summary', config);
  console.log('\n📄 Summary Output:\n' + result + '\n');
});
"
```

### Troubleshooting

If the bootstrap script encounters issues:

1. **Dependency Installation Fails**
   ```bash
   npm install llama-node --save --legacy-peer-deps
   ```

2. **Model Download Fails**
   - Check internet connection
   - Try manual download: Visit the HuggingFace URL in browser
   - Verify disk space: `df -h`

3. **Test Fails**
   - Ensure sufficient RAM (8GB+)
   - Check model file exists: `ls -lh models/*.gguf`
   - Retry test: `node /tmp/test_llm.mjs`

### Next Steps

After successful bootstrap:

1. **Explore Examples**: `node nits-vantablack/examples/example_usage.mjs`
2. **Read Documentation**: `LOCAL_LLM_SETUP_GUIDE.md`
3. **Integrate with NITS**: See integration patterns in guide

### Integration with NITS Core

```javascript
// Use local LLM in your NITS workflow
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';

async function analyzeDocument(documentText) {
  // Perform local analysis
  const summary = await analyzeWithLLM(documentText, 'summary');
  const violations = await analyzeWithLLM(documentText, 'violations');
  
  return {
    summary,
    violations,
    timestamp: new Date().toISOString()
  };
}
```

### Configuration Customization

To change model settings, edit `nits-vantablack/configs/mission_context.json`:

```json
{
  "llmConfig": {
    "temperature": 0.5,    // Lower = more focused
    "maxTokens": 1024,     // Shorter responses
    "systemPrompt": "Custom prompt for your use case"
  }
}
```

### Performance Notes

- **First Run**: Model loading takes 5-10 seconds
- **Subsequent Runs**: Faster with memory mapping
- **Memory Usage**: ~6-8GB RAM during inference
- **Disk Space**: ~4GB for model file

---

✅ **Local model setup complete!**

For detailed documentation, see:
- `LOCAL_LLM_SETUP_GUIDE.md` - Complete guide
- `nits-vantablack/README.md` - Module documentation
- `nits-vantablack/QUICK_REFERENCE.md` - Quick reference
