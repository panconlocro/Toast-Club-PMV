from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.v1 import sessions, recordings, surveys, auth, dataset, texts
from .db.session import SessionLocal
from .db.init_db import init_db

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Toast Club PMV - VR Communication Training Platform API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(sessions.router, prefix=settings.API_V1_STR, tags=["sessions"])
app.include_router(recordings.router, prefix=settings.API_V1_STR, tags=["recordings"])
app.include_router(surveys.router, prefix=settings.API_V1_STR, tags=["surveys"])
app.include_router(dataset.router, prefix=settings.API_V1_STR, tags=["dataset"])
app.include_router(texts.router, prefix=settings.API_V1_STR, tags=["texts"])


@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Toast Club PMV API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
