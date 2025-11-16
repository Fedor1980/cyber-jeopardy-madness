"""
JWT Authentication Module
Enterprise-grade authentication with JWT tokens, role-based access control (RBAC).
"""
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import os
import bcrypt
from enum import Enum

# Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '30'))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv('REFRESH_TOKEN_EXPIRE_DAYS', '7'))

# Security
security = HTTPBearer()

# User Roles
class UserRole(str, Enum):
    ADMIN = "admin"
    DATA_OWNER = "data_owner"
    DATA_CONSUMER = "data_consumer"
    AUDITOR = "auditor"
    READ_ONLY = "read_only"

# Models
class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: str = Field(..., description="Subject (user ID)")
    email: str = Field(..., description="User email")
    roles: List[UserRole] = Field(..., description="User roles")
    exp: datetime = Field(..., description="Expiration time")
    iat: datetime = Field(..., description="Issued at time")
    scope: List[str] = Field(default=[], description="Permission scopes")

class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class LoginRequest(BaseModel):
    """Login request."""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

class User(BaseModel):
    """User model."""
    id: str
    email: str
    roles: List[UserRole]
    is_active: bool = True
    created_at: datetime
    last_login: Optional[datetime] = None

# Mock user database (replace with real database in production)
USERS_DB = {
    "admin@sovereignscroll.io": {
        "id": "user_001",
        "email": "admin@sovereignscroll.io",
        "password_hash": bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode(),
        "roles": [UserRole.ADMIN],
        "is_active": True,
        "created_at": datetime.utcnow()
    },
    "user@example.com": {
        "id": "user_002",
        "email": "user@example.com",
        "password_hash": bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode(),
        "roles": [UserRole.DATA_CONSUMER],
        "is_active": True,
        "created_at": datetime.utcnow()
    }
}

# Permission scopes by role
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        "scrolls:read",
        "scrolls:write",
        "scrolls:delete",
        "users:read",
        "users:write",
        "policies:read",
        "policies:write",
        "audit:read"
    ],
    UserRole.DATA_OWNER: [
        "scrolls:read",
        "scrolls:write",
        "policies:read",
        "audit:read"
    ],
    UserRole.DATA_CONSUMER: [
        "scrolls:read",
        "scrolls:search"
    ],
    UserRole.AUDITOR: [
        "scrolls:read",
        "audit:read"
    ],
    UserRole.READ_ONLY: [
        "scrolls:read"
    ]
}

def create_access_token(user_id: str, email: str, roles: List[UserRole]) -> str:
    """Create JWT access token."""
    # Collect all permissions from roles
    scopes = []
    for role in roles:
        scopes.extend(ROLE_PERMISSIONS.get(role, []))
    scopes = list(set(scopes))  # Remove duplicates

    payload = {
        "sub": user_id,
        "email": email,
        "roles": [role.value for role in roles],
        "scope": scopes,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token

def create_refresh_token(user_id: str) -> str:
    """Create JWT refresh token."""
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token

def verify_token(token: str) -> TokenPayload:
    """Verify and decode JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])

        return TokenPayload(
            sub=payload["sub"],
            email=payload["email"],
            roles=[UserRole(role) for role in payload["roles"]],
            exp=datetime.fromtimestamp(payload["exp"]),
            iat=datetime.fromtimestamp(payload["iat"]),
            scope=payload.get("scope", [])
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )

def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate user with email and password."""
    user = USERS_DB.get(email)
    if not user:
        return None

    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return None

    if not user.get("is_active", False):
        return None

    return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> TokenPayload:
    """Get current authenticated user from JWT token."""
    token = credentials.credentials
    return verify_token(token)

async def get_current_active_user(
    current_user: TokenPayload = Depends(get_current_user)
) -> TokenPayload:
    """Get current active user."""
    # Additional checks can be added here (e.g., user still active in DB)
    return current_user

def require_permission(permission: str):
    """Dependency to require specific permission."""
    async def permission_checker(
        current_user: TokenPayload = Depends(get_current_active_user)
    ):
        if permission not in current_user.scope:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required: {permission}"
            )
        return current_user

    return permission_checker

def require_role(*required_roles: UserRole):
    """Dependency to require specific role(s)."""
    async def role_checker(
        current_user: TokenPayload = Depends(get_current_active_user)
    ):
        if not any(role in current_user.roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient privileges. Required roles: {required_roles}"
            )
        return current_user

    return role_checker

# Login endpoint function
def login(request: LoginRequest) -> TokenResponse:
    """Login user and return JWT tokens."""
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        user_id=user["id"],
        email=user["email"],
        roles=user["roles"]
    )

    refresh_token = create_refresh_token(user_id=user["id"])

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
