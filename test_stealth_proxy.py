#!/usr/bin/env python3
"""
Test script for Stealth Proxy System
Tests basic functionality without requiring actual proxy discovery
"""

import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("test_stealth_proxy")

def test_imports():
    """Test that all required modules can be imported"""
    logger.info("Testing imports...")
    
    try:
        from stealth_proxy import (
            Proxy,
            ProxyPool,
            StealthSession,
            random_headers,
            human_delay,
            get_stealth_session,
            generate_proxies_on_demand
        )
        logger.info("✅ All imports successful")
        return True
    except ImportError as e:
        logger.error(f"❌ Import failed: {e}")
        return False

def test_proxy_model():
    """Test Proxy model functionality"""
    logger.info("Testing Proxy model...")
    
    try:
        from stealth_proxy import Proxy
        
        # Create a test proxy
        proxy = Proxy(host="1.2.3.4", port=8000, proto="http", country="US")
        
        # Test attributes
        assert proxy.host == "1.2.3.4"
        assert proxy.port == 8000
        assert proxy.proto == "http"
        assert proxy.country == "US"
        
        # Test score (should be 0.5 initially - no history)
        assert 0.4 <= proxy.score <= 0.6
        
        # Test marking success
        proxy.mark_success()
        assert proxy.success == 1
        
        # Test marking failure
        proxy.mark_fail(soft=True)
        assert proxy.fail == 1
        
        # Test as_requests_proxy
        proxy_dict = proxy.as_requests_proxy()
        assert "http" in proxy_dict
        assert "https" in proxy_dict
        
        logger.info("✅ Proxy model tests passed")
        return True
    except Exception as e:
        logger.error(f"❌ Proxy model test failed: {e}")
        return False

def test_proxy_pool():
    """Test ProxyPool functionality"""
    logger.info("Testing ProxyPool...")
    
    try:
        from stealth_proxy import ProxyPool, Proxy
        
        # Create pool
        pool = ProxyPool(max_size=10, min_score=0.25)
        
        # Add proxies
        for i in range(5):
            proxy = Proxy(host=f"1.2.3.{i}", port=8000, proto="http")
            pool.add_proxy(proxy)
        
        # Check stats
        stats = pool.stats()
        assert stats["total"] == 5
        
        # Get next proxy
        proxy = pool.get_next()
        assert proxy is not None
        
        # Mark result
        pool.mark_result(proxy, success=True)
        
        # Test bulk add
        proxies = [Proxy(host=f"5.6.7.{i}", port=8000) for i in range(3)]
        pool.bulk_add(proxies)
        
        stats = pool.stats()
        assert stats["total"] == 8
        
        logger.info("✅ ProxyPool tests passed")
        return True
    except Exception as e:
        logger.error(f"❌ ProxyPool test failed: {e}")
        return False

def test_headers():
    """Test header generation"""
    logger.info("Testing header generation...")
    
    try:
        from stealth_proxy import random_headers
        
        # Generate desktop headers
        headers = random_headers(is_mobile=False)
        assert "User-Agent" in headers
        assert "Accept" in headers
        assert "Accept-Language" in headers
        
        # Generate mobile headers (force mobile)
        headers_mobile = random_headers(is_mobile=True)
        assert "User-Agent" in headers_mobile
        
        # Test with referer
        headers_ref = random_headers(referer="https://example.com")
        # Referer might or might not be added (random)
        
        # Test with extra headers
        headers_extra = random_headers(extra={"X-Custom": "test"})
        assert "X-Custom" in headers_extra
        assert headers_extra["X-Custom"] == "test"
        
        logger.info("✅ Header generation tests passed")
        return True
    except Exception as e:
        logger.error(f"❌ Header generation test failed: {e}")
        return False

def test_provider_integration():
    """Test provider proxy integration"""
    logger.info("Testing provider proxy integration...")
    
    try:
        from stealth_proxy import integrate_provider_proxies
        
        # Test provider data
        provider_data = [
            {
                "ip": "1.2.3.4",
                "port": 8000,
                "protocol": "http",
                "country": "US",
                "source": "test_provider"
            },
            {
                "ip": "5.6.7.8",
                "port": 8080,
                "protocol": "https",
                "country": "UK",
                "source": "test_provider"
            }
        ]
        
        proxies = integrate_provider_proxies(provider_data)
        assert len(proxies) == 2
        assert proxies[0].host == "1.2.3.4"
        assert proxies[0].port == 8000
        assert proxies[1].country == "UK"
        
        logger.info("✅ Provider integration tests passed")
        return True
    except Exception as e:
        logger.error(f"❌ Provider integration test failed: {e}")
        return False

def test_session_creation():
    """Test StealthSession creation"""
    logger.info("Testing StealthSession creation...")
    
    try:
        from stealth_proxy import get_stealth_session, Proxy
        
        # Create session with provider data (no public proxy discovery)
        provider_data = [
            {
                "ip": "1.2.3.4",
                "port": 8000,
                "protocol": "http",
                "country": "US",
                "source": "test"
            }
        ]
        
        session = get_stealth_session(
            provider_data=provider_data,
            limit=5,
            base_timeout=10
        )
        
        assert session is not None
        assert session.proxy_pool is not None
        assert session.timeout == 10
        
        logger.info("✅ StealthSession creation tests passed")
        return True
    except Exception as e:
        logger.error(f"❌ StealthSession creation test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("=" * 60)
    logger.info("NITS Stealth Proxy System - Test Suite")
    logger.info("=" * 60)
    logger.info("")
    
    tests = [
        ("Imports", test_imports),
        ("Proxy Model", test_proxy_model),
        ("Proxy Pool", test_proxy_pool),
        ("Header Generation", test_headers),
        ("Provider Integration", test_provider_integration),
        ("Session Creation", test_session_creation),
    ]
    
    results = []
    for name, test_func in tests:
        logger.info("")
        logger.info(f"Running: {name}")
        logger.info("-" * 60)
        result = test_func()
        results.append((name, result))
        logger.info("")
    
    # Summary
    logger.info("=" * 60)
    logger.info("Test Summary")
    logger.info("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{status} - {name}")
    
    logger.info("")
    logger.info(f"Total: {passed}/{total} tests passed")
    logger.info("")
    
    if passed == total:
        logger.info("🎉 All tests passed!")
        return 0
    else:
        logger.error(f"❌ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
