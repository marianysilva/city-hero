from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "CityHero API"
    DATABASE_URL: str = "postgresql+asyncpg://cityhero:cityhero@localhost:5432/cityhero"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8081"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
