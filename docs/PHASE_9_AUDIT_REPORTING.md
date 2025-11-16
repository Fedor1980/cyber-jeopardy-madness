# Phase 9: Audit Reporting Engine

Enterprise-grade audit logging and compliance reporting system.

## Overview

The Audit Reporting Engine provides comprehensive tracking, logging, and reporting capabilities for:
- Data access patterns
- Consent usage
- Policy decisions
- System changes
- Compliance reports (GDPR, HIPAA, CCPA)

## Architecture

```
┌────────────────┐
│  Scroll API    │────┐
└────────────────┘    │
┌────────────────┐    │    ┌──────────────┐
│  Processor     │────┼───►│ Audit Logger │
└────────────────┘    │    └──────────────┘
┌────────────────┐    │            │
│   OPA          │────┘            │
└────────────────┘                 ▼
                           ┌──────────────┐
                           │  PostgreSQL  │
                           │  Audit DB    │
                           └──────────────┘
                                   │
                                   ▼
                           ┌──────────────┐
                           │   Reporting  │
                           │    Service   │
                           └──────────────┘
                                   │
                            ┌──────┴──────┐
                            │             │
                          PDF          Excel
                        Reports      Exports
```

## Audit Event Schema

```python
# audit/models.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

class AuditEventType(str, Enum):
    DATA_ACCESS = "data_access"
    DATA_WRITE = "data_write"
    POLICY_DECISION = "policy_decision"
    CONSENT_CHECK = "consent_check"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    CONFIG_CHANGE = "config_change"
    API_REQUEST = "api_request"

class AuditSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class AuditEvent(BaseModel):
    """Audit event model."""
    id: str = Field(..., description="Unique event ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: AuditEventType
    severity: AuditSeverity = AuditSeverity.INFO
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_ip: Optional[str] = None
    service: str = Field(..., description="Service that generated the event")
    action: str = Field(..., description="Action performed")
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    consent_id: Optional[str] = None
    policy_decision: Optional[bool] = None
    policy_name: Optional[str] = None
    request_id: Optional[str] = None
    response_code: Optional[int] = None
    duration_ms: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    success: bool = True
    error_message: Optional[str] = None
```

## Audit Logger Implementation

```python
# audit/logger.py
import asyncpg
import json
from typing import List
import uuid
from datetime import datetime

class AuditLogger:
    """Centralized audit logging service."""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.pool = None

    async def initialize(self):
        """Initialize database connection pool."""
        self.pool = await asyncpg.create_pool(self.db_url)

        # Create audit table if not exists
        async with self.pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_events (
                    id UUID PRIMARY KEY,
                    timestamp TIMESTAMPTZ NOT NULL,
                    event_type VARCHAR(50) NOT NULL,
                    severity VARCHAR(20) NOT NULL,
                    user_id VARCHAR(255),
                    user_email VARCHAR(255),
                    user_ip INET,
                    service VARCHAR(100) NOT NULL,
                    action VARCHAR(255) NOT NULL,
                    resource_type VARCHAR(100),
                    resource_id VARCHAR(255),
                    consent_id VARCHAR(255),
                    policy_decision BOOLEAN,
                    policy_name VARCHAR(255),
                    request_id VARCHAR(255),
                    response_code INTEGER,
                    duration_ms FLOAT,
                    metadata JSONB,
                    success BOOLEAN NOT NULL,
                    error_message TEXT
                );

                CREATE INDEX IF NOT EXISTS idx_audit_timestamp
                    ON audit_events(timestamp DESC);
                CREATE INDEX IF NOT EXISTS idx_audit_user
                    ON audit_events(user_id);
                CREATE INDEX IF NOT EXISTS idx_audit_consent
                    ON audit_events(consent_id);
                CREATE INDEX IF NOT EXISTS idx_audit_event_type
                    ON audit_events(event_type);
            """)

    async def log(self, event: AuditEvent):
        """Log an audit event."""
        async with self.pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO audit_events (
                    id, timestamp, event_type, severity, user_id, user_email,
                    user_ip, service, action, resource_type, resource_id,
                    consent_id, policy_decision, policy_name, request_id,
                    response_code, duration_ms, metadata, success, error_message
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                          $13, $14, $15, $16, $17, $18, $19, $20)
            """,
                event.id or str(uuid.uuid4()),
                event.timestamp,
                event.event_type.value,
                event.severity.value,
                event.user_id,
                event.user_email,
                event.user_ip,
                event.service,
                event.action,
                event.resource_type,
                event.resource_id,
                event.consent_id,
                event.policy_decision,
                event.policy_name,
                event.request_id,
                event.response_code,
                event.duration_ms,
                json.dumps(event.metadata),
                event.success,
                event.error_message
            )

    async def query(
        self,
        start_date: datetime,
        end_date: datetime,
        event_types: List[AuditEventType] = None,
        user_id: str = None,
        consent_id: str = None,
        limit: int = 1000
    ) -> List[AuditEvent]:
        """Query audit events."""
        query = "SELECT * FROM audit_events WHERE timestamp BETWEEN $1 AND $2"
        params = [start_date, end_date]
        param_count = 2

        if event_types:
            param_count += 1
            query += f" AND event_type = ANY(${param_count})"
            params.append([et.value for et in event_types])

        if user_id:
            param_count += 1
            query += f" AND user_id = ${param_count}"
            params.append(user_id)

        if consent_id:
            param_count += 1
            query += f" AND consent_id = ${param_count}"
            params.append(consent_id)

        query += f" ORDER BY timestamp DESC LIMIT {limit}"

        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [self._row_to_event(row) for row in rows]

    def _row_to_event(self, row) -> AuditEvent:
        """Convert database row to AuditEvent."""
        return AuditEvent(**dict(row))
```

