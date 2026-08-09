import { afterEach, describe, expect, it, vi } from "vitest";

import { translate } from "./translate";
import type { LocaleDict, TranslationKey } from "./types";

// This suite exercises `translate()`'s runtime logic against a synthetic
// dictionary independent of the real en-US/pt-BR JSON files, so its keys
// (e.g. "common.greeting") aren't part of the real `TranslationKey` union —
// cast them explicitly rather than loosening the type real callers get.
const key = (k: string) => k as TranslationKey;

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
    splash: {},
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
    splash: {},
  },
};

describe("translate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves a plain string key with interpolation", () => {
    expect(translate(dicts, "pt-BR", key("common.greeting"), { name: "Ana" })).toBe("Olá, Ana!");
  });

  it("resolves the correct plural form via Intl.PluralRules", () => {
    expect(translate(dicts, "en-US", key("report.supportsCount"), { count: 0 })).toBe("0 supports");
    expect(translate(dicts, "en-US", key("report.supportsCount"), { count: 1 })).toBe("1 support");
    expect(translate(dicts, "en-US", key("report.supportsCount"), { count: 27 })).toBe(
      "27 supports",
    );
  });

  it("resolves pt-BR plural forms per the Acceptance Criteria examples", () => {
    expect(translate(dicts, "pt-BR", key("report.supportsCount"), { count: 0 })).toBe("sem apoios");
    expect(translate(dicts, "pt-BR", key("report.supportsCount"), { count: 1 })).toBe("1 apoio");
    expect(translate(dicts, "pt-BR", key("report.supportsCount"), { count: 27 })).toBe("27 apoios");
  });

  it("falls back to en-US when the key is missing in the active locale", () => {
    expect(translate(dicts, "pt-BR", key("common.onlyInEnglish"))).toBe("English only");
  });

  it("falls back to the key itself when missing everywhere, and reports it", () => {
    const onMissingKey = vi.fn();
    const result = translate(dicts, "pt-BR", key("common.doesNotExist"), undefined, onMissingKey);

    expect(result).toBe("common.doesNotExist");
    expect(onMissingKey).toHaveBeenCalledWith({ key: "common.doesNotExist", locale: "pt-BR" });
  });

  it("logs a dev console warning when a key is missing (NODE_ENV !== production)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    translate(dicts, "pt-BR", key("common.doesNotExist"));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("common.doesNotExist"));
  });

  it("leaves an unmatched interpolation token untouched", () => {
    expect(translate(dicts, "en-US", key("common.greeting"))).toBe("Hello, {{name}}!");
  });

  it("logs a dev console warning when a plural key is used without a count", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    translate(dicts, "en-US", key("report.supportsCount"));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("report.supportsCount"));
  });

  it("still resolves the zero form when a plural key is used without a count", () => {
    expect(translate(dicts, "en-US", key("report.supportsCount"))).toBe("0 supports");
  });

  it("does not warn when a plural key is given an explicit count", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    translate(dicts, "en-US", key("report.supportsCount"), { count: 3 });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("uses a dictionary-supplied CLDR category beyond zero/one/other (e.g. few)", () => {
    vi.spyOn(Intl.PluralRules.prototype, "select").mockReturnValue("few");
    const dictsWithFew: Record<"pt-BR" | "en-US", LocaleDict> = {
      ...dicts,
      "en-US": {
        ...dicts["en-US"],
        report: { supportsCount: { few: "a few supports", other: "{{count}} supports" } },
      },
    };
    expect(translate(dictsWithFew, "en-US", key("report.supportsCount"), { count: 3 })).toBe(
      "a few supports",
    );
  });

  it("falls back to other when the CLDR-selected category isn't in the dictionary", () => {
    vi.spyOn(Intl.PluralRules.prototype, "select").mockReturnValue("many");
    expect(translate(dicts, "en-US", key("report.supportsCount"), { count: 3 })).toBe("3 supports");
  });
});
