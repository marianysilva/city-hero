import { render, renderHook } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "../theme/ThemeProvider";

import { useStatusBarVariant } from "./useStatusBarVariant";

const { registry, setStyle, setHidden } = vi.hoisted(() => ({
  registry: [] as Array<{
    effect: () => void | (() => void);
    cleanup?: () => void;
    focused: boolean;
  }>,
  setStyle: vi.fn(),
  setHidden: vi.fn(),
}));

vi.mock("expo-status-bar", () => ({
  StatusBar: { setStyle, setHidden },
}));

// Fake of expo-router's real useFocusEffect (see its source: it subscribes
// to the navigator's `focus`/`blur` events and re-invokes the callback on
// each `focus`, independent of whether the component ever unmounts). This
// mock mirrors that: each hook instance registers itself once, and
// `focusAt`/`blurAt` below simulate the navigator firing those events —
// including a screen regaining focus WITHOUT remounting, which is the
// actual behavior of a stacked `expo-router` screen (react-native-screens
// keeps prior screens mounted, just unfocused). `focused` is tracked
// explicitly (not inferred from `cleanup` being set) because this hook's
// own effect legitimately returns no cleanup function while still focused.
vi.mock("expo-router", () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const idxRef = useRef<number | null>(null);
    if (idxRef.current === null) {
      idxRef.current = registry.length;
      registry.push({ effect, focused: false });
    } else {
      const entry = registry[idxRef.current];
      if (entry.effect !== effect) {
        entry.effect = effect;
        // Real useFocusEffect re-invokes immediately if already focused
        // when the effect's identity changes (e.g. a dependency changed).
        if (entry.focused) {
          entry.cleanup?.();
          entry.cleanup = entry.effect() ?? undefined;
        }
      }
    }
    useEffect(() => {
      const idx = idxRef.current!;
      return () => {
        const entry = registry[idx];
        if (entry?.focused) {
          entry.cleanup?.();
          entry.cleanup = undefined;
          entry.focused = false;
        }
      };
    }, []);
  },
}));

function focusAt(index: number) {
  const entry = registry[index];
  if (!entry || entry.focused) return;
  entry.cleanup = entry.effect() ?? undefined;
  entry.focused = true;
}

function blurAt(index: number) {
  const entry = registry[index];
  if (!entry?.focused) return;
  entry.cleanup?.();
  entry.cleanup = undefined;
  entry.focused = false;
}

function renderVariant(
  variant: "light" | "dark" | "auto",
  options?: { hidden?: boolean; scheme?: "light" | "dark" },
) {
  const result = renderHook(() => useStatusBarVariant(variant, { hidden: options?.hidden }), {
    wrapper: ({ children }) => (
      <ThemeProvider initialPreference={options?.scheme ?? "light"}>{children}</ThemeProvider>
    ),
  });
  focusAt(registry.length - 1);
  return result;
}

describe("useStatusBarVariant", () => {
  beforeEach(() => {
    registry.length = 0;
    setStyle.mockClear();
    setHidden.mockClear();
  });

  it("applies 'light' as-is", () => {
    renderVariant("light");
    expect(setStyle).toHaveBeenCalledWith("light", true);
    expect(setHidden).toHaveBeenCalledWith(false);
  });

  it("applies 'dark' as-is", () => {
    renderVariant("dark");
    expect(setStyle).toHaveBeenCalledWith("dark", true);
  });

  it("resolves 'auto' to light icons on a dark theme", () => {
    renderVariant("auto", { scheme: "dark" });
    expect(setStyle).toHaveBeenCalledWith("light", true);
  });

  it("resolves 'auto' to dark icons on a light theme", () => {
    renderVariant("auto", { scheme: "light" });
    expect(setStyle).toHaveBeenCalledWith("dark", true);
  });

  it("hides the status bar when options.hidden is set", () => {
    renderVariant("light", { hidden: true });
    expect(setHidden).toHaveBeenCalledWith(true);
  });

  it("does not call the imperative API if the screen never gains focus, including after unmount", () => {
    const { unmount } = renderHook(() => useStatusBarVariant("light"), {
      wrapper: ({ children }) => (
        <ThemeProvider initialPreference="light">{children}</ThemeProvider>
      ),
    });
    // Deliberately no focusAt() call — the screen is mounted but never focused.
    expect(setStyle).not.toHaveBeenCalled();
    expect(setHidden).not.toHaveBeenCalled();

    unmount();
    expect(setStyle).not.toHaveBeenCalled();
    expect(setHidden).not.toHaveBeenCalled();
  });

  it("re-applies while still focused when a dependency (e.g. hidden) changes", () => {
    const { rerender } = renderHook(
      ({ hidden }: { hidden: boolean }) => useStatusBarVariant("dark", { hidden }),
      {
        initialProps: { hidden: false },
        wrapper: ({ children }) => (
          <ThemeProvider initialPreference="light">{children}</ThemeProvider>
        ),
      },
    );
    focusAt(0);
    expect(setHidden).toHaveBeenLastCalledWith(false);

    rerender({ hidden: true });
    expect(setHidden).toHaveBeenLastCalledWith(true);
  });

  it("re-applies its variant when it regains focus without remounting", () => {
    renderHook(() => useStatusBarVariant("dark"), {
      wrapper: ({ children }) => (
        <ThemeProvider initialPreference="light">{children}</ThemeProvider>
      ),
    });

    focusAt(0);
    expect(setStyle).toHaveBeenLastCalledWith("dark", true);

    blurAt(0);
    setStyle.mockClear();
    focusAt(0);
    expect(setStyle).toHaveBeenLastCalledWith("dark", true);
  });

  it("restores the previous screen's variant when the screen focused on top of it blurs, without either remounting", () => {
    // Both screens stay mounted throughout — matching react-native-screens'
    // real behavior of keeping stacked screens mounted, just unfocused.
    function Screen({ variant }: { variant: "light" | "dark" }) {
      useStatusBarVariant(variant);
      return null;
    }

    render(
      <ThemeProvider initialPreference="light">
        <Screen variant="dark" /> {/* registry index 0 */}
        <Screen variant="light" /> {/* registry index 1 */}
      </ThemeProvider>,
    );

    focusAt(0);
    expect(setStyle).toHaveBeenLastCalledWith("dark", true);

    // A modal-like screen takes focus on top of the first one.
    blurAt(0);
    focusAt(1);
    expect(setStyle).toHaveBeenLastCalledWith("light", true);

    // The modal closes; the underlying screen regains focus and re-applies
    // its own variant — with neither screen ever unmounting.
    blurAt(1);
    focusAt(0);
    expect(setStyle).toHaveBeenLastCalledWith("dark", true);
  });
});
