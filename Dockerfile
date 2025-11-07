# NITS Core with Stealth Proxy System
# NO CHROMIUM - NO HEADLESS MODE - Pure Python/Node.js stack
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (no browser/chromium packages)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY python_requirements.txt .
COPY stealth_proxy_requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r python_requirements.txt
RUN pip install --no-cache-dir -r stealth_proxy_requirements.txt

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads output logs

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV NO_HEADLESS=true
ENV NO_BROWSER=true

# Expose ports
EXPOSE 3000 4000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Default command - GUI mode
CMD ["npm", "run", "start:gui"]
