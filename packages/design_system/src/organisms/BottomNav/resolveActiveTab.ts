import type { BottomNavTabKey } from "./BottomNav.types";

/**
 * Maps an Expo Router pathname to the active {@link BottomNavTabKey}, per the
 * task spec's "Route → active tab" table. This is the pure, platform-agnostic
 * core of the navigation integration: the app-side `(tabs)/_layout.tsx` feeds
 * it `usePathname()` and passes the result to `<BottomNav activeTab={...} />`,
 * keeping the route→tab rule testable in isolation (and out of the native-only
 * expo-router layer).
 *
 * Camera is a modal overlay, not a tab, so it maps to `null` (nothing
 * highlighted). Any unrecognized route also returns `null` — the "Unknown
 * route" edge case where no icon is highlighted.
 */
export function resolveActiveTab(pathname: string): BottomNavTabKey | null {
  // Normalize: drop query/hash, trailing slash, and a leading slash.
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "").replace(/^\//, "");
  const segment = path.split("/")[0] ?? "";

  switch (segment) {
    case "":
    case "home":
    case "map":
      return "home";
    case "feed":
      return "feed";
    case "profile":
      return "profile";
    // The "More" sub-destinations all keep the More tab highlighted.
    case "more":
    case "my-reports":
    case "notifications":
    case "news":
    case "city-profile":
    case "programs":
    case "services":
    case "sync-queue":
    case "settings":
      return "more";
    // Camera is an overlaid modal — no tab is active.
    case "camera":
      return null;
    default:
      return null;
  }
}
