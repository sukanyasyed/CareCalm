# FastAPI Backend Reference Implementation

This document provides a complete FastAPI implementation equivalent to the Lovable Cloud backend. You can use this to host your own Python backend on Railway, Render, or any other platform.

## Project Structure

```
healthcare-engagement-api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── log.py
│   │   ├── drift.py
│   │   └── nudge.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── log.py
│   │   ├── drift.py
│   │   └── nudge.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── logs.py
│   │   ├── drift.py
│   │   └── nudges.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── drift_detection.py
│   │   └── nudge_engine.py
│   └── utils/
│       ├── __init__.py
│       ├── auth.py
│       └── translations.py
├── requirements.txt
├── .env.example
└── README.md
```

## requirements.txt

```txt
fastapi==0.109.0
uvicorn==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.5.3
pydantic-settings==2.1.0
python-multipart==0.0.6
alembic==1.13.1
```

## app/config.py

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/healthcare_db"
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

## app/database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## app/models/user.py

```python
from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## app/models/log.py

```python
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.database import Base

class LogType(str, enum.Enum):
    glucose = "glucose"
    bp = "bp"
    activity = "activity"
    diet = "diet"
    medication = "medication"
    weight = "weight"

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    log_type = Column(Enum(LogType), nullable=False)
    logged_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## app/models/drift.py

```python
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.database import Base

class DriftType(str, enum.Enum):
    frequency_drop = "frequency_drop"
    irregular_timing = "irregular_timing"
    missed_routine = "missed_routine"
    sparse_variety = "sparse_variety"

class DriftLevel(str, enum.Enum):
    none = "none"
    mild = "mild"
    moderate = "moderate"
    significant = "significant"

class DriftEvent(Base):
    __tablename__ = "drift_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    drift_type = Column(Enum(DriftType), nullable=False)
    drift_level = Column(Enum(DriftLevel), nullable=False)
    engagement_score = Column(Integer, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    metadata = Column(JSON, default={})
```

## app/models/nudge.py

```python
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base

class Nudge(Base):
    __tablename__ = "nudges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    message = Column(String(1000), nullable=False)
    nudge_type = Column(String(50), default="encouragement")
    tone = Column(String(50), default="warm")
    language = Column(String(10), default="en")
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=datetime.utcnow, index=True)
```

## app/schemas/user.py

```python
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    language: Optional[str] = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    language: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

## app/schemas/log.py

```python
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, List
from app.models.log import LogType

class LogCreate(BaseModel):
    log_type: LogType
    logged_at: Optional[datetime] = None

class LogResponse(BaseModel):
    id: UUID
    log_type: LogType
    logged_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class LogSummary(BaseModel):
    total: int
    by_type: Dict[str, int]
    days_with_logs: int

class LogHistoryResponse(BaseModel):
    logs: List[LogResponse]
    summary: LogSummary
    pagination: Dict[str, int]
    disclaimer: str = "This data shows activity timestamps only. No medical values are stored or displayed."
```

## app/schemas/drift.py

```python
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any
from app.models.drift import DriftType, DriftLevel

class DriftScores(BaseModel):
    frequency: int
    timing: int
    variety: int

class DriftAnalysis(BaseModel):
    engagement_score: int
    drift_level: DriftLevel
    drift_type: Optional[DriftType]
    trend: str  # "improving", "stable", "declining"
    scores: DriftScores
    metadata: Dict[str, Any]

class DriftRecommendation(BaseModel):
    suggest_reduced_plan: bool
    message: str

class NudgeInfo(BaseModel):
    message: str
    type: str
    tone: str
    language: str

class DriftAnalysisResponse(BaseModel):
    disclaimer: str = "This analysis is for engagement tracking only. It is not medical advice and does not assess health conditions."
    analysis: DriftAnalysis
    nudge: NudgeInfo
    recommendations: Optional[DriftRecommendation]
    timestamp: datetime
