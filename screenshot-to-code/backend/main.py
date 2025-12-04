# Load environment variables first
from dotenv import load_dotenv
from pathlib import Path

# Load project root .env (if running from repo root) and backend/.env explicitly
load_dotenv()
load_dotenv(dotenv_path=Path(__file__).parent / ".env")


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import screenshot, generate_code, home, evals, rest_generate

app = FastAPI(openapi_url=None, docs_url=None, redoc_url=None)

# Configure CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add routes
app.include_router(generate_code.router)
app.include_router(screenshot.router)
app.include_router(home.router)
app.include_router(evals.router)
app.include_router(rest_generate.router)
