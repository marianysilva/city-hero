"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { AlertMessage } from "@/components/molecules/AlertMessage";
import { FormField } from "@/components/molecules/FormField";
import { Modal } from "@/components/organisms/Modal";

import { apiFetch } from "../_api";
import { ROLES, type ModalState, type Role } from "../_types";

interface UserFormModalProps {
  modal: NonNullable<ModalState>;
  canChangeRole: boolean;
  assignableRoles: Role[];
  onClose: () => void;
  onSaved: () => void;
}

export function UserFormModal({
  modal,
  canChangeRole,
  assignableRoles,
  onClose,
  onSaved,
}: UserFormModalProps) {
  const isEdit = modal.mode === "edit";
  const editUser = isEdit ? modal.user : null;

  const defaultRole = isEdit
    ? (editUser?.role ?? "citizen")
    : (assignableRoles[assignableRoles.length - 1] ?? "citizen");

  const [name, setName] = useState(editUser?.name ?? "");
  const [email, setEmail] = useState(editUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(defaultRole);
  const [isActive, setIsActive] = useState(editUser?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleOptions = isEdit
    ? ROLES // show all roles in edit mode (field is read-only for non-admins)
    : ROLES.filter((r) => assignableRoles.includes(r.value));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isEdit && editUser) {
        const payload: Record<string, unknown> = { name, is_active: isActive };
        if (canChangeRole) payload.role = role;
        await apiFetch(`/api/users/${editUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password, role }),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={isEdit ? "Editar usuário" : "Novo usuário"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nome" htmlFor="u-name" required>
          <Input
            id="u-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <FormField label="E-mail" htmlFor="u-email" required={!isEdit}>
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
          <FormField label="Senha" htmlFor="u-password" required>
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

        <FormField label="Role" htmlFor="u-role">
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

        {isEdit && (
          <Checkbox
            id="u-active"
            label="Usuário ativo"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        )}

        {error && <AlertMessage variant="error">{error}</AlertMessage>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
