import { LocaleProvider } from "@city-hero/i18n";
import { act, render, screen } from "@testing-library/react-native";

import { RotatingTagline } from "./RotatingTagline";

function renderTagline(reduceMotion: boolean) {
  return render(
    <LocaleProvider initialLocale="en-US">
      <RotatingTagline reduceMotion={reduceMotion} />
    </LocaleProvider>,
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

test("starts on the first tagline and rotates every 3s", async () => {
  await renderTagline(false);

  expect(screen.getByText("Report in 3 seconds. Improve your city.")).toBeTruthy();

  await advanceTime(3000);
  expect(screen.getByText("Hold local politicians accountable. Backed by data.")).toBeTruthy();

  await advanceTime(3000);
  expect(screen.getByText("Be a model citizen\non your block.")).toBeTruthy();
});

test("wraps back to the first tagline after a full 18s cycle", async () => {
  await renderTagline(false);

  await advanceTime(18000);
  expect(screen.getByText("Report in 3 seconds. Improve your city.")).toBeTruthy();
});

test("stays on the first tagline and never rotates when reduce-motion is on", async () => {
  await renderTagline(true);

  expect(screen.getByText("Report in 3 seconds. Improve your city.")).toBeTruthy();

  await advanceTime(9000);
  expect(screen.getByText("Report in 3 seconds. Improve your city.")).toBeTruthy();
});
