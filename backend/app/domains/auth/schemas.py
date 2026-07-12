from pydantic import BaseModel, EmailStr, field_validator


class UserRegister(BaseModel):
    model_config = {"extra": "forbid"}

    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Пароль должен быть не менее 8 символов')
        return v


class UserLogin(UserRegister):
    model_config = {"extra": "forbid"}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
