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

export const ROLES: { value: Role; label: string }[] = [
  { value: "citizen", label: "Cidadão" },
  { value: "field_team", label: "Equipe de Campo" },
  { value: "dispatcher", label: "Despachante" },
  { value: "secretary", label: "Secretário" },
  { value: "mayor", label: "Prefeito" },
  { value: "admin", label: "Admin" },
];

export const ROLE_BADGE_VARIANT: Record<Role, BadgeVariant> = {
  admin: "red",
  mayor: "purple",
  secretary: "purple",
  dispatcher: "blue",
  field_team: "orange",
  citizen: "gray",
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  mayor: "Prefeito",
  secretary: "Secretário",
  dispatcher: "Despachante",
  field_team: "Campo",
  citizen: "Cidadão",
};

export const DEFAULT_SORT: SortEntry[] = [
  { field: "role", dir: "asc" },
  { field: "name", dir: "asc" },
];

export const DEFAULT_SORT_DELETED: SortEntry[] = [
  { field: "deleted_at", dir: "desc" },
  { field: "name", dir: "asc" },
];

export const PAGE_SIZE = 20;
