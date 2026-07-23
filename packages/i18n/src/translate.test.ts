import { afterEach, describe, expect, it, vi } from "vitest";

import { translate } from "./translate";
import type { LocaleDict } from "./types";

const dicts: Record<"pt-BR" | "en-US", LocaleDict> = {
  "pt-BR": {
    common: { greeting: "Olá, {{name}}!" },
    home: {},
    camera: {},
    report: { supportsCount: { zero: "sem apoios", one: "1 apoio", other: "{{count}} apoios" } },
    auth: {},
    errors: {},
    dashboard: {},
    users: {},
    validation: {},
  },
  "en-US": {
    common: { greeting: "Hello, {{name}}!", onlyInEnglish: "English only" },
    home: {},
    camera: {},
    report: {
      supportsCount: { zero: "0 supports", one: "1 support", other: "{{count}} supports" },
    },
    auth: {},
    errors: {},
    dashboard: {},
    users: {},
    validation: {},
  },
};

describe("translate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves a plain string key with interpolation", () => {
    expect(translate(dicts, "pt-BR", "common.greeting", { name: "Ana" })).toBe("Olá, Ana!");
  });

  it("resolves the correct plural form via Intl.PluralRules", () => {
    expect(translate(dicts, "en-US", "report.supportsCount", { count: 0 })).toBe("0 supports");
    expect(translate(dicts, "en-US", "report.supportsCount", { count: 1 })).toBe("1 support");
    expect(translate(dicts, "en-US", "report.supportsCount", { count: 27 })).toBe("27 supports");
  });

  it("resolves pt-BR plural forms per the Acceptance Criteria examples", () => {
    expect(translate(dicts, "pt-BR", "report.supportsCount", { count: 0 })).toBe("sem apoios");
    expect(translate(dicts, "pt-BR", "report.supportsCount", { count: 1 })).toBe("1 apoio");
    expect(translate(dicts, "pt-BR", "report.supportsCount", { count: 27 })).toBe("27 apoios");
  });

  it("falls back to en-US when the key is missing in the active locale", () => {
    expect(translate(dicts, "pt-BR", "common.onlyInEnglish")).toBe("English only");
  });

  it("falls back to the key itself when missing everywhere, and reports it", () => {
    const onMissingKey = vi.fn();
    const result = translate(dicts, "pt-BR", "common.doesNotExist", undefined, onMissingKey);

    expect(result).toBe("common.doesNotExist");
    expect(onMissingKey).toHaveBeenCalledWith({ key: "common.doesNotExist", locale: "pt-BR" });
  });

  it("logs a dev console warning when a key is missing (NODE_ENV !== production)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    translate(dicts, "pt-BR", "common.doesNotExist");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("common.doesNotExist"));
  });

  it("leaves an unmatched interpolation token untouched", () => {
    expect(translate(dicts, "en-US", "common.greeting")).toBe("Hello, {{name}}!");
  });
});
