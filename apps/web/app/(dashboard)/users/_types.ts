import type { TFunction } from "@city-hero/i18n";

import type { BadgeVariant } from "@/components/atoms/Badge";
import type { SortEntry } from "@/components/organisms/DataTable";

export type Role = "citizen" | "field_team" | "dispatcher" | "secretary" | "mayor" | "admin";
export type UserStatus = "active" | "inactive" | "deleted";

export interface RoleInfo {
  name: string;
  rank: number;
  isSuperuser: boolean;
}

export interface Capabilities {
  permissions: string[];
  assignableRoles: Role[];
  manageableRoles: Role[];
}

export interface CurrentUser extends UserRow {
  roleInfo: RoleInfo;
  capabilities: Capabilities;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  authProvider: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface UsersListResponse {
  users: UserRow[];
  total: number;
  page: number;
  pageSize: number;
}

export type ModalState = { mode: "create" } | { mode: "edit"; user: UserRow } | null;

// Full labels (e.g. the role <select> dropdown) — takes `t` as a param
// instead of a hook since this module has no React component of its own.
export function getRoleOptions(t: TFunction): { value: Role; label: string }[] {
  return [
    { value: "citizen", label: t("users.roleFullCitizen") },
    { value: "field_team", label: t("users.roleFullFieldTeam") },
    { value: "dispatcher", label: t("users.roleFullDispatcher") },
    { value: "secretary", label: t("users.roleFullSecretary") },
    { value: "mayor", label: t("users.roleFullMayor") },
    { value: "admin", label: t("users.roleFullAdmin") },
  ];
}

export const ROLE_BADGE_VARIANT: Record<Role, BadgeVariant> = {
  admin: "red",
  mayor: "purple",
  secretary: "purple",
  dispatcher: "blue",
  field_team: "orange",
  citizen: "gray",
};

// Short labels (role badges, sidebar footer) — only differs from the full
// label for field_team ("Field"/"Campo" vs "Field Team"/"Equipe de Campo").
export function getRoleLabelShort(t: TFunction, role: Role): string {
  const SHORT_KEYS: Record<
    Role,
    | "roleShortCitizen"
    | "roleShortFieldTeam"
    | "roleShortDispatcher"
    | "roleShortSecretary"
    | "roleShortMayor"
    | "roleShortAdmin"
  > = {
    citizen: "roleShortCitizen",
    field_team: "roleShortFieldTeam",
    dispatcher: "roleShortDispatcher",
    secretary: "roleShortSecretary",
    mayor: "roleShortMayor",
    admin: "roleShortAdmin",
  };
  return t(`users.${SHORT_KEYS[role]}`);
}

export const DEFAULT_SORT: SortEntry[] = [
  { field: "role", dir: "asc" },
  { field: "name", dir: "asc" },
];

export const DEFAULT_SORT_DELETED: SortEntry[] = [
  { field: "deleted_at", dir: "desc" },
  { field: "name", dir: "asc" },
];

export const PAGE_SIZE = 20;
