"use client";

import { useTranslation } from "@city-hero/i18n";
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
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t("users.passwordMismatch"));
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
      setError(err instanceof Error ? err.message : t("errors.unknown"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={t("users.resetPasswordTitle", { name: user.name })} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label={t("users.fieldNewPassword")} htmlFor="rp-password" required>
          <Input
            id="rp-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <FormField label={t("users.fieldConfirmPassword")} htmlFor="rp-confirm" required>
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
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {t("users.actionResetPassword")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
