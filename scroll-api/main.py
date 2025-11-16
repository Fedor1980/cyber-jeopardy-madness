"""
Sovereign Scroll API
REST API for querying validated, consented scrolls from Qdrant.
"""
from fastapi import FastAPI, HTTPException, Security, Depends, status
from fastapi.security import APIKeyHeader
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

# Configuration
QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
QDRANT_PORT = int(os.getenv('QDRANT_PORT', '6333'))
COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'scrolls')
API_KEY = os.getenv('API_KEY', 'sovereign-scroll-key-2024')

# FastAPI app
app = FastAPI(
    title="Sovereign Scroll API",
    description="Query validated and consented scrolls with policy enforcement",
    version="1.0.0"
)

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

@app.get("/", tags=["Info"])
async def root():
    """API info endpoint."""
    return {
        "name": "Sovereign Scroll API",
        "version": "1.0.0",
        "description": "Query validated and consented scrolls",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "list_scrolls": "/api/scrolls",
            "get_scroll": "/api/scrolls/{scroll_id}",
            "search": "/api/scrolls/search"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
