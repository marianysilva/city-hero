import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # unique=True already creates a unique index — index=True would be redundant.
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    # Lower number = higher privilege. admin=0, mayor=1, ..., citizen=5
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    # When True, has_permission() short-circuits to True for any permission string.
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # lazy="raise" — load_permission_cache uses explicit selectinload(); all other
    # callers should go through the cache, not through this relationship.
    permissions: Mapped[list["Permission"]] = relationship(
        secondary="role_permissions",
        back_populates="roles",
        lazy="raise",
    )


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # unique=True already creates a unique index — index=True would be redundant.
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Never traversed in any code path — raise if accessed to catch accidental lazy loads.
    roles: Mapped[list["Role"]] = relationship(
        secondary="role_permissions",
        back_populates="permissions",
        lazy="raise",
    )


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    )
