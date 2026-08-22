import { useRouter } from "expo-router";

import { LoginScreen } from "@/src/screens/Login/LoginScreen";

export default function Login() {
  const router = useRouter();

  // canGoBack() is false when /login was reached without a prior in-app
  // navigation to go back to (e.g. a direct page load / refresh on web —
  // caught by e2e/login.spec.ts). router.back() is a no-op in that case,
  // stranding the user on Login with a dead back button; replace() always
  // lands them on Splash instead.
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // Real email/password auth isn't built yet (01a-login/02); until then, a
  // submit drops the user into the main tab shell so the bottom nav and the
  // placeholder screens are reachable. `replace` so Back doesn't return here.
  const handleSubmit = () => {
    router.replace("/home");
  };

  return <LoginScreen onBack={handleBack} onSubmit={handleSubmit} />;
}
