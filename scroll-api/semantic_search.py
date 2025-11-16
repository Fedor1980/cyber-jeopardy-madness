"""
Semantic Search and RAG utilities for Sovereign Scroll API.
"""
import requests
from typing import List, Optional
import os

EMBEDDING_SERVICE_URL = os.getenv('EMBEDDING_SERVICE_URL', 'http://localhost:8001')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

def generate_query_embedding(query: str) -> List[float]:
    """
    Generate embedding for search query.
    """
    try:
        response = requests.post(
            f"{EMBEDDING_SERVICE_URL}/embed",
            json={"text": query},
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            return result['embedding']
        else:
            raise Exception(f"Embedding service returned {response.status_code}")

    except Exception as e:
        raise Exception(f"Error generating query embedding: {e}")


def generate_rag_answer(question: str, context_scrolls: List[dict], temperature: float = 0.7) -> tuple:
    """
    Generate answer using OpenAI GPT with retrieved context.
    Returns (answer, confidence)
    """
    if not OPENAI_API_KEY:
        return ("RAG is not configured. Please set OPENAI_API_KEY environment variable.", "low")

    try:
        # Build context from scrolls
        context = "\n\n".join([
            f"Document {i+1} (Source: {scroll['source_system']}):\n{scroll['content']}"
            for i, scroll in enumerate(context_scrolls)
        ])

        # Call OpenAI API
        import openai
        openai.api_key = OPENAI_API_KEY

        system_prompt = """You are a helpful assistant answering questions based ONLY on the provided documents.
These documents have been validated for schema compliance and consent verification.
If the answer is not in the documents, say so. Always cite which document you're referencing."""

        user_prompt = f"""Context Documents:
{context}

Question: {question}

Answer based only on the above documents:"""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature,
            max_tokens=500
        )

        answer = response.choices[0].message.content

        # Determine confidence based on response
        if "not" in answer.lower() and ("mentioned" in answer.lower() or "provided" in answer.lower()):
            confidence = "low"
        elif len(context_scrolls) >= 2:
            confidence = "high"
        else:
            confidence = "medium"

        return (answer, confidence)

    except Exception as e:
        return (f"Error generating answer: {str(e)}", "low")
