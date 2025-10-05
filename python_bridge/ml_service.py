#!/usr/bin/env python3
"""
Ultimate NITS Python ML Service
Provides transformer models, OCR, and advanced NLP via HTTP API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import torch
import logging
import base64
import cv2
from io import BytesIO
from PIL import Image
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('UltimateNITS.MLService')

app = Flask(__name__)
CORS(app)

# Global model variables
bi_encoder = None
cross_encoder = None
ocr = None
finbert_pipeline = None
models_loaded = False

def initialize_models():
    """Initialize all ML models at startup"""
    global bi_encoder, cross_encoder, ocr, finbert_pipeline, models_loaded
    
    try:
        logger.info("🔄 Initializing ML models...")
        
        # Initialize sentence transformer for embeddings
        try:
            from sentence_transformers import SentenceTransformer, CrossEncoder
            bi_encoder = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
            cross_encoder = CrossEncoder('cross-encoder/nli-deberta-v3-base')
            logger.info("✅ Sentence transformers loaded")
        except Exception as e:
            logger.warning(f"⚠️  Sentence transformers failed to load: {e}")
            bi_encoder = None
            cross_encoder = None
        
        # Initialize OCR
        try:
            from paddleocr import PaddleOCR
            ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False)
            logger.info("✅ PaddleOCR loaded")
        except Exception as e:
            logger.warning(f"⚠️  PaddleOCR failed to load: {e}")
            ocr = None
        
        # Initialize FinBERT for financial sentiment
        try:
            from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
            
            # Try to load FinBERT
            finbert_tokenizer = AutoTokenizer.from_pretrained('yiyanghkust/finbert-tone')
            finbert_model = AutoModelForSequenceClassification.from_pretrained('yiyanghkust/finbert-tone')
            finbert_pipeline = pipeline("text-classification", model=finbert_model, tokenizer=finbert_tokenizer)
            logger.info("✅ FinBERT loaded")
        except Exception as e:
            logger.warning(f"⚠️  FinBERT failed to load: {e}")
            # Fallback to basic sentiment analysis
            try:
                from transformers import pipeline
                finbert_pipeline = pipeline("sentiment-analysis")
                logger.info("✅ Basic sentiment analysis loaded as fallback")
            except Exception as e2:
                logger.warning(f"⚠️  Sentiment analysis failed to load: {e2}")
                finbert_pipeline = None
        
        models_loaded = True
        logger.info("✅ ML Service initialization complete")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize ML models: {e}")
        models_loaded = False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": models_loaded,
        "available_services": {
            "embeddings": bi_encoder is not None,
            "contradiction_detection": cross_encoder is not None,
            "ocr": ocr is not None,
            "financial_sentiment": finbert_pipeline is not None
        }
    })

@app.route('/embed', methods=['POST'])
def embed_texts():
    """Generate embeddings for text chunks"""
    if not bi_encoder:
        return jsonify({"error": "Sentence transformer not available"}), 503
    
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({"error": "No texts provided"}), 400
        
        # Generate embeddings
        embeddings = bi_encoder.encode(texts, convert_to_numpy=True)
        
        return jsonify({
            "embeddings": embeddings.tolist(),
            "dimension": embeddings.shape[1],
            "count": len(embeddings)
        })
        
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/contradiction', methods=['POST'])
def detect_contradiction():
    """Detect contradictions between sentence pairs"""
    if not cross_encoder:
        return jsonify({"error": "Cross-encoder not available"}), 503
    
    try:
        data = request.json
        pairs = data.get('pairs', [])
        
        if not pairs:
            return jsonify({"error": "No sentence pairs provided"}), 400
        
        # Cross-encoder prediction
        predictions = cross_encoder.predict(pairs)
        
        results = []
        for i, pred in enumerate(predictions):
            # Convert logits to probabilities
            if isinstance(pred, (list, np.ndarray)) and len(pred) == 3:
                # [contradiction, entailment, neutral]
                probs = torch.softmax(torch.tensor(pred), dim=0).numpy()
                contradiction_prob = float(probs[0])
                entailment_prob = float(probs[1])
                neutral_prob = float(probs[2])
            else:
                # Single score - interpret as contradiction probability
                contradiction_prob = float(pred) if pred > 0.5 else 1 - float(pred)
                entailment_prob = 0.0
                neutral_prob = 1 - contradiction_prob
            
            label = "contradiction" if contradiction_prob > 0.5 else "neutral"
            confidence = max(contradiction_prob, neutral_prob)
            
            results.append({
                "pair_index": i,
                "contradiction_prob": contradiction_prob,
                "entailment_prob": entailment_prob,
                "neutral_prob": neutral_prob,
                "label": label,
                "confidence": confidence
            })
        
        return jsonify({"results": results})
        
    except Exception as e:
        logger.error(f"Contradiction detection error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/financial_sentiment', methods=['POST'])
def financial_sentiment():
    """Analyze financial sentiment with FinBERT or fallback"""
    if not finbert_pipeline:
        return jsonify({"error": "Financial sentiment analysis not available"}), 503
    
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({"error": "No texts provided"}), 400
        
        results = []
        for text in texts:
            # Truncate text to avoid token limits
            truncated_text = text[:512] if len(text) > 512 else text
            
            try:
                sentiment_result = finbert_pipeline(truncated_text)
                
                # Handle different response formats
                if isinstance(sentiment_result, list) and len(sentiment_result) > 0:
                    result = sentiment_result[0]
                else:
                    result = sentiment_result
                
                results.append({
                    "text": truncated_text,
                    "label": result.get("label", "neutral"),
                    "score": result.get("score", 0.5)
                })
            except Exception as e:
                logger.warning(f"Sentiment analysis failed for text: {e}")
                results.append({
                    "text": truncated_text,
                    "label": "neutral",
                    "score": 0.5,
                    "error": str(e)
                })
        
        return jsonify({"sentiments": results})
        
    except Exception as e:
        logger.error(f"Financial sentiment error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/ocr', methods=['POST'])
def perform_ocr():
    """Perform OCR on image data or PDF file"""
    try:
        data = request.json
        
        # Check if this is PDF OCR request
        pdf_path = data.get('pdf_path')
        if pdf_path:
            # Handle PDF OCR using pdf2image + pytesseract
            try:
                from pdf2image import convert_from_path
                import pytesseract
            except ImportError as e:
                return jsonify({"error": f"Required OCR dependencies not installed: {e}"}), 503
            
            # Check if PDF file exists
            import os
            if not os.path.exists(pdf_path):
                return jsonify({"error": f"PDF file not found: {pdf_path}"}), 404
            
            # Convert PDF to images and extract text
            images = convert_from_path(pdf_path)
            text_pages = []
            for i, img in enumerate(images):
                try:
                    page_text = pytesseract.image_to_string(img)
                    text_pages.append(page_text)
                except Exception as e:
                    logger.error(f"OCR failed for page {i+1}: {e}")
                    text_pages.append("")
            
            full_text = "\n".join(text_pages)
            return jsonify({"text": full_text})
        
        # Handle image OCR (existing functionality)
        if not ocr:
            return jsonify({"error": "OCR service not available"}), 503
        
        image_base64 = data.get('image', '')
        if not image_base64:
            return jsonify({"error": "No image or pdf_path provided"}), 400
        
        # Decode base64 image
        try:
            img_bytes = base64.b64decode(image_base64)
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image data"}), 400
            
        except Exception as e:
            return jsonify({"error": f"Image decode error: {str(e)}"}), 400
        
        # Perform OCR
        try:
            result = ocr.ocr(image, cls=True)
            
            # Extract text and confidence scores
            extracted_text = []
            full_text = ""
            
            if result and result[0]:
                for line in result[0]:
                    if line and len(line) >= 2:
                        text = line[1][0] if line[1] else ""
                        confidence = line[1][1] if len(line[1]) > 1 else 0.0
                        
                        extracted_text.append({
                            "text": text,
                            "confidence": float(confidence)
                        })
                        full_text += text + " "
            
            return jsonify({
                "text": full_text.strip(),
                "detailed_results": extracted_text,
                "total_items": len(extracted_text)
            })
            
        except Exception as e:
            logger.error(f"OCR processing error: {e}")
            return jsonify({"error": f"OCR processing failed: {str(e)}"}), 500
        
    except Exception as e:
        logger.error(f"OCR error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/extract_entities', methods=['POST'])
def extract_entities():
    """Extract financial and legal entities from text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        entities = []
        
        # Extract monetary amounts
        import re
        money_pattern = r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(million|billion|M|B)?'
        for match in re.finditer(money_pattern, text, re.IGNORECASE):
            value = float(match.group(1).replace(',', ''))
            multiplier = match.group(2)
            
            if multiplier and multiplier.lower() in ['million', 'm']:
                value *= 1e6
            elif multiplier and multiplier.lower() in ['billion', 'b']:
                value *= 1e9
            
            entities.append({
                "type": "MONEY",
                "text": match.group(0),
                "value": value,
                "position": match.start()
            })
        
        # Extract regulatory citations
        citation_pattern = r'(?:17|15|26)\s+(?:CFR|U\.S\.C\.)\s+§?\s*\d+(?:\.\d+)?(?:\([a-z]\))?'
        for match in re.finditer(citation_pattern, text, re.IGNORECASE):
            entities.append({
                "type": "REGULATION",
                "text": match.group(0),
                "position": match.start()
            })
        
        # Extract dates
        date_pattern = r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b'
        for match in re.finditer(date_pattern, text, re.IGNORECASE):
            entities.append({
                "type": "DATE",
                "text": match.group(0),
                "position": match.start()
            })
        
        return jsonify({
            "entities": entities,
            "count": len(entities)
        })
        
    except Exception as e:
        logger.error(f"Entity extraction error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize models at startup
    initialize_models()
    
    print("🚀 Ultimate NITS ML Service starting on http://localhost:5000")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /embed - Generate text embeddings")
    print("  POST /contradiction - Detect contradictions")
    print("  POST /financial_sentiment - Financial sentiment analysis")
    print("  POST /ocr - OCR image processing")
    print("  POST /extract_entities - Extract financial/legal entities")
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)