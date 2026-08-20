"use client";

import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";

import { useTheme } from "./useTheme";

export type StatusBarVariant = "light" | "dark" | "auto";

export type UseStatusBarVariantOptions = {
  /** Hide the status bar entirely (e.g. a full-screen Camera modal). */
  hidden?: boolean;
};

/**
 * Applies the system status bar style while the host screen has focus, via
 * `expo-router`'s `useFocusEffect`. Each screen owns its own call: when this
 * screen loses focus there is nothing to manually restore, because the
 * previously-focused screen's own `useStatusBarVariant` call re-fires (and
 * re-applies its variant) the moment it regains focus — via the `focus`/
 * `blur` navigation events `useFocusEffect` subscribes to, independent of
 * mount state. This precondition only holds when every screen/overlay using
 * this hook is its own `expo-router` route (a stack/modal screen, so a real
 * focus/blur pair fires): an in-tree overlay component (e.g. a bare RN
 * `<Modal>` rendered inside an existing screen, not a routed one) never
 * triggers those events, so closing it would leave the underlying screen's
 * variant stale until something else re-focuses it.
 */
export function useStatusBarVariant(
  variant: StatusBarVariant,
  options: UseStatusBarVariantOptions = {},
): void {
  const theme = useTheme();
  const hidden = options.hidden ?? false;

  const resolvedStyle: "light" | "dark" =
    variant === "auto" ? (theme.scheme === "dark" ? "light" : "dark") : variant;

  useFocusEffect(
    useCallback(() => {
      StatusBar.setStyle(resolvedStyle, true);
      StatusBar.setHidden(hidden);
    }, [resolvedStyle, hidden]),
  );
}
