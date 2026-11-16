import re
import urllib.parse
from typing import Tuple, Optional

BLOCKED_HOSTS = {
    "localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"
}

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".csv", ".json", ".log"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit
MAX_TEXT_LENGTH = 50000

def validate_text_input(text: str) -> Tuple[bool, Optional[str]]:
    """Validate submitted text for scans."""
    if not text or not text.strip():
        return False, "Input text cannot be empty."
    if len(text) > MAX_TEXT_LENGTH:
        return False, f"Input text exceeds maximum allowed size of {MAX_TEXT_LENGTH} characters."
    return True, None

def validate_url_safety(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that a URL is structurally valid and does not attempt internal network SSRF.
    """
    if not url or not url.strip():
        return False, "URL cannot be empty."
    
    clean_u = url.strip()
    if not clean_u.startswith(("http://", "https://")):
        clean_u = "http://" + clean_u

    try:
        parsed = urllib.parse.urlparse(clean_u)
        hostname = (parsed.hostname or "").lower()
        if not hostname:
            return False, "Invalid URL host."
        if hostname in BLOCKED_HOSTS or hostname.startswith("10.") or hostname.startswith("192.168.") or hostname.startswith("172.16."):
            return False, "Access to private or local network hosts is strictly prohibited."
        return True, None
    except Exception as e:
        return False, f"Malformed URL: {str(e)}"

def validate_uploaded_file(filename: str, file_size: int) -> Tuple[bool, Optional[str]]:
    """Validate uploaded document extensions and file sizes."""
    if file_size > MAX_FILE_SIZE_BYTES:
        return False, f"File size exceeds maximum permitted limit of {MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
    
    dot_idx = filename.rfind(".")
    if dot_idx == -1:
        return False, "Uploaded file lacks a valid file extension."
    
    ext = filename[dot_idx:].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
    
    return True, None
