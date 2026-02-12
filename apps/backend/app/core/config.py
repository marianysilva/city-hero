from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "CityHero API"
    DATABASE_URL: str = "postgresql+asyncpg://cityhero:cityhero@localhost:5432/cityhero"
    # Required — no default. Generate with: openssl rand -hex 32
    SECRET_KEY: str
    DEBUG: bool = False

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_strong(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError(
                "SECRET_KEY must be at least 32 characters. "
                "Generate a secure key with: openssl rand -hex 32"
            )
        return v
    # Short-lived access tokens; implement refresh tokens for longer sessions.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8081"

    # Bootstrap users — created once on first startup, skipped if already exists.
    # Leave empty to disable seeding (e.g. in CI or test environments).
    # APP_USERS_PASSWORD seeds one user per non-admin role at <role>@cityhero.com.
    APP_ADMIN: str = ""
    APP_ADMIN_PASSWORD: str = ""
    APP_USERS_PASSWORD: str = ""

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
