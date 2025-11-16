"""
Embedding Service
Generates semantic embeddings for text using sentence-transformers.
"""
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List
from sentence_transformers import SentenceTransformer
import logging
import time
from metrics import (
    get_metrics,
    embeddings_generated_total,
    embedding_generation_duration_seconds,
    embedding_text_length_characters,
    model_loaded,
    batch_processing_size,
    http_requests_total,
    http_request_duration_seconds,
    active_connections,
    errors_total
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Embedding Service",
    description="Generate semantic embeddings for text",
    version="2.0.0"
)

# Middleware for metrics
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Track HTTP request metrics"""
    active_connections.inc()
    start_time = time.time()

    try:
        response = await call_next(request)

        # Record metrics
        duration = time.time() - start_time
        http_requests_total.labels(
            method=request.method,
            endpoint=request.url.path,
            status_code=response.status_code
        ).inc()

        http_request_duration_seconds.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)

        return response

    except Exception as e:
        errors_total.labels(error_type=type(e).__name__).inc()
        raise

    finally:
        active_connections.dec()

# Load model (all-MiniLM-L6-v2: 384 dimensions, fast, good quality)
logger.info("Loading sentence-transformers model...")
start_load = time.time()
model = SentenceTransformer('all-MiniLM-L6-v2')
load_duration = time.time() - start_load
logger.info(f"Model loaded successfully in {load_duration:.2f}s")
model_loaded.set(1)

# Request/Response Models
class EmbeddingRequest(BaseModel):
    """Request model for generating embeddings."""
    text: str = Field(..., description="Text to embed")

class BatchEmbeddingRequest(BaseModel):
    """Request model for batch embeddings."""
    texts: List[str] = Field(..., description="List of texts to embed")

class EmbeddingResponse(BaseModel):
    """Response model for single embedding."""
    embedding: List[float] = Field(..., description="384-dimensional embedding vector")
    dimensions: int = Field(..., description="Number of dimensions")

class BatchEmbeddingResponse(BaseModel):
    """Response model for batch embeddings."""
    embeddings: List[List[float]] = Field(..., description="List of embedding vectors")
    count: int = Field(..., description="Number of embeddings")
    dimensions: int = Field(..., description="Number of dimensions per embedding")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model": "all-MiniLM-L6-v2",
        "dimensions": 384
    }


@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """
    Prometheus metrics endpoint.
    Returns metrics in Prometheus exposition format.
    """
    return get_metrics()


@app.post("/embed", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """
    Generate embedding for a single text.
    """
    try:
        # Track text length
        embedding_text_length_characters.observe(len(request.text))

        # Generate embedding with timing
        start_time = time.time()
        embedding = model.encode(request.text).tolist()
        duration = time.time() - start_time

        # Record metrics
        embeddings_generated_total.inc()
        embedding_generation_duration_seconds.observe(duration)

        return EmbeddingResponse(
            embedding=embedding,
            dimensions=len(embedding)
        )
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        errors_total.labels(error_type=type(e).__name__).inc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed/batch", response_model=BatchEmbeddingResponse)
async def generate_batch_embeddings(request: BatchEmbeddingRequest):
    """
    Generate embeddings for multiple texts.
    """
    try:
        # Track batch size
        batch_processing_size.observe(len(request.texts))

        # Generate embeddings with timing
        start_time = time.time()
        embeddings = model.encode(request.texts).tolist()
        duration = time.time() - start_time

        # Record metrics
        embeddings_generated_total.inc(len(embeddings))
        embedding_generation_duration_seconds.observe(duration)

        return BatchEmbeddingResponse(
            embeddings=embeddings,
            count=len(embeddings),
            dimensions=len(embeddings[0]) if embeddings else 0
        )
    except Exception as e:
        logger.error(f"Error generating batch embeddings: {e}")
        errors_total.labels(error_type=type(e).__name__).inc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """API info endpoint."""
    return {
        "name": "Embedding Service",
        "version": "1.0.0",
        "model": "all-MiniLM-L6-v2",
        "dimensions": 384,
        "endpoints": {
            "health": "/health",
            "single_embed": "/embed",
            "batch_embed": "/embed/batch"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
