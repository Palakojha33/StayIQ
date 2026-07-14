import os
import sys
from pathlib import Path
import uvicorn

# Append parent dir to path if run directly as "python app/main_server.py"
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Load .env file manually if python-dotenv is not installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.strip() and not line.startswith("#") and "=" in line:
                    key, val = line.strip().split("=", 1)
                    os.environ[key] = val

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    # Print configuration details
    standalone_mode = os.getenv("STANDALONE_MODE", "0")
    print("=" * 60)
    print(f"Starting StayIQ Standalone API Server on http://{host}:{port}")
    print(f"STANDALONE_MODE: {standalone_mode} (1=Heavy Models Loaded, 0=Mock/Lightweight Fallback)")
    print("=" * 60)
    
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
