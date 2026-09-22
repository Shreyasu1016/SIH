"""Embeddings module for ProcurePro BIS Standards recommendation engine.

Uses the multilingual model "paraphrase-multilingual-mpnet-base-v2" to generate
L2-normalized semantic vector embeddings for standards and queries.
"""

from typing import List, Union
import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_NAME = "paraphrase-multilingual-mpnet-base-v2"
_model_instance: Union[SentenceTransformer, None] = None


def get_embedding_model() -> SentenceTransformer:
    """Lazy-load and cache the SentenceTransformer model singleton."""
    global _model_instance
    if _model_instance is None:
        print(f"Loading embedding model '{MODEL_NAME}'...")
        _model_instance = SentenceTransformer(MODEL_NAME)
        print(f"Model '{MODEL_NAME}' successfully loaded.")
    return _model_instance


def embed_standard_text(title: str, scope_text: str) -> np.ndarray:
    """Generate an L2-normalized embedding for a standard given its title and scope_text.

    Returns:
        np.ndarray: 1D float32 array of shape (768,).
    """
    model = get_embedding_model()
    combined_text = f"{title.strip()}. {scope_text.strip()}"
    embedding = model.encode(
        combined_text,
        normalize_embeddings=True,
        convert_to_numpy=True
    )
    return embedding.astype(np.float32)


def embed_query(query: str) -> np.ndarray:
    """Generate an L2-normalized embedding for an arbitrary user query string.

    Returns:
        np.ndarray: 2D float32 array of shape (1, 768).
    """
    model = get_embedding_model()
    embedding = model.encode(
        query.strip(),
        normalize_embeddings=True,
        convert_to_numpy=True
    )
    # Ensure 2D shape (1, dimension) for FAISS search queries
    if embedding.ndim == 1:
        embedding = np.expand_dims(embedding, axis=0)
    return embedding.astype(np.float32)


def embed_batch(texts: List[str], batch_size: int = 32) -> np.ndarray:
    """Generate L2-normalized embeddings for a list of strings in batches.

    Returns:
        np.ndarray: 2D float32 array of shape (len(texts), 768).
    """
    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        normalize_embeddings=True,
        show_progress_bar=True,
        convert_to_numpy=True
    )
    return embeddings.astype(np.float32)
