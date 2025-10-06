#!/bin/bash
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
