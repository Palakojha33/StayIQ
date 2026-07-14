import sys
from pathlib import Path

# Append root backend folder to path so Vercel runtime resolves imports for the 'app' module
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.main import app
from mangum import Mangum

# Wrap FastAPI app with Mangum to adapt ASGI requests for Vercel Serverless (AWS Lambda)
handler = Mangum(app)
