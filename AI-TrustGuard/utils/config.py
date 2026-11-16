import os
from pathlib import Path
from pydantic import BaseModel

# Base directory for AI-TrustGuard
BASE_DIR = Path(__file__).resolve().parent.parent

# Database config
DATABASE_PATH = BASE_DIR / "database" / "trustguard.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH.as_posix()}")

# Security & Auth config
SECRET_KEY = os.getenv("SECRET_KEY", "ai-trustguard-hackathon-super-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Model Storage
MODELS_DIR = BASE_DIR / "models" / "saved_models"
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports" / "generated"

# Ensure runtime directories exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
(DATA_DIR / "raw").mkdir(parents=True, exist_ok=True)
(DATA_DIR / "processed").mkdir(parents=True, exist_ok=True)
(DATA_DIR / "samples").mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
(BASE_DIR / "database").mkdir(parents=True, exist_ok=True)

# API Server config
API_HOST = os.getenv("API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("API_PORT", "8000"))
API_URL = os.getenv("API_URL", f"http://{API_HOST}:{API_PORT}")

# Rate Limiting
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

# Risk Engine Default Weights (Formula: R = 0.50S + 0.30P + 0.20U)
DEFAULT_WEIGHT_SECURITY = 0.50
DEFAULT_WEIGHT_PRIVACY = 0.30
DEFAULT_WEIGHT_UNCERTAINTY = 0.20
