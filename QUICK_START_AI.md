# 🤖 Quick Start: AI Investigator

## ⚡ Get Started in 3 Minutes

### Step 1: Get Your OpenAI API Key (2 minutes)

1. Visit: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 2: Configure (30 seconds)

```bash
# Copy the template
cp .env.example .env

# Edit the file and add your key
nano .env
# Or use any text editor:
# code .env
# vim .env
```

Add this line to `.env`:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

**⚠️ IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

### Step 3: Test (30 seconds)

```bash
# Run the test script
npx tsx test_ai_investigator.ts
```

**Expected Output:**
```
═══════════════════════════════════════════════════════════
🧪 TESTING AI INVESTIGATOR INTEGRATION
═══════════════════════════════════════════════════════════

📊 Initializing NITS Core System...
✅ NITS Core initialized

📄 Testing with: ./sample_docs/test_document.txt

═══════════════════════════════════════════════════════════
🤖 AI INVESTIGATOR ANALYSIS
═══════════════════════════════════════════════════════════
📄 Document: test_document.txt

🔍 Sending document to AI Investigator (GPT-4)...

✅ AI Investigator analysis complete
📁 Report saved to: ./output/ai_test_document.md

═══════════════════════════════════════════════════════════
✅ AI INVESTIGATOR TEST COMPLETE
═══════════════════════════════════════════════════════════
```

### Step 4: View Results

```bash
# Check the AI-generated report
cat output/ai_test_document.md

# Or open in your editor
code output/ai_test_document.md
```

---

## 🎯 Alternative: Demo Mode (No API Key Required)

Want to see how it works without an API key?

```bash
npx tsx demo_ai_investigator.ts
```

This shows:
- API structure
- Integration points
- Prompt templates
- Output format
- Next steps

---

## 💻 Use in Your Code

```typescript
import { IntegratedNITSCore } from './deploy/complete_integration_patch';

async function analyzeDocument() {
  // Initialize NITS
  const nits = new IntegratedNITSCore();
  await nits.initialize();

  // Run AI analysis
  await nits.analyzeUsingAI('./path/to/your/document.txt');
  
  // Check output in ./output/ai_document.md
}

analyzeDocument();
```

---

## 📚 Need More Help?

### Documentation
- **AI_INVESTIGATOR_README.md** - Complete guide
- **AI_INVESTIGATOR_DEPLOYMENT_SUMMARY.md** - Technical details
- **AI_INTEGRATION_DIAGRAM.md** - Architecture diagrams
- **README.md** - Main documentation

### Common Issues

**Issue: "API key not found"**
```bash
# Make sure .env exists and has your key
cat .env
# Should show: OPENAI_API_KEY=sk-...
```

**Issue: "Module 'openai' not found"**
```bash
# Install dependencies
npm install
```

**Issue: "Permission denied writing to output/"**
```bash
# Create output directory
mkdir -p output
chmod 755 output
```

---

## 💰 Cost Information

Typical document analysis costs **$0.02 - $0.10** using GPT-4.

To reduce costs, you can switch to GPT-3.5-turbo (10x cheaper):
1. Edit `core/analysis/AIInvestigator.ts`
2. Change `model: 'gpt-4'` to `model: 'gpt-3.5-turbo'`

---

## 🔐 Security Reminder

✅ Your API key is safe:
- ✅ `.env` is excluded from git (in `.gitignore`)
- ✅ Never commit `.env` to version control
- ✅ Use `.env.example` as a template only

---

## ✨ What You Get

The AI Investigator analyzes your documents and provides:

1. **Specific Violations** - Detailed list of legal violations found
2. **Legal Citations** - Relevant statutes (17 CFR § 240.10b-5, 15 U.S.C. § 78j, etc.)
3. **Severity Assessment** - Risk scoring for each violation
4. **Recommendations** - Enforcement actions and next steps

**Output Format:** Markdown report in `./output/ai_<filename>.md`

---

## 🚀 Ready for Production

Once you've tested, you can:
- Integrate into your existing workflows
- Add to the GUI with a checkbox option
- Process multiple documents in batch
- Combine with traditional NITS analysis

---

## 🎖️ Status Check

Run this to verify everything is working:

```bash
# Check all components
echo "Checking AIInvestigator..." && test -f core/analysis/AIInvestigator.ts && echo "✅" || echo "❌"
echo "Checking dependencies..." && grep -q openai package.json && echo "✅" || echo "❌"
echo "Checking .env protection..." && grep -q "^\.env$" .gitignore && echo "✅" || echo "❌"
echo "Checking TypeScript..." && npx tsc --noEmit && echo "✅" || echo "❌"
```

---

**That's it! You're ready to use the AI Investigator.** 🎉

For detailed documentation, see: **AI_INVESTIGATOR_README.md**
