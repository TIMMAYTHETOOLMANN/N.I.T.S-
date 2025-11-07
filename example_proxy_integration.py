#!/usr/bin/env python3
"""
Example: Using Stealth Proxy System with NITS Legal Analysis

This example demonstrates how to integrate the stealth proxy system
for fetching legal documents before analysis.
"""

import logging
from stealth_proxy import get_stealth_session, get_proxies_report

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("nits_proxy_example")


def fetch_legal_document_with_proxy(url: str) -> str:
    """
    Fetch a legal document using the stealth proxy system.
    
    Args:
        url: URL of the legal document
    
    Returns:
        Document content as string, or None if failed
    """
    logger.info(f"Fetching document from: {url}")
    
    # Example provider proxies (replace with your actual proxies)
    provider_proxies = [
        {
            "ip": "proxy1.example.com",
            "port": 8000,
            "protocol": "http",
            "country": "US",
            "source": "example_provider"
        }
    ]
    
    # For testing without actual proxies, use empty list
    # This will attempt public proxy discovery if proxybroker is installed
    provider_proxies = []
    
    # Create stealth session
    session = get_stealth_session(
        country="US",
        limit=10,
        provider_data=provider_proxies if provider_proxies else None,
        base_timeout=20,
        max_retries_per_request=5,
        per_domain_delay=(2.0, 5.0)  # Slower, more careful
    )
    
    # Show proxy pool status
    report = get_proxies_report(session.proxy_pool)
    logger.info(report)
    
    # Attempt to fetch the document
    try:
        response = session.get(url)
        
        if response and response.status_code == 200:
            logger.info(f"✅ Successfully fetched document ({len(response.text)} bytes)")
            return response.text
        else:
            status = response.status_code if response else "No response"
            logger.error(f"❌ Failed to fetch document (status: {status})")
            return None
    
    except Exception as e:
        logger.error(f"❌ Exception while fetching: {e}")
        return None


def main():
    """Main example function"""
    logger.info("=" * 60)
    logger.info("NITS Stealth Proxy - Integration Example")
    logger.info("=" * 60)
    logger.info("")
    
    # Example 1: Fetch a public website (for testing)
    logger.info("Example 1: Fetching a public website")
    logger.info("-" * 60)
    
    # Use httpbin for testing (it echoes back request info)
    test_url = "https://httpbin.org/user-agent"
    
    content = fetch_legal_document_with_proxy(test_url)
    
    if content:
        logger.info("Sample content:")
        logger.info(content[:500])
    
    logger.info("")
    
    # Example 2: How to use with actual legal documents
    logger.info("Example 2: Legal Document Workflow (Pseudocode)")
    logger.info("-" * 60)
    
    example_code = """
    # In your NITS analysis code:
    from stealth_proxy import get_stealth_session
    
    # Initialize session once
    proxy_session = get_stealth_session(
        provider_data=your_provider_proxies,
        limit=30
    )
    
    # Fetch SEC filings
    sec_url = "https://www.sec.gov/..."
    response = proxy_session.get(sec_url)
    
    # Pass to NITS analysis
    if response:
        from core.analysis.TerminatorAnalysisEngine import TerminatorAnalysisEngine
        engine = TerminatorAnalysisEngine()
        violations = engine.terminateDocument(response.text)
        print(f"Found {len(violations)} violations")
    """
    
    logger.info(example_code)
    logger.info("")
    
    # Example 3: Configuration via environment variables
    logger.info("Example 3: Environment Configuration")
    logger.info("-" * 60)
    
    env_example = """
    # In your .env file:
    PROXY_ENABLED=true
    PROXY_COUNTRY=US
    PROXY_LIMIT=30
    PROXY_TIMEOUT=15
    PROXY_MAX_RETRIES=6
    PROXY_PROVIDER_API_URL=https://api.webshare.io/v1/proxies
    PROXY_PROVIDER_API_KEY=your_api_key_here
    
    # In your Python code:
    import os
    from dotenv import load_dotenv
    from stealth_proxy import get_stealth_session
    
    load_dotenv()
    
    if os.getenv("PROXY_ENABLED") == "true":
        session = get_stealth_session(
            country=os.getenv("PROXY_COUNTRY"),
            limit=int(os.getenv("PROXY_LIMIT", 30)),
            base_timeout=int(os.getenv("PROXY_TIMEOUT", 15)),
            max_retries_per_request=int(os.getenv("PROXY_MAX_RETRIES", 6))
        )
    """
    
    logger.info(env_example)
    logger.info("")
    
    logger.info("=" * 60)
    logger.info("✅ Example complete!")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Next steps:")
    logger.info("1. Set up provider proxies (recommended)")
    logger.info("2. Configure .env with your settings")
    logger.info("3. Integrate with NITS analysis workflows")
    logger.info("4. See PROXY_INTEGRATION_GUIDE.md for full documentation")


if __name__ == "__main__":
    main()
