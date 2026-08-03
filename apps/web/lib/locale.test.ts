import { describe, expect, it } from "vitest";

import { resolveLocaleFrom } from "./locale";

describe("resolveLocaleFrom", () => {
  it("prefers the persisted cookie over the Accept-Language header", () => {
    expect(resolveLocaleFrom({ cookieValue: "pt-BR", acceptLanguageHeader: "en-US" })).toBe(
      "pt-BR",
    );
  });

  it("ignores an unsupported cookie value and falls back to the header", () => {
    expect(resolveLocaleFrom({ cookieValue: "fr-FR", acceptLanguageHeader: "pt-BR" })).toBe(
      "pt-BR",
    );
  });

  it("falls back to en-US when there's no cookie and no header", () => {
    expect(resolveLocaleFrom({ cookieValue: undefined, acceptLanguageHeader: null })).toBe("en-US");
  });

  it("picks the tag with the highest q weight, even when it's not listed first", () => {
    expect(
      resolveLocaleFrom({
        cookieValue: undefined,
        acceptLanguageHeader: "en-US;q=0.3,pt-BR;q=0.9",
      }),
    ).toBe("pt-BR");
  });

  it("treats a tag with no explicit q as q=1, outranking an explicitly lower-weighted tag", () => {
    expect(
      resolveLocaleFrom({
        cookieValue: undefined,
        acceptLanguageHeader: "pt-BR;q=0.5,en-US",
      }),
    ).toBe("en-US");
  });
});
