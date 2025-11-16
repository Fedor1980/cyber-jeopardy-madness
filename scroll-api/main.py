"""
Sovereign Scroll API
REST API for querying validated, consented scrolls from Qdrant.
"""
from fastapi import FastAPI, HTTPException, Security, Depends, status, Request
from fastapi.security import APIKeyHeader
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import requests
import time
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from metrics import (
    get_metrics,
    scrolls_stored_total,
    scrolls_retrieved_total,
    scrolls_search_total,
    rag_questions_total,
    rag_question_duration_seconds,
    rag_context_scrolls,
    qdrant_operations_total,
    qdrant_operation_duration_seconds,
    embedding_requests_total,
    embedding_request_duration_seconds,
    openai_requests_total,
    openai_request_duration_seconds,
    openai_tokens_used,
    errors_total,
    http_requests_total,
    http_request_duration_seconds,
    active_connections
)

# Configuration
QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
QDRANT_PORT = int(os.getenv('QDRANT_PORT', '6333'))
COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'scrolls')
API_KEY = os.getenv('API_KEY', 'sovereign-scroll-key-2024')
EMBEDDING_SERVICE_URL = os.getenv('EMBEDDING_SERVICE_URL', 'http://localhost:8001')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# FastAPI app
app = FastAPI(
    title="Sovereign Scroll API",
    description="Query validated and consented scrolls with policy enforcement",
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

# API Key Security
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(api_key: str = Security(api_key_header)):
    """Verify API key authentication."""
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return api_key

# Pydantic Models
class ScrollResponse(BaseModel):
    """Response model for a scroll."""
    uuid: str = Field(..., description="Qdrant point UUID")
    scroll_id: str = Field(..., description="Original scroll ID")
    content: str = Field(..., description="Scroll content")
    source_system: str = Field(..., description="Source system name")
    consent_id: str = Field(..., description="DLT consent record ID")

class ScrollListResponse(BaseModel):
    """Response model for list of scrolls."""
    total: int = Field(..., description="Total number of scrolls")
    scrolls: List[ScrollResponse] = Field(..., description="List of scrolls")

class SearchRequest(BaseModel):
    """Request model for scroll search."""
    source_system: Optional[str] = Field(None, description="Filter by source system")
    limit: int = Field(10, ge=1, le=100, description="Maximum results to return")

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    qdrant_connected: bool
    collection_exists: bool
    total_scrolls: int

class SemanticSearchRequest(BaseModel):
    """Request model for semantic search."""
    query: str = Field(..., description="Natural language search query")
    limit: int = Field(5, ge=1, le=20, description="Number of results")
    score_threshold: float = Field(0.7, ge=0.0, le=1.0, description="Minimum similarity score")

class ScrollWithScore(BaseModel):
    """Scroll response with similarity score."""
    uuid: str
    scroll_id: str
    content: str
    source_system: str
    consent_id: str
    similarity_score: float = Field(..., description="Semantic similarity (0-1)")

class SemanticSearchResponse(BaseModel):
    """Response for semantic search."""
    query: str
    results: List[ScrollWithScore]
    total: int

class RAGRequest(BaseModel):
    """Request model for RAG question answering."""
    question: str = Field(..., description="Question to answer")
    max_context_scrolls: int = Field(3, ge=1, le=10, description="Max scrolls for context")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="LLM temperature")

class RAGResponse(BaseModel):
    """Response for RAG question answering."""
    question: str
    answer: str
    sources: List[ScrollResponse]
    confidence: str

