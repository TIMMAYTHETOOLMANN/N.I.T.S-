# 🚀 NITS Stealth Proxy Integration Guide

## Overview

This guide covers the integration of the sophisticated **Stealth Proxy System** into NITS Core. The system provides:

- ✅ **NO Chromium/Browser Dependencies** - Pure Python requests-based
- ✅ **NO Headless Mode** - No browser automation whatsoever
- ✅ **Single-Click Docker Deployment** - Production-ready containerization
- ✅ **Sophisticated Proxy Rotation** - Health scoring, cooldown, sticky sessions
- ✅ **Stealth Capabilities** - Anti-bot headers, human-like delays, domain pacing

---

## 🐳 Quick Start with Docker (Single-Click Deployment)

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually included with Docker Desktop)

### Deploy in 3 Commands

```bash
# 1. Clone the repository (if not already)
git clone https://github.com/TIMMAYTHETOOLMANN/N.I.T.S-.git
cd N.I.T.S-

# 2. Configure environment (optional - copy and edit .env.example)
cp .env.example .env
# Edit .env with your API keys if needed

# 3. Launch with Docker Compose
docker-compose up -d
```

That's it! The system will:
- Build the Docker image with all dependencies
- Start the NITS Core application
- Expose GUI on http://localhost:4000
- Run ML service on http://localhost:5000

### Check Status

```bash
# View logs
docker-compose logs -f

# Check health
curl http://localhost:4000/health

# Stop the service
docker-compose down
```

---

## 📦 Manual Installation (Without Docker)

### Prerequisites
- Python 3.11+
- Node.js 20+
- pip and npm

### Installation Steps

```bash
# 1. Install Python dependencies
pip install -r python_requirements.txt
pip install -r stealth_proxy_requirements.txt

# 2. Install Node.js dependencies
npm install

# 3. Run the application
npm run start:gui
```

---

## 🔧 Stealth Proxy System Usage

### Basic Usage

```python
from stealth_proxy import get_stealth_session

# Create a stealth session with automatic proxy management
session = get_stealth_session(
    country="US",           # Optional: filter by country
    limit=30,               # Number of proxies to maintain
    base_timeout=15,        # Request timeout in seconds
    max_retries_per_request=6,  # Retry attempts
    per_domain_delay=(1.0, 4.0)  # Delay between requests to same domain
)

# Make requests
response = session.get("https://example.com")
if response and response.status_code == 200:
    print("Success!")
    print(response.text)
```

### With Provider Proxies (Recommended)

For production use, integrate with a proxy provider like WebShare, BrightData, or Oxylabs:

```python
from stealth_proxy import get_stealth_session

# Example provider proxies
provider_proxies = [
    {
        "ip": "1.2.3.4",
        "port": 8000,
        "protocol": "http",
        "country": "US",
        "source": "webshare"
    },
    {
        "ip": "5.6.7.8",
        "port": 8000,
        "protocol": "http",
        "country": "UK",
        "source": "webshare"
    }
]

session = get_stealth_session(
    provider_data=provider_proxies,
    limit=50
)

response = session.get("https://example.com")
```

### Advanced Features

#### 1. Manual Proxy Pool Management

```python
from stealth_proxy import ProxyPool, Proxy, StealthSession

# Create custom proxy pool
pool = ProxyPool(max_size=100, min_score=0.3)

# Add custom proxies
proxy1 = Proxy(host="1.2.3.4", port=8000, proto="http", country="US")
pool.add_proxy(proxy1)

# Create session with custom pool
session = StealthSession(
    proxy_pool=pool,
    base_timeout=10,
    max_retries_per_request=5
)

# Make requests
response = session.get("https://example.com")
```

#### 2. Proxy Statistics and Monitoring

```python
from stealth_proxy import get_stealth_session, get_proxies_report

session = get_stealth_session(limit=20)

# Get proxy pool report
report = get_proxies_report(session.proxy_pool)
print(report)

# Output:
# Proxy Pool Report
# - Total proxies: 20
# - Healthy (score >= 0.25): 15
```

#### 3. Sticky Sessions (Per-Domain Affinity)

Automatically enabled! The system maintains sticky sessions per domain for consistency:

```python
session = get_stealth_session(limit=30)

# These requests to the same domain will likely use the same proxy
response1 = session.get("https://example.com/page1")
response2 = session.get("https://example.com/page2")
```

---

## 🎯 Integration with NITS Core

### Using Proxy System in Legal Document Analysis

```python
# In your NITS analysis scripts
from stealth_proxy import get_stealth_session

# Initialize stealth session
proxy_session = get_stealth_session(limit=25)

# Fetch legal documents through proxies
def fetch_legal_document(url):
    response = proxy_session.get(url)
    if response and response.status_code == 200:
        return response.text
    return None

# Example: Fetch SEC filing
sec_url = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=..."
content = fetch_legal_document(sec_url)
```

### Environment Configuration

Add to your `.env` file:

