"use client";

import { useLocaleContext } from "@city-hero/i18n";
import {
  PencilIcon,
  PlusIcon,
  KeyIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Tabs } from "@/components/atoms/Tabs";
import { Tooltip } from "@/components/atoms/Tooltip";
import { AlertMessage } from "@/components/molecules/AlertMessage";
import { ConfirmDialog } from "@/components/organisms/ConfirmDialog";
import { DataTable, type Column } from "@/components/organisms/DataTable";
import type { SortEntry } from "@/components/organisms/DataTable";
import { Pagination } from "@/components/organisms/Pagination";

import { ResetPasswordModal } from "./_components/ResetPasswordModal";
import { RoleBadge } from "./_components/RoleBadge";
import { StatusBadge } from "./_components/StatusBadge";
import { UserFormModal } from "./_components/UserFormModal";
import { UserSearchBar } from "./_components/UserSearchBar";
import { useCurrentUser } from "./_hooks/useCurrentUser";
import { useUsers } from "./_hooks/useUsers";
import {
  DEFAULT_SORT,
  DEFAULT_SORT_DELETED,
  PAGE_SIZE,
  type ModalState,
  type UserRow,
  type UserStatus,
} from "./_types";

export default function UsersPage() {
  const { t, formatDateTime } = useLocaleContext();
  const TAB_LABELS: Record<UserStatus, string> = {
    active: t("users.tabActive"),
    inactive: t("users.tabInactive"),
    deleted: t("users.tabDeleted"),
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlQ = searchParams.get("q") ?? "";
  const urlPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const VALID_TABS: UserStatus[] = ["active", "inactive", "deleted"];
  const rawTab = searchParams.get("tab");
  const urlTab: UserStatus = VALID_TABS.includes(rawTab as UserStatus)
    ? (rawTab as UserStatus)
    : "active";

  const [inputValue, setInputValue] = useState(urlQ);
  useEffect(() => {
    // Re-sync the editable search box when urlQ changes from outside this
    // component (e.g. back/forward navigation), without clobbering in-progress typing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(urlQ);
  }, [urlQ]);

  const [sort, setSort] = useState<SortEntry[]>(() =>
    urlTab === "deleted" ? DEFAULT_SORT_DELETED : DEFAULT_SORT,
  );
  const [modal, setModal] = useState<ModalState>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  const {
    isAdmin,
    canCreate,
    canEdit,
    isLoading: permissionsLoading,
    error: permissionsError,
    assignableRoles,
    canManageUser,
  } = useCurrentUser();

  const {
    users,
    total,
    loading,
    fetchError,
    deleteLoading,
    deleteError,
    setDeleteError,
    deleteUser,
    restoreLoading,
    restoreError,
    setRestoreError,
    restoreUser,
    fetchUsers,
  } = useUsers();

  useEffect(() => {
    fetchUsers(urlPage, sort, urlQ, urlTab);
  }, [urlPage, sort, urlQ, urlTab, fetchUsers]);

  function pushUrl(overrides: { q?: string; page?: number; tab?: UserStatus }) {
    const params = new URLSearchParams();
    const newQ = "q" in overrides ? (overrides.q ?? "") : urlQ;
    const newPage = overrides.page ?? 1;
    const newTab = "tab" in overrides ? (overrides.tab ?? "active") : urlTab;
    if (newQ) params.set("q", newQ);
    if (newPage > 1) params.set("page", String(newPage));
    if (newTab !== "active") params.set("tab", newTab);
    const qs = params.toString();
    router.push(pathname + (qs ? `?${qs}` : ""));
  }

  function handleTabChange(tab: string) {
    const newTab = tab as UserStatus;
    setSort(newTab === "deleted" ? DEFAULT_SORT_DELETED : DEFAULT_SORT);
    pushUrl({ tab: newTab, page: 1 });
  }

  function handleSort(field: string, append: boolean) {
    setSort((prev) => {
      const idx = prev.findIndex((s) => s.field === field);
      const existing = prev[idx];
      if (!append) {
        if (prev.length === 1 && existing)
          return [{ field, dir: existing.dir === "asc" ? "desc" : "asc" }];
        return [{ field, dir: "asc" }];
      }
      if (existing) {
        const next = [...prev];
        next[idx] = { field, dir: existing.dir === "asc" ? "desc" : "asc" };
        return next;
      }
      return [...prev, { field, dir: "asc" }];
    });
    pushUrl({ page: 1 });
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    try {
      await deleteUser(confirmDelete.id);
      setConfirmDelete(null);
      fetchUsers(urlPage, sort, urlQ, urlTab);
    } catch {
      // error surfaced via deleteError state
    }
  }

  async function handleRestore(user: UserRow) {
    setRestoreError(null);
    try {
      await restoreUser(user.id);
      fetchUsers(urlPage, sort, urlQ, urlTab);
    } catch {
      // error surfaced via restoreError state
    }
  }

  const baseColumns: Column<UserRow>[] = [
    {
      key: "name",
      header: t("users.colName"),
      sortKey: "name",
      render: (u) => <span className="font-medium text-zinc-900">{u.name}</span>,
    },
    {
      key: "email",
      header: t("users.colEmail"),
      sortKey: "email",
      render: (u) => <span className="text-zinc-600">{u.email}</span>,
    },
    {
      key: "role",
      header: t("users.colRole"),
      sortKey: "role",
      render: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: "created_at",
      header: t("users.colCreatedAt"),
      sortKey: "created_at",
      render: (u) => (
        <span className="text-zinc-400">
          {formatDateTime(new Date(u.createdAt), { dateStyle: "short" })}
        </span>
      ),
    },
  ];

  const activeColumns: Column<UserRow>[] = [
    ...baseColumns,
    {
      key: "status",
      header: t("users.colStatus"),
      sortKey: "status",
      render: (u) => <StatusBadge active={u.isActive} />,
    },
    {
      key: "provider",
      header: t("users.colProvider"),
      render: (u) => <span className="text-zinc-500 capitalize">{u.authProvider}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (u) => (
        <div className="flex items-center gap-1 justify-end">
          {!permissionsLoading && canEdit && canManageUser(u.role) && (
            <Tooltip label={t("users.actionEdit")}>
              <button
                aria-label={t("users.ariaEditUser")}
                onClick={() => setModal({ mode: "edit", user: u })}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
          {!permissionsLoading && isAdmin && (
            <Tooltip label={t("users.actionResetPassword")}>
              <button
                aria-label={t("users.actionResetPassword")}
                onClick={() => setResetPasswordUser(u)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <KeyIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
          {!permissionsLoading && canEdit && canManageUser(u.role) && (
            <Tooltip label={t("users.actionDelete")}>
              <button
                aria-label={t("users.ariaDeleteUser")}
                onClick={() => {
                  setDeleteError(null);
                  setConfirmDelete(u);
                }}
                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const deletedColumns: Column<UserRow>[] = [
    ...baseColumns,
    {
      key: "deleted_at",
      header: t("users.colDeletedAt"),
      sortKey: "deleted_at",
      render: (u) => (
        <span className="text-red-400">
          {u.deletedAt ? formatDateTime(new Date(u.deletedAt), { dateStyle: "short" }) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-16",
      render: (u) => (
        <div className="flex items-center gap-1 justify-end">
          {!permissionsLoading && canEdit && canManageUser(u.role) && (
            <Tooltip label={t("users.actionRestore")}>
              <button
                aria-label={t("users.ariaRestoreUser")}
                onClick={() => handleRestore(u)}
                disabled={restoreLoading}
                className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const columns = urlTab === "deleted" ? deletedColumns : activeColumns;

  const tabs = (["active", "inactive", "deleted"] as UserStatus[]).map((id) => ({
    id,
    label: TAB_LABELS[id],
    count: id === urlTab ? total : undefined,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("users.title")}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {t("users.userCount", { count: total })}
            {urlQ && (
              <span className="text-zinc-400"> {t("users.searchResultsFor", { query: urlQ })}</span>
            )}
          </p>
        </div>
        {!permissionsLoading && canCreate && urlTab !== "deleted" && (
          <Button variant="primary" onClick={() => setModal({ mode: "create" })}>
            <PlusIcon className="w-4 h-4" />
            {t("users.newUser")}
          </Button>
        )}
      </div>

      {permissionsError && (
        <div className="mb-4">
          <AlertMessage variant="error">{permissionsError}</AlertMessage>
        </div>
      )}

      {restoreError && (
        <div className="mb-4">
          <AlertMessage variant="error">{restoreError}</AlertMessage>
        </div>
      )}

      <UserSearchBar
        value={inputValue}
        onChange={setInputValue}
        onSubmit={() => pushUrl({ q: inputValue.trim(), page: 1 })}
        onClear={() => {
          setInputValue("");
          pushUrl({ q: "", page: 1 });
        }}
        hasActiveQuery={!!urlQ}
      />

      <Tabs items={tabs} active={urlTab} onChange={handleTabChange} className="mt-4 mb-0" />

      <DataTable
        columns={columns}
        rows={users}
        keyFn={(u) => u.id}
        loading={loading}
        error={fetchError}
        emptyMessage={
          urlQ ? t("users.emptySearchResult", { query: urlQ }) : t("users.emptyNoUsers")
        }
        sort={sort}
        onSort={handleSort}
      />

      <Pagination
        page={urlPage}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        onPageChange={(p) => pushUrl({ page: p })}
      />

      {modal && (
        <UserFormModal
          modal={modal}
          canChangeRole={isAdmin}
          assignableRoles={assignableRoles}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            fetchUsers(urlPage, sort, urlQ, urlTab);
          }}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onSaved={() => setResetPasswordUser(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={t("users.deleteConfirmTitle")}
          description={
            <>
              <strong>{confirmDelete.name}</strong> ({confirmDelete.email}){" "}
              {t("users.deleteConfirmDescription")}
            </>
          }
          confirmLabel={t("users.actionDelete")}
          confirmVariant="danger"
          loading={deleteLoading}
          error={deleteError}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
