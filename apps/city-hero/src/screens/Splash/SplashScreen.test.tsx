import { ThemeProvider } from "@city-hero/design-system";
import { LocaleProvider } from "@city-hero/i18n";
import { act, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { SplashScreen } from "./SplashScreen";

// Confetti (infinite withRepeat(-1)) and the interactive children
// (WelcomeActions' Pressables, RotatingTagline's setInterval) all fight fake
// timers when combined with this file's min-duration/loading/timeout tests —
// overlapping act() warnings that silently swallow the splash's own
// setTimeout-driven state updates. Each has its own dedicated test file
// (WelcomeActions.test.tsx, RotatingTagline.test.tsx) with no such
// conflicts, so they're mocked out here and this file stays focused on the
// splash's own timing/accessibility behavior.
jest.mock("./components/Confetti", () => ({ Confetti: () => null }));
jest.mock("./components/RotatingTagline", () => ({ RotatingTagline: () => null }));
jest.mock("./components/WelcomeActions", () => ({ WelcomeActions: () => null }));

// A spread copy (`{ ...actual, useReducedMotion: ... }`) silently drops
// Reanimated's `Animated` default export (breaks every `Animated.View` in
// the tree, incl. AnimatedLogo's) — its exports aren't plain enumerable
// copies. A read-through Proxy overrides just the one export without
// touching how the rest resolve.
const mockUseReducedMotion = jest.fn(() => false);
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated");
  return new Proxy(actual, {
    get(target, prop, receiver) {
      if (prop === "useReducedMotion") return () => mockUseReducedMotion();
      return Reflect.get(target, prop, receiver);
    },
  });
});

function renderSplash(props: React.ComponentProps<typeof SplashScreen> = {}) {
  return render(
    <ThemeProvider>
      <LocaleProvider initialLocale="en-US">
        <SplashScreen {...props} />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

async function advanceTime(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockUseReducedMotion.mockReturnValue(false);
});

afterEach(() => {
  jest.useRealTimers();
});

test("renders the logo and app name", async () => {
  await renderSplash();

  expect(screen.getByTestId("splash-logo")).toBeTruthy();
  expect(screen.getByText("CityHero")).toBeTruthy();
});

test("does not call onReady before the minimum display time elapses, even when already ready", async () => {
  const onReady = jest.fn();
  await renderSplash({ isReady: true, onReady });

  await advanceTime(799);
  expect(onReady).not.toHaveBeenCalled();

  await advanceTime(1);
  expect(onReady).toHaveBeenCalledWith("ready");
});

test("waits for isReady before navigating once the minimum display time has passed", async () => {
  const onReady = jest.fn();
  const { rerender } = await renderSplash({ isReady: false, onReady });

  await advanceTime(5000);
  expect(onReady).not.toHaveBeenCalled();

  await act(async () => {
    rerender(
      <ThemeProvider>
        <LocaleProvider initialLocale="en-US">
          <SplashScreen isReady onReady={onReady} />
        </LocaleProvider>
      </ThemeProvider>,
    );
  });
  await advanceTime(0);

  expect(onReady).toHaveBeenCalledWith("ready");
});

test("surfaces the loading indicator only after the 5s threshold", async () => {
  await renderSplash({ isReady: false });

  expect(screen.queryByTestId("splash-loading-indicator")).toBeNull();

  await advanceTime(5000);
  expect(screen.getByTestId("splash-loading-indicator")).toBeTruthy();
});

test("never surfaces the loading indicator once already navigated before the 5s threshold", async () => {
  const onReady = jest.fn();
  await renderSplash({ isReady: true, onReady });

  await advanceTime(800);
  expect(onReady).toHaveBeenCalledWith("ready");

  await advanceTime(5000);
  expect(screen.queryByTestId("splash-loading-indicator")).toBeNull();
});

test("force-navigates with a timeout reason after the 10s hard timeout", async () => {
  const onReady = jest.fn();
  await renderSplash({ isReady: false, onReady });

  await advanceTime(10000);
  expect(onReady).toHaveBeenCalledWith("timeout");
});

test("shows the app name at full opacity immediately, with no fade-in, when reduce-motion is on", async () => {
  mockUseReducedMotion.mockReturnValue(true);
  await renderSplash();

  const { opacity, transform } = StyleSheet.flatten(
    screen.getByText("CityHero").parent?.props.style,
  );
  expect(opacity).toBe(1);
  expect(transform).toEqual([{ translateY: 0 }]);
});

test("still animates the app name's entrance when reduce-motion is off", async () => {
  mockUseReducedMotion.mockReturnValue(false);
  await renderSplash();

  const { opacity, transform } = StyleSheet.flatten(
    screen.getByText("CityHero").parent?.props.style,
  );
  expect(opacity).toBe(0);
  expect(transform).toEqual([{ translateY: 8 }]);
});
