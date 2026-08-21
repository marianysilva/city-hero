import {
  BottomNav,
  resolveActiveTab,
  type BottomNavItem,
  type BottomNavMoreItem,
  type BottomNavTabKey,
} from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Emoji stand in for the real icon set (the design system ships no icon
// library yet — same approach as LogoMark).
const TAB_ICONS: Record<BottomNavTabKey, string> = {
  home: "🗺️",
  feed: "📰",
  profile: "🙂",
  more: "☰",
};

// `as const` keeps these as literal route strings so they satisfy expo-router's
// typed-routes `Href` union (a plain `string` would not).
const TAB_ROUTES = {
  home: "/home",
  feed: "/feed",
  profile: "/profile",
} as const satisfies Record<Exclude<BottomNavTabKey, "more">, string>;

/**
 * Wires the design system's presentational `BottomNav` to Expo Router: it's
 * rendered as the tabs group's custom `tabBar`, derives the active tab from
 * the current pathname, and turns each callback into a real navigation. This
 * is the app-side integration the `03-bottom-nav-component` task deferred until
 * routable screens existed — the component itself stays route/nav-agnostic.
 *
 * (Haptics — `expo-haptics` — are still to be added here; the module isn't a
 * dependency yet, and it's a no-op on web where the e2e suite runs.)
 */
export function AppBottomNav() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const items: BottomNavItem[] = [
    { key: "home", label: t("nav.map"), icon: TAB_ICONS.home },
    { key: "feed", label: t("nav.feed"), icon: TAB_ICONS.feed },
    { key: "profile", label: t("nav.profile"), icon: TAB_ICONS.profile },
    { key: "more", label: t("nav.more"), icon: TAB_ICONS.more },
  ];

  const moreItems: BottomNavMoreItem[] = [
    {
      key: "notifications",
      label: t("nav.notifications"),
      icon: "🔔",
      onPress: () => router.navigate("/notifications"),
    },
    {
      key: "my-reports",
      label: t("nav.myReports"),
      icon: "📋",
      onPress: () => router.navigate("/my-reports"),
    },
    {
      key: "settings",
      label: t("nav.settings"),
      icon: "⚙️",
      onPress: () => router.navigate("/settings"),
    },
    // "Logout" drops back to the cold-start (Splash) route until real auth lands.
    { key: "logout", label: t("nav.logout"), icon: "🚪", onPress: () => router.replace("/") },
  ];

  return (
    <BottomNav
      activeTab={resolveActiveTab(pathname)}
      items={items}
      onTabPress={(key) => {
        if (key !== "more") router.navigate(TAB_ROUTES[key]);
      }}
      fab={{
        accessibilityLabel: t("nav.cameraA11yLabel"),
        onPress: () => router.push("/camera"),
      }}
      moreItems={moreItems}
      bottomInset={insets.bottom}
      moreCloseAccessibilityLabel={t("nav.closeMore")}
    />
  );
}
