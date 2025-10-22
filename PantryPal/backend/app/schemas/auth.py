from typing import Optional
import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from uuid import UUID

class TokenData(BaseModel):
    user_id: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1)
    role: str = "staff"  # Default role for new users

    @field_validator("password")
    def password_strength(cls, v: str) -> str:
        # enforce at least one lowercase, one uppercase and one digit
        if not re.search(r"[a-z]", v):
            raise ValueError("password must contain at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("password must contain at least one uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("password must contain at least one digit")
        return v

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True