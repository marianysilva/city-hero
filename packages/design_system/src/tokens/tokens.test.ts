import { describe, expect, it } from "vitest";

import {
  colors,
  fontFamily,
  typography,
  spacing,
  radius,
  shadows,
  lightTheme,
  darkTheme,
} from "./index";

describe("design tokens", () => {
  it("colors scale is stable", () => {
    expect(colors).toMatchSnapshot();
  });

  it("typography scale is stable", () => {
    expect({ fontFamily, typography }).toMatchSnapshot();
  });

  it("spacing scale is stable", () => {
    expect(spacing).toMatchSnapshot();
  });

  it("radius scale is stable", () => {
    expect(radius).toMatchSnapshot();
  });

  it("shadow tokens are stable", () => {
    expect(shadows).toMatchSnapshot();
  });

  it("brand colors are identical across light and dark themes", () => {
    expect(lightTheme.colors.brand).toEqual(darkTheme.colors.brand);
  });

  it("light and dark themes expose the full token surface", () => {
    expect(lightTheme).toMatchSnapshot();
    expect(darkTheme).toMatchSnapshot();
  });
});
