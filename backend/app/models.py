"""SQLAlchemy models for ProcurePro BIS Standards Recommendation Engine.

Defines:
- standards: Core Indian Standards (IS) catalog published by BIS
- amendments: Formal revisions and amendments issued by BIS
- standard_relations: Graph relations between standards (normative references, test methods, superseded relations, etc.)
- certifications: Mandatory and voluntary certification schemes (BIS ISI, CRS, Hallmark)
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    ForeignKey,
    DateTime,
    Enum as SQLEnum,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.db import Base


class RelationType(str, enum.Enum):
    """Types of relationships between Indian Standards."""
    normative_reference = "normative_reference"
    test_method = "test_method"
    terminology = "terminology"
    safety = "safety"
    installation = "installation"
    related_product = "related_product"
    superseded_by = "superseded_by"


class CertificationType(str, enum.Enum):
    """Certification schemes administered by BIS."""
    BIS_ISI = "BIS_ISI"       # Scheme-I: Product Certification (ISI Mark)
    CRS = "CRS"               # Scheme-II: Compulsory Registration Scheme (Electronics/IT)
    Hallmark = "Hallmark"     # Precious metals hallmarking


class StandardStatus(str, enum.Enum):
    """Current statutory lifecycle status of an Indian Standard."""
    active = "active"
    superseded = "superseded"
    withdrawn = "withdrawn"


class Standard(Base):
    """Primary Indian Standard (IS) catalog table."""
    __tablename__ = "standards"

    id = Column(Integer, primary_key=True, index=True)
    is_number = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    scope_text = Column(Text, nullable=False)
    category = Column(String(150), nullable=False, index=True)
    status = Column(
        SQLEnum(StandardStatus, native_enum=False),
        nullable=False,
        default=StandardStatus.active,
        index=True
    )
    latest_version = Column(String(50), nullable=True)
    reaffirmation_year = Column(Integer, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    amendments = relationship(
        "Amendment",
        back_populates="standard",
        cascade="all, delete-orphan",
        order_by="Amendment.id"
    )
    certifications = relationship(
        "Certification",
        back_populates="standard",
        cascade="all, delete-orphan"
    )
    outgoing_relations = relationship(
        "StandardRelation",
        foreign_keys="StandardRelation.standard_id",
        back_populates="standard",
        cascade="all, delete-orphan"
    )
    incoming_relations = relationship(
        "StandardRelation",
        foreign_keys="StandardRelation.related_standard_id",
        back_populates="related_standard",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Standard(is_number='{self.is_number}', title='{self.title[:30]}...')>"


class Amendment(Base):
    """Official amendments and revisions published for an Indian Standard."""
    __tablename__ = "amendments"

    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(
        Integer,
        ForeignKey("standards.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    amendment_no = Column(String(50), nullable=False)
    date = Column(String(50), nullable=True)
    summary = Column(Text, nullable=True)

    # Relationship back to standard
    standard = relationship("Standard", back_populates="amendments")

    def __repr__(self):
        return f"<Amendment(standard_id={self.standard_id}, amendment_no='{self.amendment_no}')>"


class StandardRelation(Base):
    """Directed graph link representing dependencies and linkages between standards."""
    __tablename__ = "standard_relations"

    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(
        Integer,
        ForeignKey("standards.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    related_standard_id = Column(
        Integer,
        ForeignKey("standards.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    relation_type = Column(
        SQLEnum(RelationType, native_enum=False),
        nullable=False,
        index=True
    )

    __table_args__ = (
        UniqueConstraint(
            "standard_id",
            "related_standard_id",
            "relation_type",
            name="uq_standard_relation"
        ),
    )

    # Relationships
    standard = relationship(
        "Standard",
        foreign_keys=[standard_id],
        back_populates="outgoing_relations"
    )
    related_standard = relationship(
        "Standard",
        foreign_keys=[related_standard_id],
        back_populates="incoming_relations"
    )

    def __repr__(self):
        return (
            f"<StandardRelation(standard_id={self.standard_id} "
            f"--{self.relation_type.value}--> {self.related_standard_id})>"
        )


class Certification(Base):
    """Certification orders and conformity assessment schemes under BIS."""
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(
        Integer,
        ForeignKey("standards.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    certification_type = Column(
        SQLEnum(CertificationType, native_enum=False),
        nullable=False,
        default=CertificationType.BIS_ISI,
        index=True
    )
    mandatory = Column(Boolean, nullable=False, default=True)
    scheme_reference = Column(Text, nullable=True)

    # Relationship back to standard
    standard = relationship("Standard", back_populates="certifications")

    def __repr__(self):
        return (
            f"<Certification(standard_id={self.standard_id}, "
            f"type='{self.certification_type.value}', mandatory={self.mandatory})>"
        )


class HealthRecord(Base):
    """Audit model tracking system health or diagnostic pings."""
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), nullable=False, default="ok")
    checked_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
