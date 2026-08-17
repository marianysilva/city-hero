import { useRouter } from "expo-router";

import { SplashScreen } from "@/src/screens/Splash/SplashScreen";

// Splash is the app's cold-start entry point (docs/tasks/01-splash). Only
// task 01 (render UI) is wired up here — the init sequence, routing
// decision, force-update, and offline handling (tasks 02-05) aren't built
// yet, so there is nowhere else to hand off to once the splash is ready
// (onReady is left unset). The email CTA does have somewhere to go now
// (01a-login/01-render-login-ui.md), so that one navigation is wired.
export default function Index() {
  const router = useRouter();

  return <SplashScreen onEmailLogin={() => router.push("/login")} />;
}
