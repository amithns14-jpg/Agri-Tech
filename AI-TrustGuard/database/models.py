from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="analyst")
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scan_type = Column(String(50), nullable=False)  # message, url, privacy, prompt, full
    security_score = Column(Float, default=0.0)
    privacy_score = Column(Float, default=0.0)
    uncertainty_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    classification = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="COMPLETED")
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scans")
    threat_findings = relationship("ThreatFinding", back_populates="scan", cascade="all, delete-orphan")
    privacy_findings = relationship("PrivacyFinding", back_populates="scan", cascade="all, delete-orphan")


class ThreatFinding(Base):
    __tablename__ = "threat_findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String(64), ForeignKey("scans.scan_id"), nullable=False)
    finding_type = Column(String(50), nullable=False)  # phishing, malicious_url, prompt_injection
    severity = Column(String(20), nullable=False)       # LOW, MEDIUM, HIGH, CRITICAL
    explanation = Column(Text, nullable=False)
    raw_indicators = Column(JSON, nullable=True)

    scan = relationship("Scan", back_populates="threat_findings")


class PrivacyFinding(Base):
    __tablename__ = "privacy_findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String(64), ForeignKey("scans.scan_id"), nullable=False)
    entity_type = Column(String(50), nullable=False)   # EMAIL_ADDRESS, PHONE_NUMBER, IN_AADHAAR, etc.
    entity_count = Column(Integer, default=1)
    masking_status = Column(String(50), default="MASKED")  # FULL, PARTIAL, CUSTOM, UNMASKED

    scan = relationship("Scan", back_populates="privacy_findings")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="SUCCESS")
    details = Column(Text, nullable=True)

    user = relationship("User", back_populates="audit_logs")


class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True, nullable=False)
    model_version = Column(String(50), nullable=False)
    training_date = Column(DateTime, default=datetime.utcnow)
    algorithm = Column(String(100), nullable=False)
    evaluation_metrics = Column(JSON, nullable=False)
