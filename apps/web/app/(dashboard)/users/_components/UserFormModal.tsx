"use client";

import { FALLBACK_LOCALE, useTranslation } from "@city-hero/i18n";
import type { Locale } from "@city-hero/i18n";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { AlertMessage } from "@/components/molecules/AlertMessage";
import { FormField } from "@/components/molecules/FormField";
import { Modal } from "@/components/organisms/Modal";

import { apiFetch } from "../_api";
import {
  getLanguageOptions,
  getRoleOptions,
  type ModalState,
  type Role,
  type UserRow,
} from "../_types";

interface UserFormModalProps {
  modal: NonNullable<ModalState>;
  canChangeRole: boolean;
  assignableRoles: Role[];
  onClose: () => void;
  // Receives the backend's saved user (including its resolved `language`)
  // so a caller can tell whether this was a self-edit and react to a
  // language change immediately — see page.tsx's onSaved handler.
  onSaved: (saved: UserRow) => void;
}

export function UserFormModal({
  modal,
  canChangeRole,
  assignableRoles,
  onClose,
  onSaved,
}: UserFormModalProps) {
  const { t } = useTranslation();
  const isEdit = modal.mode === "edit";
  const editUser = isEdit ? modal.user : null;

  const defaultRole = isEdit
    ? (editUser?.role ?? "citizen")
    : (assignableRoles[assignableRoles.length - 1] ?? "citizen");

  const [name, setName] = useState(editUser?.name ?? "");
  const [email, setEmail] = useState(editUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(defaultRole);
  const [language, setLanguage] = useState<Locale>(editUser?.language ?? FALLBACK_LOCALE);
  const [isActive, setIsActive] = useState(editUser?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const allRoles = getRoleOptions(t);
  const roleOptions = isEdit
    ? allRoles // show all roles in edit mode (field is read-only for non-admins)
    : allRoles.filter((r) => assignableRoles.includes(r.value));
  const languageOptions = getLanguageOptions(t);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let saved: UserRow | undefined;
      if (isEdit && editUser) {
        const payload: Record<string, unknown> = { name, isActive, language };
        if (canChangeRole) payload.role = role;
        saved = await apiFetch<UserRow>(`/api/users/${editUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        saved = await apiFetch<UserRow>("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password, role, language }),
        });
      }
      if (saved) onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unknown"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={isEdit ? t("users.editUserTitle") : t("users.newUser")} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label={t("users.colName")} htmlFor="u-name" required>
          <Input
            id="u-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <FormField label={t("users.colEmail")} htmlFor="u-email" required={!isEdit}>
          <Input
            id="u-email"
            type="email"
            required={!isEdit}
            disabled={isEdit}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        {!isEdit && (
          <FormField label={t("users.fieldPassword")} htmlFor="u-password" required>
            <Input
              id="u-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
        )}

        <FormField label={t("users.colRole")} htmlFor="u-role">
          <Select
            id="u-role"
            value={role}
            disabled={isEdit && !canChangeRole}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label={t("users.colLanguage")} htmlFor="u-language">
          <Select
            id="u-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Locale)}
          >
            {languageOptions.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </FormField>

        {isEdit && (
          <Checkbox
            id="u-active"
            label={t("users.fieldActiveUser")}
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        )}

        {error && <AlertMessage variant="error">{error}</AlertMessage>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText={t("common.loading")}
          >
            {isEdit ? t("common.save") : t("users.actionCreate")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
