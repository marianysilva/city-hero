import { describe, expect, it } from "vitest";

import { resolveDefaultLocale } from "./resolveDefaultLocale";

describe("resolveDefaultLocale", () => {
  it("maps a pt-* device locale to pt-BR", () => {
    expect(resolveDefaultLocale({ deviceLanguageTags: ["pt-PT"] })).toBe("pt-BR");
  });

  it("maps an en-* device locale to en-US", () => {
    expect(resolveDefaultLocale({ deviceLanguageTags: ["en-GB"] })).toBe("en-US");
  });

  it("falls back to en-US for an unsupported device locale (not pt-BR)", () => {
    expect(resolveDefaultLocale({ deviceLanguageTags: ["fr-FR"] })).toBe("en-US");
  });

  it("falls back to en-US when no device locales are reported", () => {
    expect(resolveDefaultLocale({ deviceLanguageTags: [] })).toBe("en-US");
  });

  it("skips unsupported preferred locales to find a supported one further down the list", () => {
    expect(resolveDefaultLocale({ deviceLanguageTags: ["fr-FR", "pt-BR"] })).toBe("pt-BR");
  });

  it("a valid dev override wins over device detection", () => {
    expect(
      resolveDefaultLocale({ deviceLanguageTags: ["en-US"], devLocaleOverride: "pt-BR" }),
    ).toBe("pt-BR");
  });

  it("ignores an invalid dev override and falls through to device detection", () => {
    expect(
      resolveDefaultLocale({ deviceLanguageTags: ["pt-BR"], devLocaleOverride: "fr-FR" }),
    ).toBe("pt-BR");
  });

  it("ignores a null/undefined dev override", () => {
    expect(resolveDefaultLocale({ deviceLanguageTags: ["en-US"], devLocaleOverride: null })).toBe(
      "en-US",
    );
  });
});
