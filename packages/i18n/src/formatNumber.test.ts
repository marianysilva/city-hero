import { describe, expect, it } from "vitest";

import { formatNumber } from "./formatNumber";

describe("formatNumber", () => {
  it("uses pt-BR separators (1.234,56)", () => {
    expect(formatNumber(1234.56, "pt-BR")).toBe("1.234,56");
  });

  it("uses en-US separators (1,234.56)", () => {
    expect(formatNumber(1234.56, "en-US")).toBe("1,234.56");
  });
});
