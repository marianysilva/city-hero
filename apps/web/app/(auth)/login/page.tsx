"use client";

import { Button, TextInput, useTheme } from "@city-hero/design-system";
import { useLocaleContext } from "@city-hero/i18n";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { TextInput as RNTextInput } from "react-native";

import { AlertMessage } from "@/components/molecules/AlertMessage";

import { GradientLogoMark } from "./GradientLogoMark";

export default function LoginPage() {
  const router = useRouter();
  const { t, setLocale } = useLocaleContext();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<RNTextInput>(null);

  // Design-system TextInput wraps React Native's TextInput, which has no
  // `required` concept (confirmed: react-native-web's TextInput doesn't
  // forward it to the DOM at all) — so unlike the plain-HTML version this
  // page used to have, empty-field validation is explicit here rather than
  // relying on native HTML5 constraint validation.
  async function performLogin() {
    // The password field's onSubmitEditing (Enter key) calls this directly,
    // bypassing Button's own loading/disabled gating (which only guards the
    // onPress path) — without this, two fast Enter presses fire two
    // concurrent POST /api/auth/login requests.
    if (loading) return;

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError(t("auth.emailPasswordRequired"));
      return;
    }
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <GradientLogoMark />
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900">
            {t("auth.loginHeadingAdmin")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{t("dashboard.managerPanelSubtitle")}</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            performLogin();
          }}
        >
          <TextInput
            label={t("auth.emailLabel")}
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChangeText={setEmail}
            nativeID="email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />

          <TextInput
            ref={passwordRef}
            label={t("auth.passwordLabel")}
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChangeText={setPassword}
            nativeID="password"
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={performLogin}
            rightElement={
              <button
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={
                  passwordVisible ? t("auth.hidePasswordA11y") : t("auth.showPasswordA11y")
                }
                style={{ color: colors.brand[500], fontSize: 11, fontWeight: 700 }}
              >
                {passwordVisible ? t("auth.hidePassword") : t("auth.showPassword")}
              </button>
            }
          />

          {error && <AlertMessage variant="error">{error}</AlertMessage>}

          <div className="flex justify-end">
            {/* No forgot-password flow exists yet (mobile's own
                01a-login/03-forgot-password-flow.md isn't built either) —
                same presentational-only placeholder mobile ships today. */}
            <button
              type="button"
              onClick={() => console.log("[Login] Not implemented yet: forgot password")}
              className="text-xs font-semibold"
              style={{ color: colors.brand[600] }}
            >
              {t("auth.forgotPassword")}
            </button>
          </div>

          <div className="w-full">
            <Button
              variant="primary"
              size="lg"
              nativeID="login-submit"
              onPress={performLogin}
              loading={loading}
            >
              {t("auth.signIn")}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-zinc-500">
          {t("auth.noAccountPrompt")}
          {/* No admin self-service account creation flow exists — admin
              accounts are provisioned, not self-registered. Same
              presentational-only placeholder mobile ships today. */}
          <button
            type="button"
            onClick={() => console.log("[Login] Not implemented yet: create account")}
            className="font-bold"
            style={{ color: colors.brand[600] }}
          >
            {t("auth.createAccount")}
          </button>
        </p>
      </div>
    </div>
  );
}
