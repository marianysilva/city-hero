"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { AlertMessage } from "@/components/molecules/AlertMessage";
import { FormField } from "@/components/molecules/FormField";
import { Modal } from "@/components/organisms/Modal";

import { apiFetch } from "../_api";
import type { UserRow } from "../_types";

interface ResetPasswordModalProps {
  user: UserRow;
  onClose: () => void;
  onSaved: () => void;
}

export function ResetPasswordModal({ user, onClose, onSaved }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await apiFetch<void>(`/api/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={`Redefinir senha — ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nova senha" htmlFor="rp-password" required>
          <Input
            id="rp-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <FormField label="Confirmar senha" htmlFor="rp-confirm" required>
          <Input
            id="rp-confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FormField>

        {error && <AlertMessage variant="error">{error}</AlertMessage>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Redefinir senha
          </Button>
        </div>
      </form>
    </Modal>
  );
}
