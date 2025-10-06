# 🚀 Quick Setup - ML Service

## One-Command Installation

Copy and paste this entire block into your JetBrains IDE Terminal (from repository root):

```bash
# ------------------------------
# 🌐 SYSTEM-WIDE DEPENDENCY FIX
# ------------------------------

echo "🚀 [1/6] Creating Python Virtual Environment..."
cd ml_service || { echo "❌ 'ml_service' directory not found. Abort."; exit 1; }
python3 -m venv .venv
source .venv/bin/activate || source .venv/Scripts/activate

echo "📦 [2/6] Installing Required Python Packages..."
pip install --upgrade pip
pip install flask pdf2image pytesseract requests

echo "🔧 [3/6] Installing Tesseract + Poppler..."
OS_TYPE=$(uname)
if [[ "$OS_TYPE" == "Darwin" ]]; then
    # macOS
    brew install tesseract || echo "✅ Tesseract already installed"
    brew install poppler || echo "✅ Poppler already installed"
elif [[ "$OS_TYPE" == "Linux" ]]; then
    # Linux
    sudo apt-get update
    sudo apt-get install -y tesseract-ocr poppler-utils
else
    echo "⚠️ Please install Tesseract and Poppler manually for OS: $OS_TYPE"
fi

echo "🧠 [4/6] Verifying Tesseract Installation..."
tesseract --version || { echo "❌ Tesseract not found in PATH. Abort."; exit 1; }

echo "🌐 [5/6] Checking Language Pack (eng)..."
tesseract --list-langs | grep -q 'eng' || {
    echo "⚠️ 'eng' language pack missing. Attempting install..."
    sudo apt-get install -y tesseract-ocr-eng
}

echo "✅ Environment setup complete."

# ------------------------------
# 🔁 RUN ML SERVICE
# ------------------------------
echo "🧠 [6/6] Launching ML Service..."
python main.py
```

---

## Alternative: Use the Setup Script

If you prefer to use the pre-made script:

```bash
./setup_ml_service.sh
```

or

```bash
bash setup_ml_service.sh
```

---

## What This Does

| Step | Action                                                  |
| ---- | ------------------------------------------------------- |
| 1️⃣  | Navigates to `ml_service/` and creates `.venv`          |
| 2️⃣  | Installs required Python packages                       |
| 3️⃣  | Installs system binaries: **Tesseract** and **Poppler** |
| 4️⃣  | Verifies OCR engine availability                        |
| 5️⃣  | Confirms English language pack exists                   |
| 6️⃣  | Boots the **AI-Powered ML OCR Bridge** service          |

---

## After Setup

Once the service is running and you see `* Running on http://127.0.0.1:5000`, open a new terminal and launch the GUI:

```bash
npm run start:gui:batch
```

Then navigate to `http://localhost:4000` and test upload a PDF.

---

For detailed documentation, troubleshooting, and manual setup instructions, see: **[ML_SERVICE_SETUP_GUIDE.md](./ML_SERVICE_SETUP_GUIDE.md)**
