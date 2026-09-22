"""Seed script to populate BIS standards, relations, and certifications from JSON dataset.

Usage:
    cd backend
    python -m app.seed
"""

import os
import sys
import json
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db import SessionLocal, engine, Base
from app.models import (
    Standard,
    Amendment,
    StandardRelation,
    Certification,
    RelationType,
    CertificationType,
    StandardStatus
)


def find_seed_data_file() -> Path:
    """Locate data/seed_standards.json relative to repository root or script."""
    candidates = [
        backend_dir.parent / "data" / "seed_standards.json",
        backend_dir / "data" / "seed_standards.json",
        Path("data/seed_standards.json").resolve(),
    ]
    for path in candidates:
        if path.is_file():
            return path
    raise FileNotFoundError(
        "Could not find seed_standards.json. Checked: " + ", ".join(str(p) for p in candidates)
    )


def seed_database(clear_existing: bool = True):
    """Parse JSON seed data and populate database tables."""
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    json_path = find_seed_data_file()
    print(f"Loading seed data from: {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        if clear_existing:
            print("Resetting existing standards catalog records...")
            # Cascading deletion via models will clean up relations, amendments, certifications
            db.query(StandardRelation).delete()
            db.query(Amendment).delete()
            db.query(Certification).delete()
            db.query(Standard).delete()
            db.commit()

        print(f"Processing {len(data)} standards...")

        standards_map = {}  # is_number -> standard_id
        inserted_amendments = 0
        inserted_certifications = 0
        categories_count = {}

        # -------------------------------------------------------------
        # PASS 1: Insert all core standards, amendments, certifications
        # -------------------------------------------------------------
        for item in data:
            status_enum = StandardStatus(item.get("status", "active").lower())
            
            standard = Standard(
                is_number=item["is_number"],
                title=item["title"],
                scope_text=item["scope_text"],
                category=item["category"],
                status=status_enum,
                latest_version=item.get("latest_version"),
                reaffirmation_year=item.get("reaffirmation_year")
            )
            db.add(standard)
            db.flush()  # obtain generated ID

            standards_map[standard.is_number] = standard.id
            cat = item["category"]
            categories_count[cat] = categories_count.get(cat, 0) + 1

            # Insert amendments
            for amend in item.get("amendments", []):
                amendment_obj = Amendment(
                    standard_id=standard.id,
                    amendment_no=amend["amendment_no"],
                    date=amend.get("date"),
                    summary=amend.get("summary")
                )
                db.add(amendment_obj)
                inserted_amendments += 1

            # Insert certification if defined
            cert = item.get("certification")
            if cert:
                cert_type_enum = CertificationType(cert["certification_type"])
                cert_obj = Certification(
                    standard_id=standard.id,
                    certification_type=cert_type_enum,
                    mandatory=cert.get("mandatory", True),
                    scheme_reference=cert.get("scheme_reference")
                )
                db.add(cert_obj)
                inserted_certifications += 1

        db.commit()

        # -------------------------------------------------------------
        # PASS 2: Resolve standard_relations graph links
        # -------------------------------------------------------------
        inserted_relations = 0
        skipped_relations = 0
        seen_pairs = set()

        for item in data:
            source_num = item["is_number"]
            source_id = standards_map[source_num]

            for rel in item.get("related_standards", []):
                target_num = rel["related_is_number"]
                target_id = standards_map.get(target_num)

                if not target_id:
                    print(f"  [WARN] Related standard '{target_num}' not found for '{source_num}', skipping.")
                    skipped_relations += 1
                    continue

                rel_type_enum = RelationType(rel["relation_type"])
                pair_key = (source_id, target_id, rel_type_enum.value)

                if pair_key in seen_pairs:
                    continue

                seen_pairs.add(pair_key)
                rel_obj = StandardRelation(
                    standard_id=source_id,
                    related_standard_id=target_id,
                    relation_type=rel_type_enum
                )
                db.add(rel_obj)
                inserted_relations += 1

        db.commit()

        # -------------------------------------------------------------
        # SUMMARY
        # -------------------------------------------------------------
        print("\n" + "=" * 60)
        print("SEEDING COMPLETE!")
        print("=" * 60)
        print(f"Total Standards Inserted:      {len(standards_map)}")
        for category, count in categories_count.items():
            print(f"   • {category}: {count}")
        print(f"Total Amendments Inserted:     {inserted_amendments}")
        print(f"Total Certifications Inserted: {inserted_certifications}")
        print(f"Total Standard Relations:      {inserted_relations}")
        if skipped_relations:
            print(f"Skipped Relations (unresolved): {skipped_relations}")
        print("=" * 60 + "\n")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