```bash
# Proxy Configuration
PROXY_ENABLED=true
PROXY_COUNTRY=US
PROXY_LIMIT=30
PROXY_TIMEOUT=15
PROXY_MAX_RETRIES=6

# Provider Proxy API (if using)
PROXY_PROVIDER_API_URL=https://api.webshare.io/v1/proxies
PROXY_PROVIDER_API_KEY=your_api_key_here
```

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────┐
│          NITS Core Application                  │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │     Stealth Proxy System                  │ │
│  │                                           │ │
│  │  ┌─────────────┐    ┌──────────────┐    │ │
│  │  │ Proxy Pool  │───▶│ Health Score │    │ │
│  │  └─────────────┘    └──────────────┘    │ │
│  │         │                                │ │
│  │         ▼                                │ │
│  │  ┌─────────────┐    ┌──────────────┐   │ │
│  │  │  Rotation   │───▶│   Cooldown   │   │ │
│  │  └─────────────┘    └──────────────┘   │ │
│  │         │                                │ │
│  │         ▼                                │ │
│  │  ┌─────────────────────────────────┐   │ │
│  │  │    StealthSession (requests)    │   │ │
│  │  │  - Random Headers               │   │ │
│  │  │  - Human Delays                 │   │ │
│  │  │  - Domain Pacing                │   │ │
│  │  │  - Sticky Sessions              │   │ │
│  │  └─────────────────────────────────┘   │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │     Legal Analysis Engine                 │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Key Components

1. **Proxy Model** - Individual proxy with health tracking
2. **Proxy Pool** - Thread-safe collection with rotation logic
3. **Stealth Session** - HTTP client with anti-detection features
4. **Discovery System** - Public proxy discovery + provider integration

---

## 🔒 Security Features

### Anti-Detection Mechanisms

1. **Randomized User-Agents**
   - Desktop and mobile variants
   - Latest browser versions
   - Proper platform matching

2. **Stealth Headers**
   - Accept-Language rotation
   - Sec-Fetch-* headers
   - DNT (Do Not Track)
   - Cache-Control variations

3. **Human-Like Behavior**
   - Random delays between requests
   - Per-domain rate limiting
   - Jitter in timing patterns

4. **Proxy Health Management**
   - Success/failure tracking
   - Dynamic scoring system
   - Automatic cooldown periods
   - Eviction of bad proxies

---

## 📊 Performance Tuning

### Optimal Settings for Different Use Cases

#### High-Volume Scraping
```python
session = get_stealth_session(
    limit=100,                      # Large proxy pool
    max_retries_per_request=3,      # Fast failure
    per_domain_delay=(0.5, 2.0),   # Faster requests
    base_timeout=10                 # Quick timeout
)
```

#### Careful Analysis (Avoid Detection)
```python
session = get_stealth_session(
    limit=30,                       # Moderate pool
    max_retries_per_request=6,      # More retries
    per_domain_delay=(2.0, 5.0),   # Slower, more human-like
    base_timeout=20                 # Patient timeout
)
```

#### Single-Target Research
```python
session = get_stealth_session(
    limit=10,                       # Small pool (sticky session benefit)
    max_retries_per_request=8,      # Max persistence
    per_domain_delay=(3.0, 8.0),   # Very human-like
    base_timeout=30                 # Long timeout
)
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. No Proxies Available

**Problem**: "No available proxies in pool"

**Solutions**:
- Install proxybroker: `pip install proxybroker`
- Use provider proxies instead of public proxies
- Increase limit parameter
- Check proxy cooldown times

#### 2. All Requests Failing

**Problem**: "All 6 attempts failed for URL"

**Solutions**:
- Check your internet connection
- Verify target URL is accessible
- Try provider proxies (public proxies are unreliable)
- Increase timeout value
- Check if target has aggressive blocking

#### 3. Slow Performance

**Problem**: Requests taking too long

**Solutions**:
- Reduce per_domain_delay
- Decrease max_retries_per_request
- Lower base_timeout
- Use better quality proxies

---

## 🔗 Integration with Popular Tools

### With NITS Legal Engine

```python
from stealth_proxy import get_stealth_session
from core.analysis.TerminatorAnalysisEngine import TerminatorAnalysisEngine

# Initialize both systems
proxy_session = get_stealth_session(limit=20)
legal_engine = TerminatorAnalysisEngine()

# Fetch and analyze
url = "https://example.com/legal-document.pdf"
response = proxy_session.get(url)

if response:
    violations = legal_engine.terminateDocument(response.content)
    print(f"Found {len(violations)} violations")
```

### With BeautifulSoup (HTML Parsing)

```python
from stealth_proxy import get_stealth_session
from bs4 import BeautifulSoup

session = get_stealth_session(limit=15)
response = session.get("https://example.com")

if response:
    soup = BeautifulSoup(response.text, 'html.parser')
    # Parse content...
```

---

## 📝 Best Practices

1. **Always use provider proxies for production** - Public proxies are unreliable
2. **Monitor proxy health** - Check reports regularly
3. **Adjust delays per target** - Some sites need slower pacing
4. **Use sticky sessions** - Maintains consistency per domain
5. **Handle failures gracefully** - Not all requests will succeed
6. **Rotate user agents** - Already done automatically
7. **Respect robots.txt** - Check site policies
8. **Stay legal** - Only scrape what you're allowed to

---

## 🆘 Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments in `stealth_proxy.py`
- Open an issue on GitHub
- Check proxy provider documentation

---

## 📚 References

- **Kong AI Proxy**: https://docs.konghq.com
- **CC Proxy**: https://ccproxy.orchestre.dev
- **Proxy Security**: https://sprocketsecurity.com
- **Proxy Lite**: https://github.com/proxy-lite

---

## ⚖️ Legal Disclaimer

This proxy system is provided for legal use cases only. Users are responsible for:
- Complying with website terms of service
- Respecting robots.txt and rate limits
- Following applicable laws and regulations
- Using proxies ethically and legally

The authors assume no liability for misuse of this system.
