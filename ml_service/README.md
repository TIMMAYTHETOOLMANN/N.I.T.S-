# 🧠 ML Service Setup Guide

This directory contains the Machine Learning service for N.I.T.S., providing OCR capabilities, text embeddings, and contradiction detection.

## 🚀 Quick Start

### Automated Setup (Recommended)

Run the all-in-one setup script:

```bash
./setup_ml_service.sh
```

This script will:
1. Create a Python virtual environment (`.venv`)
2. Install required Python packages
3. Install system dependencies (Tesseract OCR and Poppler)
4. Verify Tesseract installation
5. Check for English language pack
6. Launch the ML Service on `http://localhost:5000`

### Manual Setup

If you prefer to set up manually or the automated script doesn't work for your system:

#### 1. Create Virtual Environment

```bash
cd ml_service
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

#### 2. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 3. Install System Dependencies

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
- Download and install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
- Download and install Poppler from: https://github.com/oschwartz10612/poppler-windows/releases

#### 4. Verify Installation

```bash
tesseract --version
tesseract --list-langs  # Should include 'eng'
```

#### 5. Run the Service

```bash
python main.py
```

The service will start on `http://localhost:5000`

## 📡 Available Endpoints

Once running, the ML Service provides:

- `GET /health` - Health check
- `POST /embed` - Generate text embeddings
- `POST /contradiction` - Detect contradictions
- `POST /financial_sentiment` - Financial sentiment analysis
- `POST /ocr` - OCR image/PDF processing
- `POST /extract_entities` - Extract financial/legal entities

## 🔧 Integration with Main Application

After the ML service is running, start the GUI from the project root:

```bash
npm run start:gui:batch
```

Then navigate to `http://localhost:4000` to use the application.

## 🐛 Troubleshooting

### Tesseract Not Found
If you get a "Tesseract not found in PATH" error:
- Verify installation: `which tesseract` (Unix) or `where tesseract` (Windows)
- Add Tesseract to your PATH environment variable

### Poppler Not Found
If PDF conversion fails:
- Verify poppler-utils is installed (Linux)
- On macOS: `brew list poppler`
- On Windows: Ensure poppler's bin directory is in PATH

### Virtual Environment Issues
If activation fails:
- Unix/macOS: `source .venv/bin/activate`
- Windows: `.venv\Scripts\activate`
- Git Bash (Windows): `source .venv/Scripts/activate`

## 📝 Requirements

- Python 3.8 or higher
- pip (Python package manager)
- Tesseract OCR (with English language pack)
- Poppler utilities (for PDF processing)

## 🏗️ Architecture

The ML Service acts as a bridge between the TypeScript/Node.js frontend and Python ML libraries:

```
TypeScript Application → HTTP API → Python ML Service
                                    ↓
                           [Tesseract OCR]
                           [Sentence Transformers]
                           [PyTorch Models]
                           [PDF Processing]
```
