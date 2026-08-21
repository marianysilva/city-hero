import { fireEvent, render, screen } from "@testing-library/react";
import { View } from "react-native";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "../../theme/ThemeProvider";

import { BottomNav, type BottomNavProps } from "./BottomNav";
import type { BottomNavItem, BottomNavMoreItem } from "./BottomNav.types";
import { resolveActiveTab } from "./resolveActiveTab";

function baseItems(
  overrides: Partial<Record<string, Partial<BottomNavItem>>> = {},
): BottomNavItem[] {
  const defs: BottomNavItem[] = [
    { key: "home", label: "Mapa", icon: "🗺️" },
    { key: "feed", label: "Feed", icon: "📰" },
    { key: "profile", label: "Perfil", icon: "🙂" },
    { key: "more", label: "Mais", icon: "⋯" },
  ];
  return defs.map((d) => ({ ...d, ...overrides[d.key] }));
}

function renderNav(props: Partial<BottomNavProps> = {}) {
  const onTabPress = vi.fn();
  const onFabPress = vi.fn();
  const onMorePress = vi.fn();
  const moreItems: BottomNavMoreItem[] = props.moreItems ?? [
    { key: "notifications", label: "Notificações", icon: "🔔", badgeCount: 3, onPress: vi.fn() },
    { key: "sync-queue", label: "Fila", icon: "🔄", badgeCount: 0, onPress: vi.fn() },
    { key: "settings", label: "Configurações", icon: "⚙️", onPress: vi.fn() },
  ];
  const utils = render(
    <ThemeProvider initialPreference="light">
      <BottomNav
        activeTab="home"
        items={baseItems()}
        onTabPress={onTabPress}
        fab={{ accessibilityLabel: "Tirar foto", onPress: onFabPress }}
        moreItems={moreItems}
        onMorePress={onMorePress}
        moreCloseAccessibilityLabel="Fechar"
        {...props}
      />
    </ThemeProvider>,
  );
  return { ...utils, onTabPress, onFabPress, onMorePress, moreItems };
}