# Qdrant Client
def get_qdrant_client():
    """Get Qdrant client instance."""
    return QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# API Endpoints

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Returns API status and Qdrant connection info.
    """
    try:
        client = get_qdrant_client()
        collection_info = client.get_collection(collection_name=COLLECTION_NAME)

        return HealthResponse(
            status="healthy",
            qdrant_connected=True,
            collection_exists=True,
            total_scrolls=collection_info.points_count
        )
    except Exception as e:
        return HealthResponse(
            status="degraded",
            qdrant_connected=False,
            collection_exists=False,
            total_scrolls=0
        )


@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """
    Prometheus metrics endpoint.
    Returns metrics in Prometheus exposition format.
    """
    return get_metrics()

@app.get("/api/scrolls", response_model=ScrollListResponse, tags=["Scrolls"])
async def list_scrolls(
    limit: int = 10,
    api_key: str = Depends(verify_api_key)
):
    """
    List all scrolls.
    Requires API key authentication.
    """
    try:
        client = get_qdrant_client()

        # Scroll through points
        result = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=limit,
            with_payload=True,
            with_vectors=False
        )

        scrolls = []
        for point in result[0]:
            scrolls.append(ScrollResponse(
                uuid=str(point.id),
                scroll_id=point.payload['scroll_id'],
                content=point.payload['content'],
                source_system=point.payload['source_system'],
                consent_id=point.payload['consent_id']
            ))

        return ScrollListResponse(
            total=len(scrolls),
            scrolls=scrolls
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching scrolls: {str(e)}"
        )

@app.get("/api/scrolls/{scroll_id}", response_model=ScrollResponse, tags=["Scrolls"])
async def get_scroll(
    scroll_id: str,
    api_key: str = Depends(verify_api_key)
):
    """
    Get a specific scroll by scroll_id.
    Requires API key authentication.
    """
    try:
        client = get_qdrant_client()

        # Search by scroll_id in payload
        result = client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="scroll_id",
                        match=MatchValue(value=scroll_id)
                    )
                ]
            ),
            limit=1,
            with_payload=True,
            with_vectors=False
        )

        points = result[0]

        if not points:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scroll '{scroll_id}' not found"
            )

        point = points[0]
        return ScrollResponse(
            uuid=str(point.id),
            scroll_id=point.payload['scroll_id'],
            content=point.payload['content'],
            source_system=point.payload['source_system'],
            consent_id=point.payload['consent_id']
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching scroll: {str(e)}"
        )

@app.post("/api/scrolls/search", response_model=ScrollListResponse, tags=["Scrolls"])
async def search_scrolls(
    search: SearchRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Search scrolls by criteria.
    Currently supports filtering by source_system.
    Requires API key authentication.
    """
    try:
        client = get_qdrant_client()

        # Build filter
        scroll_filter = None
        if search.source_system:
            scroll_filter = Filter(
                must=[
                    FieldCondition(
                        key="source_system",
                        match=MatchValue(value=search.source_system)
                    )
                ]
            )

        # Execute search
        result = client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=scroll_filter,
            limit=search.limit,
            with_payload=True,
            with_vectors=False
        )

        scrolls = []
        for point in result[0]:
            scrolls.append(ScrollResponse(
                uuid=str(point.id),
                scroll_id=point.payload['scroll_id'],
                content=point.payload['content'],
                source_system=point.payload['source_system'],
                consent_id=point.payload['consent_id']
            ))

        return ScrollListResponse(
            total=len(scrolls),
            scrolls=scrolls
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching scrolls: {str(e)}"
        )

@app.post("/api/scrolls/semantic-search", response_model=SemanticSearchResponse, tags=["Semantic Search"])
async def semantic_search(
    search: SemanticSearchRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Semantic search using natural language queries.
    Finds scrolls by meaning, not just keywords.
    """
    try:
        from semantic_search import generate_query_embedding

        # Generate embedding for query
        query_embedding = generate_query_embedding(search.query)

        # Search Qdrant with vector similarity
        client = get_qdrant_client()
        search_result = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=search.limit,
            score_threshold=search.score_threshold
        )

        # Build results
        results = []
        for scored_point in search_result:
            results.append(ScrollWithScore(
                uuid=str(scored_point.id),
                scroll_id=scored_point.payload['scroll_id'],
                content=scored_point.payload['content'],
                source_system=scored_point.payload['source_system'],
                consent_id=scored_point.payload['consent_id'],
                similarity_score=scored_point.score
            ))

        return SemanticSearchResponse(
            query=search.query,
            results=results,
            total=len(results)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in semantic search: {str(e)}"
        )


@app.post("/api/scrolls/ask", response_model=RAGResponse, tags=["RAG"])
async def ask_question(
    request: RAGRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Ask a question and get an answer using RAG (Retrieval-Augmented Generation).
    Retrieves relevant scrolls and uses LLM to generate answer.
    """
    try:
        from semantic_search import generate_query_embedding, generate_rag_answer

        # 1. Generate embedding for question
        question_embedding = generate_query_embedding(request.question)

        # 2. Retrieve relevant scrolls
        client = get_qdrant_client()
        search_result = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=question_embedding,
            limit=request.max_context_scrolls,
            score_threshold=0.6
        )

        if not search_result:
            return RAGResponse(
                question=request.question,
                answer="I don't have enough information in the consented scrolls to answer this question.",
                sources=[],
                confidence="low"
            )

        # 3. Build context from retrieved scrolls
        context_scrolls = []
        sources = []
        for scored_point in search_result:
            context_scrolls.append({
                'content': scored_point.payload['content'],
                'source_system': scored_point.payload['source_system']
            })
            sources.append(ScrollResponse(
                uuid=str(scored_point.id),
                scroll_id=scored_point.payload['scroll_id'],
                content=scored_point.payload['content'],
                source_system=scored_point.payload['source_system'],
                consent_id=scored_point.payload['consent_id']
            ))

        # 4. Generate answer using LLM
        answer, confidence = generate_rag_answer(
            request.question,
            context_scrolls,
            request.temperature
        )

        return RAGResponse(
            question=request.question,
            answer=answer,
            sources=sources,
            confidence=confidence
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating answer: {str(e)}"
        )


@app.get("/", tags=["Info"])
async def root():
    """API info endpoint."""
    return {
        "name": "Sovereign Scroll API",
        "version": "2.0.0",
        "description": "Query validated and consented scrolls with semantic search and RAG",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "list_scrolls": "/api/scrolls",
            "get_scroll": "/api/scrolls/{scroll_id}",
            "search": "/api/scrolls/search",
            "semantic_search": "/api/scrolls/semantic-search",
            "ask": "/api/scrolls/ask"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
