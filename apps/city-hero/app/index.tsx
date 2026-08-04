import { SplashScreen } from "@/src/screens/Splash/SplashScreen";

// Splash is the app's cold-start entry point (docs/tasks/01-splash). Only
// task 01 (render UI) is wired up here — the init sequence, routing
// decision, force-update, and offline handling (tasks 02-05) aren't built
// yet, so there is nowhere else to hand off to once the splash is ready.
export default function Index() {
  return <SplashScreen />;
}
