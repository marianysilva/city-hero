import { ThemeProvider } from "@city-hero/design-system";
import { LocaleProvider } from "@city-hero/i18n";
import { act, render, screen } from "@testing-library/react-native";

import { SplashScreen } from "./SplashScreen";

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
});

afterEach(() => {
  jest.useRealTimers();
});

test("renders the logo, app name, and tagline", async () => {
  await renderSplash();

  expect(screen.getByTestId("splash-logo")).toBeTruthy();
  expect(screen.getByText("CityHero")).toBeTruthy();
  expect(screen.getByText("Your city in your hands")).toBeTruthy();
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

test("force-navigates with a timeout reason after the 10s hard timeout", async () => {
  const onReady = jest.fn();
  await renderSplash({ isReady: false, onReady });

  await advanceTime(10000);
  expect(onReady).toHaveBeenCalledWith("timeout");
});