```

## app/schemas/nudge.py

```python
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class NudgeResponse(BaseModel):
    id: UUID
    message: str
    nudge_type: str
    tone: str
    language: str
    is_read: bool
    sent_at: datetime

    class Config:
        from_attributes = True

class NudgesListResponse(BaseModel):
    nudges: List[NudgeResponse]
    unread_count: int
    disclaimer: str = "These are motivational messages only, not medical advice."

class MarkReadRequest(BaseModel):
    nudge_ids: List[UUID]
```

## app/utils/auth.py

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import get_settings
from app.database import get_db
from app.models.user import User

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
```

## app/services/drift_detection.py

```python
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from app.models.log import ActivityLog
import math

THRESHOLDS = {
    "FREQUENCY_DROP": {"mild": 0.7, "moderate": 0.5, "significant": 0.3},
    "TIMING_VARIANCE": {"mild": 2, "moderate": 4, "significant": 6},
    "VARIETY_SCORE": {"mild": 0.6, "moderate": 0.4, "significant": 0.2}
}

def analyze_drift(logs: List[ActivityLog]) -> Dict[str, Any]:
    """Analyze behavioral drift from activity logs."""
    
    if not logs:
        return {
            "drift_level": "significant",
            "drift_type": "frequency_drop",
            "engagement_score": 0,
            "frequency_score": 0,
            "timing_score": 0,
            "variety_score": 0,
            "trend": "declining",
            "metadata": {"logs_count": 0, "days_analyzed": 14}
        }

    now = datetime.utcnow()
    fourteen_days_ago = now - timedelta(days=14)
    seven_days_ago = now - timedelta(days=7)

    # Split logs into recent (7 days) and older (7-14 days)
    recent_logs = [l for l in logs if l.logged_at >= seven_days_ago]
    older_logs = [l for l in logs if fourteen_days_ago <= l.logged_at < seven_days_ago]

    # Calculate frequency score
    recent_frequency = len(recent_logs) / 7
    older_frequency = len(older_logs) / 7
    baseline_frequency = max(older_frequency, 2)  # Assume at least 2 logs/day baseline
    
    frequency_ratio = recent_frequency / baseline_frequency if baseline_frequency > 0 else 0
    frequency_score = min(100, round(frequency_ratio * 100))

    # Calculate timing consistency
    log_hours = [l.logged_at.hour for l in recent_logs]
    if log_hours:
        avg_hour = sum(log_hours) / len(log_hours)
        variance = sum((h - avg_hour) ** 2 for h in log_hours) / len(log_hours)
        std_dev = math.sqrt(variance)
    else:
        std_dev = 12  # Max variance if no logs
    timing_score = max(0, min(100, round((6 - std_dev) / 6 * 100)))

    # Calculate variety score
    log_types = set(l.log_type.value for l in recent_logs)
    expected_types = 4  # glucose, bp, activity, diet
    variety_score = round((len(log_types) / expected_types) * 100)

    # Overall engagement score
    engagement_score = round(frequency_score * 0.4 + timing_score * 0.3 + variety_score * 0.3)

    # Determine drift level and type
    drift_level = "none"
    drift_type = None

    if frequency_ratio < THRESHOLDS["FREQUENCY_DROP"]["significant"]:
        drift_level = "significant"
        drift_type = "frequency_drop"
    elif frequency_ratio < THRESHOLDS["FREQUENCY_DROP"]["moderate"]:
        drift_level = "moderate"
        drift_type = "frequency_drop"
    elif frequency_ratio < THRESHOLDS["FREQUENCY_DROP"]["mild"]:
        drift_level = "mild"
        drift_type = "frequency_drop"
    elif std_dev > THRESHOLDS["TIMING_VARIANCE"]["significant"]:
        drift_level = "significant"
        drift_type = "irregular_timing"
    elif std_dev > THRESHOLDS["TIMING_VARIANCE"]["moderate"]:
        drift_level = "moderate"
        drift_type = "irregular_timing"
    elif variety_score < THRESHOLDS["VARIETY_SCORE"]["significant"] * 100:
        drift_level = "moderate"
        drift_type = "sparse_variety"

    # Determine trend
    trend = "stable"
    if recent_frequency > older_frequency * 1.2:
        trend = "improving"
    elif recent_frequency < older_frequency * 0.8:
        trend = "declining"

    return {
        "drift_level": drift_level,
        "drift_type": drift_type,
        "engagement_score": engagement_score,
        "frequency_score": frequency_score,
        "timing_score": timing_score,
        "variety_score": variety_score,
        "trend": trend,
        "metadata": {
            "logs_count": len(logs),
            "recent_logs_count": len(recent_logs),
            "older_logs_count": len(older_logs),
            "log_types": list(log_types),
            "frequency_ratio": round(frequency_ratio, 2),
            "timing_variance": round(std_dev, 2),
            "days_analyzed": 14
        }
    }
```

