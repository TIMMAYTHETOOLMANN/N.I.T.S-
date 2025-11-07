#!/usr/bin/env python3
"""
Monolithic Stealth Proxy System
================================

A production-grade, drop-in proxy management system with:
- Proxy discovery and health scoring
- Intelligent rotation and cooldown
- Stealth headers and anti-bot heuristics
- Session affinity per domain
- No Chromium/browser dependencies (pure requests)

Usage:
    from stealth_proxy import get_stealth_session
    
    session = get_stealth_session(limit=30)
    response = session.get("https://example.com")
"""

import requests
from typing import List, Tuple, Optional, Dict, Any
from urllib.parse import urlparse
import asyncio
import threading
import random
import time
import logging

try:
    from proxybroker import Broker
    PROXYBROKER_AVAILABLE = True
except ImportError:
    PROXYBROKER_AVAILABLE = False
    logging.warning("proxybroker not available - public proxy discovery disabled")

# =====================================================================
# LOGGING
# =====================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)
logger = logging.getLogger("monolithic_stealth_proxy")

# =====================================================================
# USER-AGENT / HEADER POOLS (STEALTH)
# =====================================================================
DESKTOP_UAS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) "
    "Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
]

MOBILE_UAS = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
    "Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-G996B) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
]

ACCEPT_LANGS = [
    "en-US,en;q=0.9",
    "en-GB,en;q=0.9",
    "en-US,en;q=0.8,fr;q=0.6",
    "en-US,en;q=0.8,de;q=0.5",
]

ACCEPT_HEADERS = [
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
]

# Basic patterns to detect soft blocks / WAF / captcha pages
BLOCK_PATTERNS = [
    "captcha",
    "recaptcha",
    "access denied",
    "verify you are human",
    "are you a robot",
    "unusual traffic",
    "blocked because",
    "forbidden",
]

SOFT_STATUS_CODES = {403, 429, 503}

# Stealth configuration constants
MOBILE_UA_PROBABILITY = 0.6  # Probability of using mobile UA when is_mobile=True
REFERER_INCLUSION_PROBABILITY = 0.85  # Probability of including referer header
DNT_INCLUSION_PROBABILITY = 0.30  # Probability of including DNT header
CACHE_CONTROL_PROBABILITY = 0.30  # Probability of including Cache-Control
PRAGMA_PROBABILITY = 0.25  # Probability of including Pragma header

# Proxy health and scoring constants
INITIAL_PROXY_SCORE = 0.5  # Starting score for proxies with no history
MAX_SCORE_DECAY = 0.2  # Maximum score decay from age (0-0.2)
SCORE_DECAY_RATE = 0.05  # Decay per hour (5%)
DECAY_HOURS_DIVISOR = 3600.0  # Convert seconds to hours

# Proxy cooldown and penalty constants
SOFT_FAIL_PENALTY_SECONDS = 20  # Cooldown for soft failures
HARD_FAIL_PENALTY_SECONDS = 90  # Cooldown for hard failures
MAX_PENALTY_MULTIPLIER = 3  # Maximum penalty multiplier
FAILURE_THRESHOLD = 3  # Failures before penalty scaling kicks in
COOLDOWN_REDUCTION_SUCCESS = 5  # Seconds to reduce cooldown on success


def random_headers(
    is_mobile: bool = False,
    referer: Optional[str] = None,
    extra: Optional[Dict[str, str]] = None
) -> Dict[str, str]:
    """Generate randomized stealth headers"""
    ua_pool = MOBILE_UAS if is_mobile and random.random() < MOBILE_UA_PROBABILITY else DESKTOP_UAS
    ua = random.choice(ua_pool)
    
    headers = {
        "User-Agent": ua,
        "Accept": random.choice(ACCEPT_HEADERS),
        "Accept-Language": random.choice(ACCEPT_LANGS),
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
    }
    
    if referer and random.random() < REFERER_INCLUSION_PROBABILITY:
        headers["Referer"] = referer
    
    if random.random() < DNT_INCLUSION_PROBABILITY:
        headers["DNT"] = "1"
    
    if random.random() < CACHE_CONTROL_PROBABILITY:
        headers["Cache-Control"] = "max-age=0"
    
    if random.random() < PRAGMA_PROBABILITY:
        headers["Pragma"] = "no-cache"
    
    if extra:
        headers.update(extra)
    
    return headers


