import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cancellation_router, review_router, recommend_router, price_router, recovery_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="StayIQ API",
        description="AI-Powered Hospitality Intelligence Platform API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS configuration
    cors_origins = os.getenv("CORS_ORIGINS", "*")
    origins = [origin.strip() for origin in cors_origins.split(",")]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers under /api prefix for Vercel/endpoint uniformity
    # Note: vercel.json routes /api/(.*) -> index.py. The ASGI app itself can mount routers on /api or directly.
    # To support both routes having /api and not having /api (e.g. if we test uvicorn directly on /predict or /api/predict),
    # we can register routers directly, but wrap index.py or mount them nicely.
    # Mounting on api_app or registry with prefix="/api" ensures it aligns with Vercel serverless /api prefix.
    
    # We will register them with '/api' prefix so they match the Vercel serverless rewrites and keep consistency.
    api_prefix = "/api"
    app.include_router(cancellation_router, prefix=api_prefix)
    app.include_router(review_router, prefix=api_prefix)
    app.include_router(recommend_router, prefix=api_prefix)
    app.include_router(price_router, prefix=api_prefix)
    app.include_router(recovery_router, prefix=api_prefix)

    @app.get("/")
    def read_root():
        return {
            "name": "StayIQ Hospitality Intelligence API",
            "status": "healthy",
            "version": "1.0.0",
            "endpoints": {
                "cancellation_predict": "/api/predict/cancellation",
                "sentiment_analyze": "/api/analyze/review",
                "hotel_recommend": "/api/recommend",
                "pricing_predict": "/api/predict/price",
                "recovery_copilot": "/api/recovery",
                "docs": "/docs"
            }
        }

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}

    return app

app = create_app()
