import enum


class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    MANAGER = "manager"
    ADMIN = "admin"
    FIELD_TEAM = "field_team"
    DISPATCHER = "dispatcher"