def human_delay(
    min_delay: float = 0.8,
    max_delay: float = 4.2,
    jitter: float = 0.25
):
    """Simulate human-like delay with jitter"""
    base = random.uniform(min_delay, max_delay)
    j = random.uniform(-jitter, jitter)
    final = max(0.05, base + j)
    time.sleep(final)


# =====================================================================
# PROXY MODEL
# =====================================================================
class Proxy:
    """Proxy with success/fail accounting, cooldown, and score."""
    
    def __init__(
        self,
        host: str,
        port: int,
        proto: str = "http",
        country: Optional[str] = None,
        source: str = "public"
    ):
        self.host = host
        self.port = port
        self.proto = proto.lower()
        self.country = country
        self.source = source  # e.g. "public", "provider"
        self.success = 0
        self.fail = 0
        self.last_used = 0.0
        self.cooldown_until = 0.0
        self.created_at = time.time()
    
    def __repr__(self):
        return (
            f"{self.proto}://{self.host}:{self.port} "
            f"src={self.source} score={self.score:.2f}"
        )
    
    @property
    def score(self) -> float:
        """Calculate health score with time-based decay"""
        total = self.success + self.fail
        base = (self.success / total) if total > 0 else INITIAL_PROXY_SCORE
        
        # Slight time-based decay so old stats don't dominate
        age = max(1.0, time.time() - self.created_at)
        decay = min(MAX_SCORE_DECAY, (age / DECAY_HOURS_DIVISOR) * SCORE_DECAY_RATE)
        return max(0.0, min(1.0, base - decay))
    
    def mark_success(self):
        """Mark proxy as successful"""
        self.success += 1
        self.last_used = time.time()
        self.cooldown_until = max(self.cooldown_until - COOLDOWN_REDUCTION_SUCCESS, time.time())
    
    def mark_fail(self, soft: bool = False):
        """Mark proxy as failed with cooldown penalty"""
        self.fail += 1
        self.last_used = time.time()
        base_penalty = SOFT_FAIL_PENALTY_SECONDS if soft else HARD_FAIL_PENALTY_SECONDS
        
        # Scale penalty somewhat by failure count
        scaled = base_penalty * min(MAX_PENALTY_MULTIPLIER, 1 + (self.fail // FAILURE_THRESHOLD))
        self.cooldown_until = max(self.cooldown_until, time.time() + scaled)
    
    def is_available(self) -> bool:
        """Check if proxy is available (not in cooldown)"""
        return time.time() >= self.cooldown_until
    
    def as_requests_proxy(self) -> Dict[str, str]:
        """Convert to requests proxy dictionary"""
        url = f"{self.proto}://{self.host}:{self.port}"
        return {"http": url, "https": url}


# =====================================================================
# PROXY POOL
# =====================================================================
class ProxyPool:
    """Thread-safe proxy pool with health scoring and rotation"""
    
    def __init__(
        self,
        max_size: int = 200,
        min_score: float = 0.25,
        eviction_threshold: float = 0.05
    ):
        self._proxies: List[Proxy] = []
        self._lock = threading.Lock()
        self.max_size = max_size
        self.min_score = min_score
        self.eviction_threshold = eviction_threshold
        self._cursor = 0
        self._sticky_map: Dict[str, Proxy] = {}  # domain -> Proxy
    
    def add_proxy(self, proxy: Proxy):
        """Add a single proxy to the pool"""
        with self._lock:
            if len(self._proxies) < self.max_size:
                self._proxies.append(proxy)
    
    def bulk_add(self, proxies: List[Proxy]):
        """Add multiple proxies to the pool"""
        with self._lock:
            for p in proxies:
                if len(self._proxies) >= self.max_size:
                    break
                self._proxies.append(p)
    
    def _evict_bad(self):
        """Remove low-scoring proxies"""
        before = len(self._proxies)
        self._proxies = [
            p for p in self._proxies
            if p.score >= self.eviction_threshold or (p.success + p.fail) < 5
        ]
        after = len(self._proxies)
        evicted = before - after
        if evicted > 0:
            logger.debug(f"Evicted {evicted} low-score proxies")
    
    def get_next(
        self,
        domain: Optional[str] = None,
        enable_sticky: bool = True
    ) -> Optional[Proxy]:
        """Get next available proxy with optional sticky session"""
        with self._lock:
            self._evict_bad()
            
            # Prefer sticky mapping if still healthy
            if enable_sticky and domain:
                sticky = self._sticky_map.get(domain)
                if sticky and sticky.is_available() and sticky.score >= self.min_score:
                    return sticky
            
            # Healthy, available candidates
            candidates = [
                p for p in self._proxies
                if p.is_available() and p.score >= self.min_score
            ]
            
            if not candidates:
                # Fall back to any available
                candidates = [p for p in self._proxies if p.is_available()]
            
            if not candidates:
                return None
            
            self._cursor = (self._cursor + 1) % len(candidates)
            chosen = candidates[self._cursor]
            
            if enable_sticky and domain:
                self._sticky_map[domain] = chosen
            
            return chosen
    
    def mark_result(
        self,
        proxy: Optional[Proxy],
        success: bool,
        soft_fail: bool = False
    ):
        """Mark proxy result (success or failure)"""
        if proxy is None:
            return
        
        with self._lock:
            if success:
                proxy.mark_success()
            else:
                proxy.mark_fail(soft=soft_fail)
    
    def stats(self) -> Dict[str, Any]:
        """Get pool statistics"""
        with self._lock:
            total = len(self._proxies)
            healthy = len([p for p in self._proxies if p.score >= self.min_score])
            return {
                "total": total,
                "healthy": healthy,
                "min_score": self.min_score,
            }
    
    # DROP-IN INTERFACE HELPERS
    def get_next_proxy_string(self) -> Optional[str]:
        """For legacy systems expecting a 'host:port' string"""
        p = self.get_next()
        if not p:
            return None
        return f"{p.host}:{p.port}"
    
    def get_all_proxies(self) -> List[str]:
        """For systems wanting a snapshot list of 'host:port' strings"""
        with self._lock:
            return [f"{p.host}:{p.port}" for p in self._proxies]


# =====================================================================
# PROXY DISCOVERY (PUBLIC + PROVIDER HOOK)
# =====================================================================
async def _gather_public_proxies(
    limit: int,
    countries: Optional[List[str]]
) -> List[Proxy]:
    """Use proxybroker to gather public proxies"""
    if not PROXYBROKER_AVAILABLE:
        logger.warning("proxybroker not available - skipping public proxy discovery")
        return []
    
    found: List[Proxy] = []
    q = asyncio.Queue()
    
    async def consumer():
        while True:
            p = await q.get()
            if p is None:
                break
            try:
                if not p.host or not p.port:
                    continue
                
                country = getattr(getattr(p, "geo", None), "code", None)
                if countries and country and country not in countries:
                    continue
                
                proto = "http"  # simplify; adjust based on p.types if needed
                proxy_obj = Proxy(
                    host=p.host,
                    port=int(p.port),
                    proto=proto,
                    country=country,
                    source="public"
                )
                found.append(proxy_obj)
                
                if len(found) >= limit:
                    break
            except Exception:
                continue
    
    broker = Broker(queue=q)
    consumer_task = asyncio.create_task(consumer())
    await broker.find(types=["HTTP", "HTTPS"], limit=limit)
    await q.put(None)
    await consumer_task
    
    return found[:limit]


def discover_public_proxies(
    limit: int = 20,
    country: Optional[str] = None
) -> List[Proxy]:
    """Discover public proxies (requires proxybroker)"""
    countries = [country] if country else None
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        proxies = loop.run_until_complete(
            _gather_public_proxies(limit, countries)
        )
        loop.close()
        logger.info(f"Discovered {len(proxies)} public proxies")
        return proxies
    except Exception as e:
        logger.error(f"Error discovering public proxies: {e}")
        return []


def integrate_provider_proxies(
    api_result: List[Dict[str, Any]]
) -> List[Proxy]:
    """
    Transform provider API results into Proxy objects.
    
    Expected format:
        {
            "ip": "1.2.3.4",
            "port": 8000,
            "protocol": "http",
            "country": "US",
            "source": "my_provider"
        }
    """
    out: List[Proxy] = []
    for item in api_result:
        try:
            out.append(
                Proxy(
                    host=item["ip"],
                    port=int(item["port"]),
                    proto=item.get("protocol", "http"),
                    country=item.get("country"),
                    source=item.get("source", "provider"),
                )
            )
        except Exception:
            continue
    return out


# =====================================================================
# STEALTH SESSION (REQUEST LAYER)
# =====================================================================
class StealthSession:
    """High-level, stealth-aware HTTP client with proxy rotation"""
    
    def __init__(
        self,
        proxy_pool: ProxyPool,
        base_timeout: int = 15,
        max_retries_per_request: int = 6,
        per_domain_delay: Tuple[float, float] = (1.0, 4.0),
    ):
        self.proxy_pool = proxy_pool
        self.timeout = base_timeout
        self.max_retries = max_retries_per_request
        self.per_domain_delay = per_domain_delay
        self._domain_last_req: Dict[str, float] = {}
        self._lock = threading.Lock()
    
    def _respect_rate_limit(self, domain: str):
        """Basic per-domain delay (anti-hammering, human-like)"""
        if not domain:
            return
        
        with self._lock:
            last = self._domain_last_req.get(domain, 0.0)
            now = time.time()
            min_d, max_d = self.per_domain_delay
            gap = random.uniform(min_d, max_d)
            
            if now - last < gap:
                time.sleep(max(0.05, gap - (now - last)))
            
            self._domain_last_req[domain] = time.time()
    
    def _looks_blocked(self, resp: requests.Response) -> bool:
        """Detect soft blocks / captcha pages"""
        if resp.status_code in SOFT_STATUS_CODES:
            return True
        
        text = (resp.text or "")[:4096].lower()
        return any(pat in text for pat in BLOCK_PATTERNS)
    
    def _request_once(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> Tuple[Optional[requests.Response], Optional[Proxy]]:
        """Single request attempt with proxy"""
        parsed = urlparse(url)
        domain = parsed.netloc
        
        # Per-domain pacing
        self._respect_rate_limit(domain)
        
        proxy = self.proxy_pool.get_next(domain=domain, enable_sticky=True)
        if not proxy:
            logger.warning("No available proxies in pool")
            return None, None
        
        is_mobile = ("m." in domain) or (random.random() < 0.25)
        referer = kwargs.pop("referer", None)
        extra_headers = kwargs.pop("headers", {})
        
        headers = random_headers(
            is_mobile=is_mobile,
            referer=referer,
            extra=extra_headers
        )
        
        proxies_dict = proxy.as_requests_proxy()
        allow_redirects = kwargs.pop("allow_redirects", True)
        timeout = kwargs.pop("timeout", self.timeout)
        
        try:
            resp = requests.request(
                method=method.upper(),
                url=url,
                headers=headers,
                proxies=proxies_dict,
                timeout=timeout,
                allow_redirects=allow_redirects,
                **kwargs
            )
            
            if 200 <= resp.status_code < 300:
                if self._looks_blocked(resp):
                    logger.info(f"Soft-block detected via {proxy}")
                    self.proxy_pool.mark_result(proxy, False, soft_fail=True)
                    return None, proxy
                
                self.proxy_pool.mark_result(proxy, True)
                return resp, proxy
            
            if resp.status_code in SOFT_STATUS_CODES:
                logger.info(f"Soft/block HTTP {resp.status_code} via {proxy}")
                self.proxy_pool.mark_result(proxy, False, soft_fail=True)
                return None, proxy
            
            if 300 <= resp.status_code < 400:
                # Redirects: neutral/soft success
                self.proxy_pool.mark_result(proxy, True)
                return resp, proxy
            
            # Unexpected (4xx/5xx): degrade proxy softly
            logger.debug(f"Unexpected status {resp.status_code} via {proxy}")
            self.proxy_pool.mark_result(proxy, False, soft_fail=True)
            return None, proxy
        
        except (requests.Timeout, requests.ConnectionError) as e:
            logger.debug(f"Network error via {proxy}: {e}")
            self.proxy_pool.mark_result(proxy, False, soft_fail=True)
            return None, proxy
        
        except requests.RequestException as e:
            logger.debug(f"Request error via {proxy}: {e}")
            self.proxy_pool.mark_result(proxy, False, soft_fail=False)
            return None, proxy
    
    def request(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> Optional[requests.Response]:
        """Make request with automatic retry and proxy rotation"""
        for attempt in range(1, self.max_retries + 1):
            human_delay(0.3, 1.8)  # attempt-level jitter
            
            resp, proxy = self._request_once(method, url, **kwargs)
            if resp is not None:
                logger.info(
                    f"{method.upper()} {url} success on attempt {attempt} via {proxy}"
                )
                return resp
            
            logger.debug(
                f"{method.upper()} {url} attempt {attempt} failed, rotating proxy"
            )
        
        logger.error(f"All {self.max_retries} attempts failed for {url}")
        return None
    
    def get(self, url: str, **kwargs) -> Optional[requests.Response]:
        """HTTP GET request"""
        return self.request("GET", url, **kwargs)
    
    def post(self, url: str, **kwargs) -> Optional[requests.Response]:
        """HTTP POST request"""
        return self.request("POST", url, **kwargs)


# =====================================================================
# REPORTING AND PUBLIC DROP-IN FUNCTIONS
# =====================================================================
def generate_report(proxy_pool: ProxyPool) -> str:
    """Generate proxy pool status report"""
    stats = proxy_pool.stats()
    return (
        "Proxy Pool Report\n"
        f"- Total proxies: {stats['total']}\n"
        f"- Healthy (score >= {stats['min_score']}): {stats['healthy']}\n"
    )


def generate_proxies_on_demand(
    country: Optional[str] = None,
    limit: int = 30,
    provider_data: Optional[List[Dict[str, Any]]] = None,
) -> ProxyPool:
    """
    MONOLITHIC ENTRYPOINT: Build and return a ProxyPool.
    
    Args:
        country: Desired country code for public proxies (best-effort)
        limit: Baseline size; pool can hold up to ~3x this
        provider_data: List of proxies from provider API (recommended)
    
    Returns:
        ProxyPool: Ready-to-use proxy pool
    """
    pool = ProxyPool(max_size=limit * 3, min_score=0.25)
    
    # 1. Provider-supplied proxies (preferred for quality/residential)
    if provider_data:
        provider_proxies = integrate_provider_proxies(provider_data)
        pool.bulk_add(provider_proxies)
        logger.info(f"Integrated {len(provider_proxies)} provider proxies")
    
    # 2. Public proxies as supplemental/fallback
    remaining = max(0, limit - (len(provider_data) if provider_data else 0))
    if remaining > 0 and PROXYBROKER_AVAILABLE:
        public_proxies = discover_public_proxies(
            limit=remaining,
            country=country
        )
        pool.bulk_add(public_proxies)
    
    logger.info(generate_report(pool))
    return pool


def get_stealth_session(
    country: Optional[str] = None,
    limit: int = 30,
    provider_data: Optional[List[Dict[str, Any]]] = None,
    base_timeout: int = 15,
    max_retries_per_request: int = 6,
    per_domain_delay: Tuple[float, float] = (1.0, 4.0),
) -> StealthSession:
    """
    DROP-IN HELPER: Directly returns a StealthSession with a ready ProxyPool.
    
    This is the main entry point for most users.
    
    Args:
        country: Country code for public proxies (e.g., "US")
        limit: Number of proxies to discover/use
        provider_data: List of provider proxies (recommended)
        base_timeout: Request timeout in seconds
        max_retries_per_request: Max retry attempts per request
        per_domain_delay: (min, max) delay between requests to same domain
    
    Returns:
        StealthSession: Ready-to-use stealth HTTP session
    """
    pool = generate_proxies_on_demand(
        country=country,
        limit=limit,
        provider_data=provider_data,
    )
    
    return StealthSession(
        proxy_pool=pool,
        base_timeout=base_timeout,
        max_retries_per_request=max_retries_per_request,
        per_domain_delay=per_domain_delay,
    )


def get_next_proxy(pool: ProxyPool) -> Optional[str]:
    """DROP-IN: Return 'host:port' of next proxy for legacy systems"""
    return pool.get_next_proxy_string()


def get_proxies_report(pool: ProxyPool) -> str:
    """DROP-IN: Return textual report for logging / monitoring"""
    return generate_report(pool)


# =====================================================================
# OPTIONAL DEMO (SAFE TO LEAVE; IGNORE IF USING AS LIB)
# =====================================================================
if __name__ == "__main__":
    # Example: monolithic drop-in behavior
    target_url = "https://www.google.com"
    
    # If you have provider proxies, pass them as:
    # provider_data = [
    #     {"ip": "x.x.x.x", "port": 1234, "protocol": "http", 
    #      "country": "US", "source": "my_residential"}
    # ]
    provider_data = None
    
    session = get_stealth_session(
        country="US",
        limit=15,
        provider_data=provider_data,
        base_timeout=12,
        max_retries_per_request=6,
        per_domain_delay=(1.0, 3.5),
    )
    
    resp = session.get(target_url)
    if resp and resp.status_code == 200:
        logger.info("Successfully retrieved content via stealth session.")
        print(resp.text[:800])
    else:
        logger.error("Failed to retrieve content with available proxies.")
