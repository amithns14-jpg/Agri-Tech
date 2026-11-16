import re
import html
import urllib.parse
from typing import Dict, Any, List

SUSPICIOUS_KEYWORDS = [
    "urgent", "act now", "immediate", "verify your account", "suspended",
    "unauthorized", "login", "password", "bank", "credit card", "winner",
    "won", "lottery", "claim", "free", "gift card", "reward", "click here",
    "wire transfer", "kyc", "otp", "aadhaar", "pan card", "tax refund"
]

KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "buff.ly", "ow.ly",
    "cutt.ly", "rb.gy", "tiny.cc", "shorte.st"
}

def clean_html(raw_html: str) -> str:
    """Strip HTML tags and unescape entities safely."""
    if not raw_html:
        return ""
    clean_r = re.compile(r"<.*?>")
    text = re.sub(clean_r, " ", raw_html)
    return html.unescape(text)

def clean_text(text: str) -> str:
    """Preprocess and normalize text for NLP and ML models."""
    if not text:
        return ""
    text = clean_html(text)
    # Remove redundant whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_suspicious_phrases(text: str) -> List[str]:
    """Identify flagged security/phishing keywords present in input."""
    text_lower = text.lower()
    found = []
    for kw in SUSPICIOUS_KEYWORDS:
        if kw in text_lower:
            found.append(kw)
    return found

def extract_url_features(url: str) -> Dict[str, Any]:
    """
    Safely extract lexical and syntactic features from a URL without performing network requests.
    Prevents SSRF and malicious redirection.
    """
    if not url:
        return {}

    parsed = urllib.parse.urlparse(url if "://" in url else f"http://{url}")
    hostname = parsed.hostname or ""
    path = parsed.path or ""

    # Check for IP address in host
    is_ip = bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", hostname))
    
    # Subdomain count
    host_parts = hostname.split(".")
    num_subdomains = max(0, len(host_parts) - 2) if not is_ip else 0

    # Shortener check
    is_shortened = hostname.lower() in KNOWN_SHORTENERS

    # Suspicious character counts
    num_dots = url.count(".")
    num_hyphens = url.count("-")
    num_at = url.count("@")
    num_question = url.count("?")
    num_percent = url.count("%")
    has_https = 1 if parsed.scheme == "https" else 0

    # Suspicious lexical patterns in URL
    suspicious_url_terms = ["secure", "login", "account", "update", "verify", "banking", "signin", "wallet"]
    has_suspicious_term = any(term in url.lower() for term in suspicious_url_terms)

    return {
        "url_length": len(url),
        "domain_length": len(hostname),
        "path_length": len(path),
        "num_subdomains": num_subdomains,
        "is_ip_address": 1 if is_ip else 0,
        "is_shortened": 1 if is_shortened else 0,
        "has_https": has_https,
        "num_dots": num_dots,
        "num_hyphens": num_hyphens,
        "num_at": num_at,
        "num_question": num_question,
        "num_percent": num_percent,
        "has_suspicious_term": 1 if has_suspicious_term else 0,
    }