## app/services/nudge_engine.py

```python
import random
from typing import Dict, Any

NUDGE_TEMPLATES = {
    "encouragement": {
        "en": [
            "You're doing a wonderful job staying consistent. Every small step matters!",
            "Your dedication to self-care is truly inspiring. Keep it up!",
            "We noticed you've been on track lately. That's amazing progress!"
        ],
        "es": [
            "¡Estás haciendo un trabajo maravilloso manteniéndote constante!",
            "Tu dedicación al autocuidado es verdaderamente inspiradora.",
            "Hemos notado que has estado en el buen camino. ¡Es un progreso increíble!"
        ],
        "hi": [
            "आप निरंतर रहने में अद्भुत काम कर रहे हैं। हर छोटा कदम मायने रखता है!",
            "आत्म-देखभाल के प्रति आपका समर्पण वास्तव में प्रेरणादायक है।",
            "हमने देखा कि आप हाल ही में सही रास्ते पर हैं। यह अद्भुत प्रगति है!"
        ]
    },
    "gentle_reminder": {
        "en": [
            "Life gets busy sometimes. Would you like to log a quick update when you have a moment?",
            "We're here whenever you're ready. No pressure, just support.",
            "It's been a little quiet. Everything okay? We're here for you."
        ],
        "es": [
            "La vida se pone ocupada a veces. ¿Te gustaría registrar una actualización rápida?",
            "Estamos aquí cuando estés listo. Sin presión, solo apoyo.",
            "Ha estado un poco tranquilo. ¿Todo bien? Estamos aquí para ti."
        ],
        "hi": [
            "जीवन कभी-कभी व्यस्त हो जाता है। क्या आप एक त्वरित अपडेट लॉग करना चाहेंगे?",
            "जब भी आप तैयार हों, हम यहां हैं। कोई दबाव नहीं, बस समर्थन।",
            "थोड़ी शांति रही है। सब ठीक है? हम आपके लिए यहां हैं।"
        ]
    },
    "supportive": {
        "en": [
            "Looks like your routine's been busy lately. Would a lighter plan for the next few days help?",
            "We understand routines can be challenging. How about we simplify things for now?",
            "Taking a step back is okay. Would you like us to adjust your daily goals?"
        ],
        "es": [
            "Parece que tu rutina ha estado ocupada últimamente. ¿Te ayudaría un plan más ligero?",
            "Entendemos que las rutinas pueden ser desafiantes. ¿Qué tal si simplificamos las cosas?",
            "Está bien dar un paso atrás. ¿Te gustaría que ajustemos tus metas diarias?"
        ],
        "hi": [
            "लगता है आपकी दिनचर्या व्यस्त रही है। क्या कुछ दिनों के लिए हल्की योजना मदद करेगी?",
            "हम समझते हैं कि दिनचर्या चुनौतीपूर्ण हो सकती है। चीजों को सरल बनाएं?",
            "एक कदम पीछे लेना ठीक है। क्या आप चाहेंगे कि हम आपके दैनिक लक्ष्यों को समायोजित करें?"
        ]
    },
    "celebration": {
        "en": [
            "🎉 You're back on track! Your consistency is really shining through.",
            "Welcome back! We're so glad to see you engaging again.",
            "Your comeback is inspiring! Every effort counts."
        ],
        "es": [
            "🎉 ¡Estás de vuelta en el camino! Tu consistencia realmente brilla.",
            "¡Bienvenido de vuelta! Nos alegra mucho verte comprometido de nuevo.",
            "¡Tu regreso es inspirador! Cada esfuerzo cuenta."
        ],
        "hi": [
            "🎉 आप वापस रास्ते पर हैं! आपकी निरंतरता वास्तव में चमक रही है।",
            "वापसी पर स्वागत है! आपको फिर से जुड़े हुए देखकर खुशी हुई।",
            "आपकी वापसी प्रेरणादायक है! हर प्रयास मायने रखता है।"
        ]
    }
}

def select_nudge(analysis: Dict[str, Any], language: str = "en") -> Dict[str, str]:
    """Select appropriate nudge based on drift analysis."""
    
    lang = language if language in ["en", "es", "hi"] else "en"
    
    drift_level = analysis.get("drift_level", "none")
    trend = analysis.get("trend", "stable")

    if trend == "improving" and drift_level == "none":
        category = "celebration"
        tone = "celebratory"
    elif drift_level in ["none", "mild"]:
        category = "encouragement"
        tone = "warm"
    elif drift_level == "moderate":
        category = "gentle_reminder"
        tone = "gentle"
    else:
        category = "supportive"
        tone = "understanding"

    templates = NUDGE_TEMPLATES[category][lang]
    message = random.choice(templates)

    return {"message": message, "type": category, "tone": tone}
```