## Compliance Reports

### GDPR Article 30 Record of Processing Activities

```python
# audit/reports/gdpr.py
from datetime import datetime, timedelta
from typing import Dict, List

class GDPRReporter:
    """Generate GDPR compliance reports."""

    def __init__(self, audit_logger: AuditLogger):
        self.audit_logger = audit_logger

    async def generate_article_30_report(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """Generate Article 30 report."""
        events = await self.audit_logger.query(
            start_date=start_date,
            end_date=end_date,
            event_types=[AuditEventType.DATA_ACCESS, AuditEventType.DATA_WRITE]
        )

        report = {
            "report_type": "GDPR Article 30 - Record of Processing Activities",
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "controller": {
                "name": "Sovereign Scroll Platform",
                "contact": "dpo@sovereignscroll.io"
            },
            "processing_activities": self._analyze_processing_activities(events),
            "data_categories": self._categorize_data(events),
            "purposes": self._analyze_purposes(events),
            "recipients": self._analyze_recipients(events),
            "transfers": self._analyze_transfers(events),
            "retention": self._analyze_retention(events),
            "technical_measures": self._list_technical_measures()
        }

        return report

    def _analyze_processing_activities(self, events: List[AuditEvent]) -> Dict:
        """Analyze processing activities."""
        activities = {}
        for event in events:
            service = event.service
            if service not in activities:
                activities[service] = {
                    "count": 0,
                    "data_subjects": set(),
                    "purposes": set()
                }

            activities[service]["count"] += 1
            if event.user_id:
                activities[service]["data_subjects"].add(event.user_id)

        return {
            k: {
                **v,
                "data_subjects": list(v["data_subjects"]),
                "purposes": list(v["purposes"])
            }
            for k, v in activities.items()
        }
```

### HIPAA Audit Report

```python
# audit/reports/hipaa.py
class HIPAAReporter:
    """Generate HIPAA compliance reports."""

    async def generate_access_report(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """Generate HIPAA access report (45 CFR § 164.312(b))."""
        events = await self.audit_logger.query(
            start_date=start_date,
            end_date=end_date,
            event_types=[AuditEventType.DATA_ACCESS]
        )

        return {
            "report_type": "HIPAA Audit Controls Report",
            "regulation": "45 CFR § 164.312(b)",
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "total_access_events": len(events),
            "authorized_access": sum(1 for e in events if e.success),
            "unauthorized_attempts": sum(1 for e in events if not e.success),
            "unique_users": len(set(e.user_id for e in events if e.user_id)),
            "access_by_user": self._access_by_user(events),
            "access_by_resource": self._access_by_resource(events),
            "off_hours_access": self._off_hours_access(events)
        }
```

