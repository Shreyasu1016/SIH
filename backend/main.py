from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base, check_db_connection
from app.routers.search import router as search_router

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ProcurePro API",
    description="Backend API for ProcurePro - Smart Procurement & Standards Platform",
    version="0.1.0"
)

# Enable CORS for frontend development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(search_router)


@app.get("/")
def read_root():
    return {
        "service": "ProcurePro API",
        "version": "0.1.0",
        "docs_url": "/docs",
        "health_url": "/health"
    }


@app.get("/health")
def health_check():
    """Health check endpoint confirming API and Database status."""
    db_status = check_db_connection()
    return {
        "status": "ok",
        "service": "ProcurePro API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_status
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
