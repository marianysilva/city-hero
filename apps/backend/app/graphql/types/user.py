import strawberry
from datetime import datetime
from uuid import UUID


@strawberry.type
class UserType:
    id: UUID
    email: str
    name: str
    role: str
    auth_provider: str
    avatar_url: str | None
    is_active: bool
    created_at: datetime
