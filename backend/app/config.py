import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
base_dir = Path(__file__).resolve().parent.parent
load_dotenv(base_dir / ".env")

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretjwtkey_skillgap_production_2026_career_intel")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillgap.db")
    
    # OAuth Configurations
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # Optional LLM
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
