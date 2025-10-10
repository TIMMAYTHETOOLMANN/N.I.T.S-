#!/bin/bash

# ========================================
# NITS Local LLM Bootstrap Script
# ========================================
# This script sets up local LLM inference for NITS using llama-node
# It downloads a GGUF model and configures the system for offline analysis
# ========================================

# --------- Configuration ---------
MODEL_URL="https://huggingface.co/TheBloke/Nous-Hermes-2-Mistral-7B-GGUF/resolve/main/nous-hermes-2-mistral-7b.Q4_K_M.gguf"
MODEL_NAME="nous-hermes-2-mistral-7b.Q4_K_M.gguf"
MODEL_DIR="./models"
CONFIG_FILE="./nits-vantablack/configs/mission_context.json"
SAMPLE_TEXT="Form 4 was filed under GAAP violation clause."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "  NITS Local LLM Bootstrap"
echo "=========================================="
echo ""

# --------- Step 1: Install Dependencies ---------
echo -e "${BLUE}📦 [1/5] Installing llama-node dependencies...${NC}"
npm install llama-node llama-node/dist/llm/llama-cpp.js --save 2>&1 | grep -E "(added|up to date)" || {
    echo -e "${YELLOW}⚠️  Installing with alternative method...${NC}"
    npm install llama-node --save
}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# --------- Step 2: Create Model Directory ---------
echo -e "${BLUE}📁 [2/5] Creating model directory...${NC}"
mkdir -p "$MODEL_DIR"

if [ -d "$MODEL_DIR" ]; then
    echo -e "${GREEN}✅ Model directory ready: $MODEL_DIR${NC}"
else
    echo -e "${RED}❌ Failed to create model directory${NC}"
    exit 1
fi
echo ""

# --------- Step 3: Download Model ---------
echo -e "${BLUE}⬇️  [3/5] Checking for GGUF model: $MODEL_NAME${NC}"

if [ -f "$MODEL_DIR/$MODEL_NAME" ]; then
    echo -e "${GREEN}✅ Model already downloaded: $MODEL_DIR/$MODEL_NAME${NC}"
    MODEL_SIZE=$(du -h "$MODEL_DIR/$MODEL_NAME" | cut -f1)
    echo -e "   Size: $MODEL_SIZE"
else
    echo "   Downloading from HuggingFace..."
    echo "   This may take several minutes (model size: ~4GB)"
    echo ""
    
    # Try curl first, then wget as fallback
    if command -v curl &> /dev/null; then
        curl -L --progress-bar -o "$MODEL_DIR/$MODEL_NAME" "$MODEL_URL"
    elif command -v wget &> /dev/null; then
        wget --show-progress -O "$MODEL_DIR/$MODEL_NAME" "$MODEL_URL"
    else
        echo -e "${RED}❌ Neither curl nor wget found. Please install one of them.${NC}"
        exit 1
    fi
    
    if [ -f "$MODEL_DIR/$MODEL_NAME" ]; then
        echo ""
        echo -e "${GREEN}✅ Model downloaded successfully${NC}"
        MODEL_SIZE=$(du -h "$MODEL_DIR/$MODEL_NAME" | cut -f1)
        echo -e "   Size: $MODEL_SIZE"
    else
        echo -e "${RED}❌ Model download failed${NC}"
        exit 1
    fi
fi
echo ""

# --------- Step 4: Patch Configuration ---------
echo -e "${BLUE}🛠️  [4/5] Updating configuration...${NC}"

# Ensure config directory exists
mkdir -p "$(dirname "$CONFIG_FILE")"

# Create or update configuration
cat > "$CONFIG_FILE" <<EOF
{
  "llmConfig": {
    "modelName": "nous-hermes-2-mistral-7b",
    "runtime": "llamacpp",
    "modelPath": "$MODEL_DIR/$MODEL_NAME",
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
EOF

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✅ Configuration updated: $CONFIG_FILE${NC}"
else
    echo -e "${RED}❌ Failed to create configuration${NC}"
    exit 1
fi
echo ""

# --------- Step 5: Test Local LLM ---------
echo -e "${BLUE}🧪 [5/5] Testing local LLM summarization...${NC}"
echo ""

# Create a test script
cat > /tmp/test_llm.mjs <<'EOF'
import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = './nits-vantablack/configs/mission_context.json';
const SAMPLE_TEXT = 'Form 4 was filed under GAAP violation clause.';

async function test() {
  try {
    console.log('📄 Loading configuration...');
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData).llmConfig;
    
    console.log(`🧠 Model: ${config.modelName}`);
    console.log(`📁 Path: ${config.modelPath}`);
    console.log('');
    console.log('📝 Sample text:', SAMPLE_TEXT);
    console.log('');
    console.log('🔍 Running analysis...');
    console.log('─────────────────────────────────────────────');
    
    const result = await analyzeWithLLM(SAMPLE_TEXT, 'summary', config);
    
    console.log('─────────────────────────────────────────────');
    console.log('');
    console.log('📄 Summary Output:');
    console.log(result);
    console.log('');
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
EOF

# Run the test
node /tmp/test_llm.mjs

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Local LLM test passed${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Test encountered issues. This may be due to:${NC}"
    echo "   - Model still downloading"
    echo "   - Insufficient memory (requires ~8GB RAM)"
    echo "   - Missing system dependencies"
    echo ""
    echo "   You can retry the test with:"
    echo "   node /tmp/test_llm.mjs"
fi

# Cleanup
rm -f /tmp/test_llm.mjs

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Local Model Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📚 Next Steps:"
echo "   1. Import the local model in your code:"
echo "      import { analyzeWithLLM } from './nits-vantablack/ml_integration/local_model.js';"
echo ""
echo "   2. Use it for analysis:"
echo "      const result = await analyzeWithLLM(text, 'summary');"
echo ""
echo "   3. Available modes: 'summary', 'violations', 'forensic'"
echo ""
echo "📁 Files:"
echo "   - Model: $MODEL_DIR/$MODEL_NAME"
echo "   - Config: $CONFIG_FILE"
echo "   - Integration: ./nits-vantablack/ml_integration/local_model.js"
echo ""
echo "=========================================="
