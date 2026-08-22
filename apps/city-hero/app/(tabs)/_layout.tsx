import { Tabs } from "expo-router";

import { AppBottomNav } from "@/src/navigation/AppBottomNav";

// The main app shell. Uses Expo Router's `Tabs` for state preservation across
// tabs, but replaces the default tab bar with the design system's `BottomNav`
// (via `AppBottomNav`). `home`/`feed`/`profile` are the routable tabs; the
// "More" sheet's destinations (`notifications`/`my-reports`/`settings`) live in
// this group too — so they keep the nav and highlight the More tab — but are
// hidden from the (unused) default tab bar with `href: null`.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => <AppBottomNav />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="my-reports" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