## app/routers/auth.py

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.utils.auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        language=user_data.language
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
```

## app/routers/logs.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from app.database import get_db
from app.models.log import ActivityLog, LogType
from app.models.user import User
from app.schemas.log import LogCreate, LogResponse, LogHistoryResponse, LogSummary
from app.utils.auth import get_current_user

router = APIRouter(prefix="/logs", tags=["Activity Logs"])

@router.post("", response_model=dict, status_code=201)
def create_log(
    log_data: LogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new activity log entry."""
    
    log = ActivityLog(
        user_id=current_user.id,
        log_type=log_data.log_type,
        logged_at=log_data.logged_at or datetime.utcnow()
    )
    
    db.add(log)
    db.commit()
    db.refresh(log)
    
    return {
        "success": True,
        "log": LogResponse.model_validate(log),
        "disclaimer": "Only timestamps and log types are stored. No medical values are recorded."
    }

@router.get("/history", response_model=LogHistoryResponse)
def get_log_history(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    log_type: Optional[LogType] = None,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activity log history for the current user."""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.logged_at >= start_date
    )
    
    if log_type:
        query = query.filter(ActivityLog.log_type == log_type)
    
    total = query.count()
    logs = query.order_by(ActivityLog.logged_at.desc()).offset(offset).limit(limit).all()
    
    # Calculate summary
    all_logs = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.logged_at >= start_date
    ).all()
    
    by_type = {}
    unique_days = set()
    for log in all_logs:
        by_type[log.log_type.value] = by_type.get(log.log_type.value, 0) + 1
        unique_days.add(log.logged_at.date())
    
    return {
        "logs": [LogResponse.model_validate(l) for l in logs],
        "summary": LogSummary(
            total=total,
            by_type=by_type,
            days_with_logs=len(unique_days)
        ),
        "pagination": {"limit": limit, "offset": offset, "total": total}
    }
```

## app/routers/drift.py

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.log import ActivityLog
from app.models.drift import DriftEvent
from app.models.nudge import Nudge
from app.models.user import User
from app.schemas.drift import DriftAnalysisResponse
from app.services.drift_detection import analyze_drift
from app.services.nudge_engine import select_nudge
from app.utils.auth import get_current_user

router = APIRouter(prefix="/drift", tags=["Drift Detection"])