## Report Export

### PDF Export

```python
# audit/export/pdf.py
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import io

class PDFExporter:
    """Export audit reports to PDF."""

    def export_report(self, report: Dict, output_path: str):
        """Export report to PDF."""
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        title = Paragraph(f"<b>{report['report_type']}</b>", styles['Title'])
        elements.append(title)

        # Period
        period = Paragraph(
            f"Period: {report['period']['start']} to {report['period']['end']}",
            styles['Normal']
        )
        elements.append(period)

        # Data table
        data = [['Metric', 'Value']]
        for key, value in report.items():
            if key not in ['report_type', 'period']:
                data.append([key, str(value)])

        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(table)
        doc.build(elements)
```

### Excel Export

```python
# audit/export/excel.py
import openpyxl
from openpyxl.styles import Font, PatternFill
from datetime import datetime

class ExcelExporter:
    """Export audit reports to Excel."""

    def export_report(self, report: Dict, output_path: str):
        """Export report to Excel."""
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Audit Report"

        # Header
        ws['A1'] = report['report_type']
        ws['A1'].font = Font(size=16, bold=True)

        ws['A2'] = f"Period: {report['period']['start']} to {report['period']['end']}"

        # Data
        row = 4
        ws[f'A{row}'] = "Metric"
        ws[f'B{row}'] = "Value"

        # Style header
        for cell in ws[f'{row}:{row}']:
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="CCCCCC", fill_type="solid")

        row += 1
        for key, value in report.items():
            if key not in ['report_type', 'period']:
                ws[f'A{row}'] = key
                ws[f'B{row}'] = str(value)
                row += 1

        wb.save(output_path)
```

## REST API

```python
# audit/api.py
from fastapi import FastAPI, Query
from datetime import datetime, timedelta

app = FastAPI(title="Audit Reporting API")

@app.get("/audit/events")
async def get_audit_events(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    event_type: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Get audit events."""
    events = await audit_logger.query(
        start_date=start_date,
        end_date=end_date,
        user_id=user_id
    )
    return {"events": events, "total": len(events)}

@app.get("/reports/gdpr/article30")
async def gdpr_article30_report(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...)
):
    """Generate GDPR Article 30 report."""
    reporter = GDPRReporter(audit_logger)
    report = await reporter.generate_article_30_report(start_date, end_date)
    return report

@app.get("/reports/hipaa/access")
async def hipaa_access_report(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...)
):
    """Generate HIPAA access report."""
    reporter = HIPAAReporter(audit_logger)
    report = await reporter.generate_access_report(start_date, end_date)
    return report

@app.post("/reports/export/pdf")
async def export_pdf(report_type: str, start_date: datetime, end_date: datetime):
    """Export report to PDF."""
    # Generate report
    if report_type == "gdpr_article30":
        reporter = GDPRReporter(audit_logger)
        report = await reporter.generate_article_30_report(start_date, end_date)
    else:
        raise HTTPException(400, "Invalid report type")

    # Export to PDF
    exporter = PDFExporter()
    output = io.BytesIO()
    exporter.export_report(report, output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report.pdf"}
    )
```

## Deployment

```yaml
# helm/sovereign-scroll/templates/deployment-audit.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "sovereign-scroll.fullname" . }}-audit
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: audit-service
        image: sovereign-scroll/audit-service:2.0.0
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: audit-db-credentials
              key: url
```

## Usage Example

```python
# Example: Logging audit events
from audit import AuditLogger, AuditEvent, AuditEventType

logger = AuditLogger("postgresql://audit_db:5432")
await logger.initialize()

# Log data access
await logger.log(AuditEvent(
    event_type=AuditEventType.DATA_ACCESS,
    user_id="user_123",
    user_email="user@example.com",
    service="scroll-api",
    action="retrieve_scroll",
    resource_type="scroll",
    resource_id="scroll_456",
    consent_id="0xABC123",
    success=True
))

# Generate compliance report
from audit.reports import GDPRReporter

reporter = GDPRReporter(logger)
report = await reporter.generate_article_30_report(
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 12, 31)
)

# Export to PDF
from audit.export import PDFExporter

exporter = PDFExporter()
exporter.export_report(report, "gdpr_report_2024.pdf")
```
