import { describe, expect, it } from "vitest";

import type { PluralForms } from "../types";

import { LOCALE_DICTS } from "./index";

function isPluralForms(value: unknown): value is PluralForms {
  return typeof value === "object" && value !== null;
}

// CI check per the task's Tests section: "a script verifies all keys in
// pt-BR exist in en-US (and vice versa)". Runs as a normal vitest test so it
// fails the same `npm test` / `turbo run test` every other check does.
describe("translation parity (pt-BR <-> en-US)", () => {
  const namespaces = Object.keys(LOCALE_DICTS["en-US"]) as Array<
    keyof (typeof LOCALE_DICTS)["en-US"]
  >;

  it.each(namespaces)("namespace %s has identical keys in both locales", (namespace) => {
    const ptKeys = Object.keys(LOCALE_DICTS["pt-BR"][namespace]).sort();
    const enKeys = Object.keys(LOCALE_DICTS["en-US"][namespace]).sort();
    expect(ptKeys).toEqual(enKeys);
  });

  it.each(namespaces)(
    "namespace %s has matching plural-form shapes in both locales",
    (namespace) => {
      const ptNs = LOCALE_DICTS["pt-BR"][namespace];
      const enNs = LOCALE_DICTS["en-US"][namespace];

      for (const key of Object.keys(enNs)) {
        const ptValue = ptNs[key];
        const enValue = enNs[key];
        if (isPluralForms(enValue) || isPluralForms(ptValue)) {
          expect(isPluralForms(ptValue)).toBe(true);
          expect(isPluralForms(enValue)).toBe(true);
          if (isPluralForms(ptValue) && isPluralForms(enValue)) {
            expect(Object.keys(ptValue).sort()).toEqual(Object.keys(enValue).sort());
          }
        }
      }
    },
  );
});
