"""
Main FastAPI application for Toast Club PMV
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import sessions, users, recordings, surveys

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para Toast Club - Plataforma de comunicación VR",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sessions.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(recordings.router, prefix=settings.API_PREFIX)
app.include_router(surveys.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}
