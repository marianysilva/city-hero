import { ThemeProvider as DesignSystemThemeProvider, useTheme } from "@city-hero/design-system";
import type { Locale } from "@city-hero/i18n";
import { LocaleProvider } from "@city-hero/i18n";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { persistLocale, resolveInitialLocale } from "../lib/i18n";
import { ReactQueryProvider } from "../lib/ReactQueryProvider";
import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  // null while the persisted choice (or device default) is still loading —
  // same async-gate shape as `useFonts`' `loaded`, so the splash screen
  // doesn't hide until both are ready.
  const [initialLocale, setInitialLocale] = useState<Locale | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    let cancelled = false;
    resolveInitialLocale().then((locale) => {
      if (!cancelled) {
        setInitialLocale(locale);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = loaded && initialLocale !== null;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return <RootLayoutNav initialLocale={initialLocale} />;
}

function RootLayoutNav({ initialLocale }: { initialLocale: Locale }) {
  return (
    <ReactQueryProvider>
      <LocaleProvider initialLocale={initialLocale} onLocaleChange={persistLocale}>
        <DesignSystemThemeProvider>
          <NavigationThemeBridge />
        </DesignSystemThemeProvider>
      </LocaleProvider>
    </ReactQueryProvider>
  );
}

// Drives expo-router's nav chrome (header/tab bar) from the design system's
// resolved theme, so a manual `setPreference()` override affects the whole
// app instead of just design-system-styled content.
function NavigationThemeBridge() {
  const { scheme } = useTheme();

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false, presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
