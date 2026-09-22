"""Script to compute multilingual embeddings for all standards in DB and build FAISS index.

Saves:
- backend/data/faiss.index (FAISS Inner Product vector index)
- backend/data/id_mapping.json (parallel mapping connecting FAISS row index to standard details)

Usage:
    cd backend
    python -m app.build_index
"""

import sys
import json
from pathlib import Path
import numpy as np
import faiss

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db import SessionLocal
from app.models import Standard
from app.embeddings import embed_batch

DATA_DIR = backend_dir / "data"
INDEX_PATH = DATA_DIR / "faiss.index"
MAPPING_PATH = DATA_DIR / "id_mapping.json"


def build_faiss_index(force_rebuild: bool = True):
    """Compute embeddings for all standards in the database and save the FAISS index."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    db = SessionLocal()
    try:
        standards = db.query(Standard).order_by(Standard.id.asc()).all()
        total_standards = len(standards)

        if total_standards == 0:
            print("No standards found in database. Please run 'python -m app.seed' first.")
            return False

        print(f"Found {total_standards} standards in database. Preparing texts for embedding...")

        texts = []
        mapping = []

        for idx, s in enumerate(standards):
            combined_text = f"{s.title.strip()}. {s.scope_text.strip()}"
            texts.append(combined_text)
            mapping.append({
                "row_index": idx,
                "standard_id": s.id,
                "is_number": s.is_number,
                "title": s.title,
                "category": s.category,
                "status": s.status.value if hasattr(s.status, "value") else str(s.status)
            })

        print(f"Computing embeddings with paraphrase-multilingual-mpnet-base-v2 for {total_standards} standards...")
        embeddings = embed_batch(texts, batch_size=16)

        dimension = embeddings.shape[1]
        print(f"Embeddings generated with shape {embeddings.shape} (dimension={dimension}).")

        # Create FAISS IndexFlatIP (Inner Product = Cosine Similarity since vectors are L2-normalized)
        index = faiss.IndexFlatIP(dimension)
        index.add(embeddings)

        # Save index to disk
        faiss.write_index(index, str(INDEX_PATH))
        print(f"FAISS index successfully written to: {INDEX_PATH}")

        # Save parallel row-to-standard mapping to disk
        with open(MAPPING_PATH, "w", encoding="utf-8") as f:
            json.dump(mapping, f, indent=2, ensure_ascii=False)
        print(f"ID mapping successfully written to: {MAPPING_PATH}")

        print("\n" + "=" * 50)
        print(f"INDEXING COMPLETE: {index.ntotal} vectors indexed (dim={dimension})")
        print("=" * 50 + "\n")
        return True

    finally:
        db.close()


if __name__ == "__main__":
    build_faiss_index()
