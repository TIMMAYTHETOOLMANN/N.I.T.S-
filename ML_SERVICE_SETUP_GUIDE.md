# 🧠 N.I.T.S ML Service - Ultimate PDF Intelligence Fix

This guide provides instructions for setting up the ML service with OCR capabilities for enhanced PDF processing in N.I.T.S.

---

## 🚀 Quick Start - One Command Setup

### Automated Setup (Recommended)

Navigate to your repository root in JetBrains IDE Terminal and run:

```bash
bash setup_ml_service.sh
```

Or make it executable and run:

```bash
chmod +x setup_ml_service.sh
./setup_ml_service.sh
```

This **monolithic, all-in-one script** will:

| Step | Action                                                  |
| ---- | ------------------------------------------------------- |
| 1️⃣  | Navigate to `ml_service/` and create `.venv`          |
| 2️⃣  | Install required Python packages                       |
| 3️⃣  | Install system binaries: **Tesseract** and **Poppler** |
| 4️⃣  | Verify OCR engine availability                        |
| 5️⃣  | Confirm English language pack exists                   |
| 6️⃣  | Boot the **AI-Powered ML OCR Bridge** service          |

---

## 📋 What the Script Does

The setup script performs the following operations:

### 1. Virtual Environment Setup
Creates an isolated Python environment in `ml_service/.venv` to avoid conflicts with system packages.

### 2. Python Dependencies
Installs essential packages:
- **flask** - Web server framework
- **pdf2image** - PDF to image conversion
- **pytesseract** - Python wrapper for Tesseract OCR
- **requests** - HTTP client library

### 3. System Dependencies (Cross-Platform)

**macOS:**
```bash
brew install tesseract poppler
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y tesseract-ocr poppler-utils tesseract-ocr-eng
```

**Windows:**
- Manual installation required (see Troubleshooting section)

### 4. Verification
- Confirms Tesseract is in PATH
- Checks for English language pack (`eng`)

### 5. Service Launch
Starts the ML service on `http://127.0.0.1:5000`

---

## ✅ Post-Setup Next Steps

Once the ML service is running and you see:
```
🚀 Ultimate NITS ML Service starting on http://localhost:5000
```

### Launch the GUI

Open a **new terminal** window and run:

```bash
npm run start:gui:batch
```

### Access the Application

Navigate to:
```
http://localhost:4000
```

### Test PDF Upload

Upload a PDF document to test the newly enabled OCR-enhanced PDF intelligence.

---

## 🔧 Manual Setup (Alternative)

If the automated script doesn't work for your system, follow these manual steps:

### Step 1: Create Virtual Environment

```bash
cd ml_service
python3 -m venv .venv
```

### Step 2: Activate Virtual Environment

**Unix/macOS:**
```bash
source .venv/bin/activate
```

**Windows (Command Prompt):**
```cmd
.venv\Scripts\activate
```

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows (Git Bash):**
```bash
source .venv/Scripts/activate
```

### Step 3: Install Python Packages

```bash
pip install --upgrade pip
pip install flask pdf2image pytesseract requests
```

Or use the requirements file:
```bash
pip install -r requirements.txt
```

### Step 4: Install System Dependencies

**macOS:**
```bash
brew install tesseract poppler
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng poppler-utils
```

**Windows:**

1. **Install Tesseract:**
   - Download from: https://github.com/UB-Mannheim/tesseract/wiki
   - Add Tesseract to your PATH environment variable
   - Default install location: `C:\Program Files\Tesseract-OCR`

2. **Install Poppler:**
   - Download from: https://github.com/oschwartz10612/poppler-windows/releases
   - Extract and add `bin` folder to PATH
   - Example PATH: `C:\poppler\Library\bin`

### Step 5: Verify Installation

```bash
tesseract --version
tesseract --list-langs
```

Should output version info and list of languages (must include `eng`).

### Step 6: Run the Service

```bash
python main.py
```

---

## 🐛 Troubleshooting

### Issue: "Tesseract not found in PATH"

**Solution:**
1. Verify installation:
   ```bash
   which tesseract  # Unix/macOS
   where tesseract  # Windows
   ```

2. If not found, add to PATH:
   
   **Unix/macOS (.bashrc or .zshrc):**
   ```bash
   export PATH="/usr/local/bin:$PATH"
   ```
   
   **Windows:**
   - System Properties → Advanced → Environment Variables
   - Add Tesseract install directory to PATH
   - Restart terminal

### Issue: "PDF conversion failed" or "Poppler not found"

**Solution:**
1. Verify poppler installation:
   
   **Linux:**
   ```bash
   dpkg -l | grep poppler
   ```
   
   **macOS:**
   ```bash
   brew list poppler
   ```
   
   **Windows:**
   - Check if `pdftoppm.exe` exists in poppler's bin directory
   - Verify PATH includes poppler's bin folder

