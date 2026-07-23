import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.role import Role


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Nullable to support Gov.br OAuth users who authenticate without a local password.
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="citizen", nullable=False)
    # "email" | "govbr" — determines which login flow is valid for this user.
    auth_provider: Mapped[str] = mapped_column(String(50), default="email", nullable=False)
    # "pt-BR" | "en-US" — see packages/i18n's SUPPORTED_LOCALES. Defaults to
    # en-US (00-foundation/13-i18n.md); the mobile client may pass a detected
    # or user-chosen value at registration instead.
    language: Mapped[str] = mapped_column(String(5), default="en-US", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    # Soft delete — null means active; timestamp means deactivated.
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # FK to roles table. Nullable during transition; populated via migration backfill.
    role_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    # lazy="raise" prevents accidental N+1 loads — all permission checks go
    # through rbac_cache, not through this relationship.
    role_obj: Mapped["Role | None"] = relationship(
        "Role",
        foreign_keys=[role_id],
        lazy="raise",
    )