describe("BottomNav", () => {
  it("renders the 4 tabs and the center Camera FAB", () => {
    renderNav();
    for (const key of ["home", "feed", "profile", "more"]) {
      expect(screen.getByTestId(`nav-tab-${key}`)).toBeTruthy();
    }
    expect(screen.getByTestId("nav-fab-camera")).toBeTruthy();
    expect(screen.getByLabelText("Tirar foto")).toBeTruthy();
  });

  it("marks only the active tab as selected", () => {
    renderNav({ activeTab: "feed" });
    expect(screen.getByTestId("nav-tab-feed")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("nav-tab-home")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("nav-tab-profile")).toHaveAttribute("aria-selected", "false");
  });

  it("highlights no tab when the route maps to none (activeTab=null)", () => {
    renderNav({ activeTab: null });
    for (const key of ["home", "feed", "profile", "more"]) {
      expect(screen.getByTestId(`nav-tab-${key}`)).toHaveAttribute("aria-selected", "false");
    }
  });

  it("fires onTabPress with the tapped key, not the FAB handler", () => {
    const { onTabPress, onFabPress } = renderNav();
    fireEvent.click(screen.getByTestId("nav-tab-feed"));
    expect(onTabPress).toHaveBeenCalledWith("feed");
    expect(onTabPress).toHaveBeenCalledTimes(1);
    expect(onFabPress).not.toHaveBeenCalled();
  });

  it("fires the FAB handler on Camera press, and never routes it as a tab", () => {
    const { onFabPress, onTabPress } = renderNav();
    fireEvent.click(screen.getByTestId("nav-fab-camera"));
    expect(onFabPress).toHaveBeenCalledTimes(1);
    expect(onTabPress).not.toHaveBeenCalled();
  });

  it("opens the More sheet on More press without routing it as a tab", () => {
    const { onMorePress, onTabPress } = renderNav();
    expect(screen.queryByTestId("more-item-settings")).toBeNull();

    fireEvent.click(screen.getByTestId("nav-tab-more"));

    expect(onMorePress).toHaveBeenCalledTimes(1);
    expect(onTabPress).not.toHaveBeenCalledWith("more");
    expect(screen.getByTestId("more-item-settings")).toBeTruthy();
    expect(screen.getByText("Configurações")).toBeTruthy();
  });

  it("shows a badge only for More items with a positive count", () => {
    renderNav();
    fireEvent.click(screen.getByTestId("nav-tab-more"));
    // notifications has 3 -> visible; sync-queue has 0 -> hidden.
    expect(screen.getByText("3")).toBeTruthy();
    const syncRow = screen.getByTestId("more-item-sync-queue");
    expect(syncRow.textContent).toContain("Fila");
    expect(syncRow.textContent).not.toContain("0");
  });

  it("fires a More item's own onPress and dismisses the sheet on select", () => {
    const settingsPress = vi.fn();
    renderNav({
      moreItems: [{ key: "settings", label: "Configurações", onPress: settingsPress }],
    });
    fireEvent.click(screen.getByTestId("nav-tab-more"));
    fireEvent.click(screen.getByTestId("more-item-settings"));
    expect(settingsPress).toHaveBeenCalledTimes(1);
    // Selecting an item closes the sheet (the bar is persistent chrome).
    expect(screen.queryByTestId("more-item-settings")).toBeNull();
  });

  it("closes the More sheet when the backdrop (tap-outside) is pressed", () => {
    renderNav();
    fireEvent.click(screen.getByTestId("nav-tab-more"));
    expect(screen.getByTestId("more-item-settings")).toBeTruthy();

    fireEvent.click(screen.getByTestId("more-sheet-backdrop"));
    expect(screen.queryByTestId("more-item-settings")).toBeNull();
  });

  it("does NOT close the sheet when a tap lands on the panel background (not a row)", () => {
    // Guards the inner stop-propagation Pressable: a tap on the panel itself
    // (padding/handle area) must not bubble to the backdrop and dismiss.
    renderNav();
    fireEvent.click(screen.getByTestId("nav-tab-more"));
    expect(screen.getByTestId("more-item-settings")).toBeTruthy();

    fireEvent.click(screen.getByTestId("more-sheet-panel"));
    // Still open — only the backdrop or selecting a row dismisses.
    expect(screen.getByTestId("more-item-settings")).toBeTruthy();
  });

  it("caps a large More-sheet row badge count at 9+", () => {
    renderNav({
      moreItems: [{ key: "sync-queue", label: "Fila", badgeCount: 42, onPress: vi.fn() }],
    });
    fireEvent.click(screen.getByTestId("nav-tab-more"));
    expect(screen.getByText("9+")).toBeTruthy();
  });

  it("renders a non-string icon element (e.g. SVG) without wrapping it in Text", () => {
    renderNav({
      items: baseItems({ home: { icon: <View testID="custom-home-icon" /> } }),
    });
    expect(screen.getByTestId("custom-home-icon")).toBeTruthy();
  });

  it("caps a large tab badge count at 9+", () => {
    renderNav({ items: baseItems({ more: { badgeCount: 42 } }) });
    expect(screen.getByText("9+")).toBeTruthy();
  });

  it("renders a tab badge for a positive count and none for zero", () => {
    const { unmount } = renderNav({ items: baseItems({ feed: { badgeCount: 5 } }) });
    expect(screen.getByText("5")).toBeTruthy();
    unmount();

    renderNav({ items: baseItems({ feed: { badgeCount: 0 } }) });
    // The only "0"-free render: no badge text node with "0".
    expect(screen.queryByText("0")).toBeNull();
  });

  it("exposes each tab with the tab role and its translated name", () => {
    renderNav();
    expect(screen.getByRole("tab", { name: "Mapa" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Feed" })).toBeTruthy();
  });

  it("prefers an explicit accessibilityLabel over the visible label", () => {
    renderNav({ items: baseItems({ home: { accessibilityLabel: "Mapa da cidade" } }) });
    expect(screen.getByRole("tab", { name: "Mapa da cidade" })).toBeTruthy();
  });
});

describe("resolveActiveTab", () => {
  it.each([
    ["/", "home"],
    ["/home", "home"],
    ["/map", "home"],
    ["/feed", "feed"],
    ["/profile", "profile"],
    ["/more", "more"],
    ["/my-reports", "more"],
    ["/notifications", "more"],
    ["/news", "more"],
    ["/city-profile", "more"],
    ["/programs", "more"],
    ["/services", "more"],
    ["/sync-queue", "more"],
    ["/settings", "more"],
  ] as const)("maps %s -> %s", (path, expected) => {
    expect(resolveActiveTab(path)).toBe(expected);
  });

  it("maps the Camera modal route to null (no active tab)", () => {
    expect(resolveActiveTab("/camera")).toBeNull();
  });

  it("maps an unknown route to null", () => {
    expect(resolveActiveTab("/totally-unknown")).toBeNull();
  });

  it("ignores query strings, hashes, and trailing slashes", () => {
    expect(resolveActiveTab("/feed/")).toBe("feed");
    expect(resolveActiveTab("/feed?tab=recent")).toBe("feed");
    expect(resolveActiveTab("/profile#stats")).toBe("profile");
    expect(resolveActiveTab("/my-reports/123")).toBe("more");
  });

  it("collapses repeated slashes to the first real segment", () => {
    expect(resolveActiveTab("//feed//")).toBe("feed");
    expect(resolveActiveTab("///")).toBe("home");
  });

  it("handles a pathological run of slashes quickly (no ReDoS)", () => {
    const evil = `${"/".repeat(100_000)}x`;
    const start = Date.now();
    expect(resolveActiveTab(evil)).toBeNull();
    // Linear work — comfortably under a second even for 100k slashes.
    expect(Date.now() - start).toBeLessThan(1000);
  });
});