2. Re-install if missing:
   ```bash
   # macOS
   brew reinstall poppler
   
   # Linux
   sudo apt-get install --reinstall poppler-utils
   ```

### Issue: "eng language pack missing"

**Solution:**

**Linux:**
```bash
sudo apt-get install tesseract-ocr-eng
```

**macOS:**
```bash
brew reinstall tesseract  # Includes language packs
```

**Windows:**
- Language packs are included in the Tesseract installer
- Re-run installer and select additional language packs

### Issue: Virtual environment activation fails

**Git Bash on Windows:**
The script uses `source .venv/Scripts/activate` which works in Git Bash.

**PowerShell:**
You may need to enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Permission denied on Linux/macOS

**Solution:**
```bash
chmod +x setup_ml_service.sh
./setup_ml_service.sh
```

### Issue: "sudo" not available or permission denied

**Solution:**
- Install Tesseract and Poppler manually using a package manager you have access to
- Or request admin access from your system administrator
- On Windows, run terminal as Administrator

---

## 📡 Available API Endpoints

Once the ML service is running, the following endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and service status |
| `/embed` | POST | Generate text embeddings |
| `/contradiction` | POST | Detect contradictions between texts |
| `/financial_sentiment` | POST | Analyze financial sentiment |
| `/ocr` | POST | Perform OCR on images or PDFs |
| `/extract_entities` | POST | Extract financial/legal entities |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│         TypeScript/Node.js Frontend         │
│         (N.I.T.S Main Application)          │
└─────────────────┬───────────────────────────┘
                  │ HTTP API (Port 5000)
                  ▼
┌─────────────────────────────────────────────┐
│         Python ML Service (Flask)           │
│              ml_service/main.py             │
├─────────────────────────────────────────────┤
│  • Tesseract OCR (PDF → Text extraction)   │
│  • Sentence Transformers (Embeddings)       │
│  • PyTorch Models (ML inference)            │
│  • Financial Sentiment Analysis             │
│  • Entity Recognition                       │
└─────────────────────────────────────────────┘
```

---

## 📦 Directory Structure

```
N.I.T.S-/
├── ml_service/
│   ├── main.py                    # ML service Flask application
│   ├── requirements.txt           # Python dependencies
│   ├── setup_ml_service.sh        # Setup script (can run from here)
│   ├── README.md                  # ML service documentation
│   └── .venv/                     # Virtual environment (created by setup)
├── setup_ml_service.sh            # Setup script (run from repo root)
├── ML_SERVICE_SETUP_GUIDE.md      # This file
└── ...
```

---

## 🔐 Security Notes

- The virtual environment (`.venv/`) is excluded from version control via `.gitignore`
- No credentials or API keys are required for basic OCR functionality
- The service runs locally on `127.0.0.1` by default

---

## 🎯 System Requirements

**Minimum:**
- Python 3.8+
- pip (Python package manager)
- 2GB RAM
- 1GB free disk space

**Recommended:**
- Python 3.9+
- 4GB RAM
- 2GB free disk space
- SSD for faster model loading

**Operating Systems:**
- ✅ macOS 10.14+
- ✅ Ubuntu 18.04+
- ✅ Debian 10+
- ✅ Windows 10+
- ✅ WSL2 (Windows Subsystem for Linux)

---

## 📚 Additional Resources

- **Tesseract OCR:** https://github.com/tesseract-ocr/tesseract
- **Poppler:** https://poppler.freedesktop.org/
- **pdf2image:** https://github.com/Belval/pdf2image
- **pytesseract:** https://github.com/madmaze/pytesseract
- **Flask:** https://flask.palletsprojects.com/

---

## 💡 Tips

1. **Keep the ML service running** - It needs to be active for the GUI to use OCR features
2. **Use a separate terminal** - Run the ML service in one terminal and the GUI in another
3. **Check the logs** - If something fails, the ML service logs will show detailed error messages
4. **Language packs** - For non-English PDFs, install additional Tesseract language packs
5. **Performance** - First run may be slow due to model loading; subsequent requests are faster

---

## ✨ What's New

This ML service setup enables:
- 🔍 **OCR-Enhanced PDF Processing** - Extract text from scanned PDFs
- 🧠 **Semantic Analysis** - Advanced text understanding with transformers
- 📊 **Financial Intelligence** - Specialized financial document analysis
- 🔗 **Cross-Document Contradiction Detection** - Find inconsistencies across documents
- 🎯 **Entity Recognition** - Automatic extraction of financial and legal entities

---

You're now locked, loaded, and fully armed with OCR-enhanced PDF triangulation! 🚀
