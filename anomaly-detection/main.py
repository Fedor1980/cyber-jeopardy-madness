"""
Anomaly Detection Service
Monitors scroll processing patterns and detects anomalous behavior using ML.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Anomaly Detection Service",
    description="ML-powered anomaly detection for scroll processing patterns",
    version="1.0.0"
)

# Configuration
MODEL_PATH = os.getenv('MODEL_PATH', '/models/anomaly_detector.joblib')
SCALER_PATH = os.getenv('SCALER_PATH', '/models/scaler.joblib')
CONTAMINATION = float(os.getenv('CONTAMINATION', '0.1'))  # Expected anomaly rate

# Models
class ScrollMetrics(BaseModel):
    """Metrics for a processed scroll."""
    scroll_id: str
    timestamp: datetime
    processing_duration_ms: float
    validation_duration_ms: float
    opa_check_duration_ms: float
    embedding_duration_ms: float
    qdrant_store_duration_ms: float
    content_length: int
    consent_check_result: bool
    source_system: str

class AnomalyDetectionRequest(BaseModel):
    """Request for anomaly detection."""
    metrics: List[ScrollMetrics]

class AnomalyResult(BaseModel):
    """Result of anomaly detection."""
    scroll_id: str
    is_anomaly: bool
    anomaly_score: float
    anomaly_reasons: List[str]
    severity: str  # low, medium, high, critical

class AnomalyDetectionResponse(BaseModel):
    """Response with detected anomalies."""
    total_analyzed: int
    anomalies_detected: int
    results: List[AnomalyResult]

class TrainingRequest(BaseModel):
    """Request to train/update the model."""
    metrics: List[ScrollMetrics]
    contamination: Optional[float] = Field(0.1, description="Expected anomaly rate")

# ML Model Management
class AnomalyDetector:
    """Anomaly detection using Isolation Forest."""

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'processing_duration_ms',
            'validation_duration_ms',
            'opa_check_duration_ms',
            'embedding_duration_ms',
            'qdrant_store_duration_ms',
            'content_length',
            'hour_of_day',
            'day_of_week'
        ]
        self.load_model()

    def load_model(self):
        """Load trained model if available."""
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                logger.info("Loaded existing anomaly detection model")
            else:
                # Initialize with default model
                self.model = IsolationForest(
                    contamination=CONTAMINATION,
                    random_state=42,
                    n_estimators=100
                )
                logger.info("Initialized new anomaly detection model")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = IsolationForest(contamination=CONTAMINATION, random_state=42)

    def extract_features(self, metrics: List[ScrollMetrics]) -> np.ndarray:
        """Extract features from scroll metrics."""
        features = []
        for m in metrics:
            features.append([
                m.processing_duration_ms,
                m.validation_duration_ms,
                m.opa_check_duration_ms,
                m.embedding_duration_ms,
                m.qdrant_store_duration_ms,
                m.content_length,
                m.timestamp.hour,
                m.timestamp.weekday()
            ])
        return np.array(features)

    def train(self, metrics: List[ScrollMetrics], contamination: float = 0.1):
        """Train the anomaly detection model."""
        features = self.extract_features(metrics)

        # Fit scaler
        self.scaler.fit(features)
        features_scaled = self.scaler.transform(features)

        # Train model
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        self.model.fit(features_scaled)

        # Save models
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)

        logger.info(f"Trained model on {len(metrics)} samples")

    def detect_anomalies(self, metrics: List[ScrollMetrics]) -> List[AnomalyResult]:
        """Detect anomalies in scroll processing metrics."""
        if self.model is None:
            raise ValueError("Model not trained")

        features = self.extract_features(metrics)
        features_scaled = self.scaler.transform(features)

        # Predict anomalies (-1 = anomaly, 1 = normal)
        predictions = self.model.predict(features_scaled)
        scores = self.model.score_samples(features_scaled)

        results = []
        for i, (metric, pred, score) in enumerate(zip(metrics, predictions, scores)):
            is_anomaly = pred == -1

            # Determine anomaly reasons
            reasons = self._identify_anomaly_reasons(metric, features[i])

            # Determine severity
            severity = self._calculate_severity(score, reasons)

            results.append(AnomalyResult(
                scroll_id=metric.scroll_id,
                is_anomaly=is_anomaly,
                anomaly_score=float(score),
                anomaly_reasons=reasons,
                severity=severity
            ))

        return results

    def _identify_anomaly_reasons(self, metric: ScrollMetrics, features: np.ndarray) -> List[str]:
        """Identify specific reasons for anomaly."""
        reasons = []

        # Check for extreme processing times
        if metric.processing_duration_ms > 5000:
            reasons.append("Unusually high total processing time")
        if metric.opa_check_duration_ms > 500:
            reasons.append("Slow OPA policy evaluation")
        if metric.embedding_duration_ms > 2000:
            reasons.append("Slow embedding generation")
        if metric.qdrant_store_duration_ms > 1000:
            reasons.append("Slow Qdrant storage operation")

        # Check for unusual content
        if metric.content_length > 50000:
            reasons.append("Unusually large content size")
        elif metric.content_length < 10:
            reasons.append("Unusually small content size")

        # Check for consent issues
        if not metric.consent_check_result:
            reasons.append("Consent check failed")

        # Check for unusual timing
        if metric.timestamp.hour < 6 or metric.timestamp.hour > 22:
            reasons.append("Processing outside normal hours")

        return reasons if reasons else ["Pattern deviation detected"]

    def _calculate_severity(self, score: float, reasons: List[str]) -> str:
        """Calculate anomaly severity."""
        # Lower scores indicate stronger anomalies
        if score < -0.5:
            return "critical"
        elif score < -0.3:
            return "high"
        elif score < -0.1:
            return "medium"
        else:
            return "low"

# Global detector instance
detector = AnomalyDetector()

# API Endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": detector.model is not None,
        "model_path": MODEL_PATH
    }

@app.post("/detect", response_model=AnomalyDetectionResponse)
async def detect_anomalies(request: AnomalyDetectionRequest):
    """
    Detect anomalies in scroll processing metrics.
    """
    try:
        if not request.metrics:
            raise HTTPException(status_code=400, detail="No metrics provided")

        results = detector.detect_anomalies(request.metrics)
        anomalies_detected = sum(1 for r in results if r.is_anomaly)

        return AnomalyDetectionResponse(
            total_analyzed=len(results),
            anomalies_detected=anomalies_detected,
            results=results
        )
    except Exception as e:
        logger.error(f"Error detecting anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(request: TrainingRequest):
    """
    Train or update the anomaly detection model.
    """
    try:
        if len(request.metrics) < 100:
            raise HTTPException(
                status_code=400,
                detail="At least 100 samples required for training"
            )

        detector.train(request.metrics, request.contamination)

        return {
            "status": "success",
            "samples_trained": len(request.metrics),
            "contamination": request.contamination,
            "model_path": MODEL_PATH
        }
    except Exception as e:
        logger.error(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """API info endpoint."""
    return {
        "name": "Anomaly Detection Service",
        "version": "1.0.0",
        "model": "Isolation Forest",
        "features": detector.feature_names,
        "endpoints": {
            "health": "/health",
            "detect": "/detect",
            "train": "/train"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