@router.post("/analyze", response_model=DriftAnalysisResponse)
def analyze_user_drift(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run drift analysis for the current user."""
    
    # Get logs from last 14 days
    fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
    logs = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.logged_at >= fourteen_days_ago
    ).order_by(ActivityLog.logged_at.desc()).all()
    
    # Analyze drift
    analysis = analyze_drift(logs)
    
    # Store drift event if detected
    if analysis["drift_level"] != "none" and analysis["drift_type"]:
        drift_event = DriftEvent(
            user_id=current_user.id,
            drift_type=analysis["drift_type"],
            drift_level=analysis["drift_level"],
            engagement_score=analysis["engagement_score"],
            metadata=analysis["metadata"]
        )
        db.add(drift_event)
    
    # Generate and store nudge
    nudge_info = select_nudge(analysis, current_user.language)
    nudge = Nudge(
        user_id=current_user.id,
        message=nudge_info["message"],
        nudge_type=nudge_info["type"],
        tone=nudge_info["tone"],
        language=current_user.language
    )
    db.add(nudge)
    db.commit()
    
    # Build response
    recommendations = None
    if analysis["drift_level"] == "significant":
        recommendations = {
            "suggest_reduced_plan": True,
            "message": "We're considering temporarily reducing daily tasks to help you get back on track."
        }
    
    return {
        "analysis": {
            "engagement_score": analysis["engagement_score"],
            "drift_level": analysis["drift_level"],
            "drift_type": analysis["drift_type"],
            "trend": analysis["trend"],
            "scores": {
                "frequency": analysis["frequency_score"],
                "timing": analysis["timing_score"],
                "variety": analysis["variety_score"]
            },
            "metadata": analysis["metadata"]
        },
        "nudge": {
            "message": nudge_info["message"],
            "type": nudge_info["type"],
            "tone": nudge_info["tone"],
            "language": current_user.language
        },
        "recommendations": recommendations,
        "timestamp": datetime.utcnow()
    }
```

## app/routers/nudges.py

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.nudge import Nudge
from app.models.user import User
from app.schemas.nudge import NudgesListResponse, NudgeResponse, MarkReadRequest
from app.utils.auth import get_current_user

router = APIRouter(prefix="/nudges", tags=["Nudges"])

@router.get("", response_model=NudgesListResponse)
def get_nudges(
    limit: int = Query(10, ge=1, le=50),
    unread: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get nudges for the current user."""
    
    query = db.query(Nudge).filter(Nudge.user_id == current_user.id)
    
    if unread:
        query = query.filter(Nudge.is_read == False)
    
    nudges = query.order_by(Nudge.sent_at.desc()).limit(limit).all()
    
    unread_count = db.query(Nudge).filter(
        Nudge.user_id == current_user.id,
        Nudge.is_read == False
    ).count()
    
    return {
        "nudges": [NudgeResponse.model_validate(n) for n in nudges],
        "unread_count": unread_count
    }

@router.patch("/read")
def mark_nudges_read(
    request: MarkReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark nudges as read."""
    
    db.query(Nudge).filter(
        Nudge.user_id == current_user.id,
        Nudge.id.in_(request.nudge_ids)
    ).update({"is_read": True}, synchronize_session=False)
    
    db.commit()
    
    return {"success": True, "updated": len(request.nudge_ids)}
```

## app/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, logs, drift, nudges

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Healthcare Engagement Tracking API",
    description="Non-clinical behavioral drift detection and gentle re-engagement system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(logs.router)
app.include_router(drift.router)
app.include_router(nudges.router)

@app.get("/")
def root():
    return {
        "message": "Healthcare Engagement Tracking API",
        "disclaimer": "This system is for engagement tracking only. It is not medical advice.",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## Running the FastAPI Server

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db"
export SECRET_KEY="your-super-secret-key"

# Run with uvicorn
uvicorn app.main:app --reload --port 8000
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT |
| POST | `/logs` | Create activity log |
| GET | `/logs/history` | Get log history |
| POST | `/drift/analyze` | Run drift analysis |
| GET | `/nudges` | Get nudges |
| PATCH | `/nudges/read` | Mark nudges as read |

## Swagger Documentation

Once running, access auto-generated docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
