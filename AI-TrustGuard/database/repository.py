from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from database.models import User, Scan, ThreatFinding, PrivacyFinding, AuditLog, ModelMetadata

class ScanRepository:
    @staticmethod
    def create_scan(
        db: Session,
        scan_id: str,
        scan_type: str,
        security_score: float,
        privacy_score: float,
        uncertainty_score: float,
        overall_score: float,
        classification: str,
        user_id: Optional[int] = None,
        summary: Optional[str] = None
    ) -> Scan:
        scan = Scan(
            scan_id=scan_id,
            user_id=user_id,
            scan_type=scan_type,
            security_score=security_score,
            privacy_score=privacy_score,
            uncertainty_score=uncertainty_score,
            overall_score=overall_score,
            classification=classification,
            summary=summary,
            created_at=datetime.utcnow()
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan

    @staticmethod
    def get_scan(db: Session, scan_id: str) -> Optional[Scan]:
        return db.query(Scan).filter(Scan.scan_id == scan_id).first()

    @staticmethod
    def list_scans(db: Session, limit: int = 50, offset: int = 0) -> List[Scan]:
        return db.query(Scan).order_by(desc(Scan.created_at)).offset(offset).limit(limit).all()

    @staticmethod
    def delete_scan(db: Session, scan_id: str) -> bool:
        scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
        if scan:
            db.delete(scan)
            db.commit()
            return True
        return False

    @staticmethod
    def add_threat_finding(
        db: Session,
        scan_id: str,
        finding_type: str,
        severity: str,
        explanation: str,
        raw_indicators: Optional[Dict[str, Any]] = None
    ) -> ThreatFinding:
        finding = ThreatFinding(
            scan_id=scan_id,
            finding_type=finding_type,
            severity=severity,
            explanation=explanation,
            raw_indicators=raw_indicators
        )
        db.add(finding)
        db.commit()
        db.refresh(finding)
        return finding

    @staticmethod
    def add_privacy_finding(
        db: Session,
        scan_id: str,
        entity_type: str,
        entity_count: int = 1,
        masking_status: str = "MASKED"
    ) -> PrivacyFinding:
        finding = PrivacyFinding(
            scan_id=scan_id,
            entity_type=entity_type,
            entity_count=entity_count,
            masking_status=masking_status
        )
        db.add(finding)
        db.commit()
        db.refresh(finding)
        return finding

    @staticmethod
    def log_audit(
        db: Session,
        action: str,
        user_id: Optional[int] = None,
        status: str = "SUCCESS",
        details: Optional[str] = None
    ) -> AuditLog:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            status=status,
            details=details,
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict[str, Any]:
        total_scans = db.query(func.count(Scan.id)).scalar() or 0
        threats_count = db.query(func.count(ThreatFinding.id)).scalar() or 0
        privacy_count = db.query(func.sum(PrivacyFinding.entity_count)).scalar() or 0
        high_risk_incidents = db.query(func.count(Scan.id)).filter(
            Scan.classification.in_(["HIGH", "CRITICAL"])
        ).scalar() or 0

        recent_scans = db.query(Scan).order_by(desc(Scan.created_at)).limit(10).all()

        # Distribution by risk classification
        risk_dist = {
            "LOW": db.query(func.count(Scan.id)).filter(Scan.classification == "LOW").scalar() or 0,
            "MEDIUM": db.query(func.count(Scan.id)).filter(Scan.classification == "MEDIUM").scalar() or 0,
            "HIGH": db.query(func.count(Scan.id)).filter(Scan.classification == "HIGH").scalar() or 0,
            "CRITICAL": db.query(func.count(Scan.id)).filter(Scan.classification == "CRITICAL").scalar() or 0,
        }

        # Threat types breakdown
        threat_breakdown = {}
        threat_rows = db.query(ThreatFinding.finding_type, func.count(ThreatFinding.id)).group_by(ThreatFinding.finding_type).all()
        for t_type, count in threat_rows:
            threat_breakdown[t_type] = count

        # Privacy types breakdown
        privacy_breakdown = {}
        priv_rows = db.query(PrivacyFinding.entity_type, func.sum(PrivacyFinding.entity_count)).group_by(PrivacyFinding.entity_type).all()
        for p_type, count in priv_rows:
            privacy_breakdown[p_type] = int(count or 0)

        return {
            "total_scans": total_scans,
            "threats_detected": threats_count,
            "privacy_issues_identified": int(privacy_count),
            "high_risk_incidents": high_risk_incidents,
            "risk_distribution": risk_dist,
            "threat_breakdown": threat_breakdown,
            "privacy_breakdown": privacy_breakdown,
            "recent_scans": [
                {
                    "scan_id": s.scan_id,
                    "scan_type": s.scan_type,
                    "overall_score": s.overall_score,
                    "classification": s.classification,
                    "created_at": s.created_at.isoformat() if s.created_at else None
                }
                for s in recent_scans
            ]
        }

    @staticmethod
    def save_model_metadata(
        db: Session,
        model_name: str,
        model_version: str,
        algorithm: str,
        metrics: Dict[str, Any]
    ) -> ModelMetadata:
        record = db.query(ModelMetadata).filter(ModelMetadata.model_name == model_name).first()
        if not record:
            record = ModelMetadata(
                model_name=model_name,
                model_version=model_version,
                algorithm=algorithm,
                evaluation_metrics=metrics,
                training_date=datetime.utcnow()
            )
            db.add(record)
        else:
            record.model_version = model_version
            record.algorithm = algorithm
            record.evaluation_metrics = metrics
            record.training_date = datetime.utcnow()
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_all_models_metadata(db: Session) -> List[ModelMetadata]:
        return db.query(ModelMetadata).all()
