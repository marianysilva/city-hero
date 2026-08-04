"use client";

import { useLocaleContext } from "@city-hero/i18n";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { AlertMessage } from "@/components/molecules/AlertMessage";
import { FormField } from "@/components/molecules/FormField";

export default function LoginPage() {
  const router = useRouter();
  const { t, setLocale } = useLocaleContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? t("auth.invalidCredentials"));
      return;
    }

    // The login page itself may have mounted with no locale cookie yet
    // (falling back to the browser's Accept-Language), and router.push +
    // router.refresh are both client-side — they don't remount the root
    // layout's LocaleProvider, so its state would otherwise stay wrong
    // for the rest of this session regardless of what the login response
    // says. setLocale updates it immediately and persists the matching
    // cookie via onLocaleChange — see UserFormModal's onSaved for the
    // same fix applied to a self-edit mid-session.
    if (data.user?.language) setLocale(data.user.language);

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">CityHero</h1>
          <p className="text-sm text-zinc-500 mt-1">{t("dashboard.managerPanelSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t("auth.emailLabel")} htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </FormField>

          <FormField label={t("auth.passwordLabel")} htmlFor="password" required>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </FormField>

          {error && <AlertMessage variant="error">{error}</AlertMessage>}

          <Button
            type="submit"
            loading={loading}
            loadingText={t("common.loading")}
            className="w-full"
          >
            {t("auth.signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}
