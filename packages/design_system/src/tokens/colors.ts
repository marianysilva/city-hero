/**
 * Color tokens. `brand` and `civic` are ported verbatim from the prototype
 * (design/src/tokens/colors.js, design/index.html) — that HTML file is the
 * source of truth for these exact hex values, held in ./shared-values.js
 * so tailwind.preset.js can read the same literals. `slate` mirrors
 * Tailwind's default slate scale, since the prototype already relies on
 * Tailwind's built-in `slate-*` utility classes rather than a custom scale.
 */
import sharedValues from "./shared-values.js";

export const brand = sharedValues.brand;

export const civic = sharedValues.civic;

export const slate = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
} as const;

/** Reuses the existing civic palette rather than inventing new hues. */
export const semantic = {
  success: civic.mint,
  warning: civic.amber,
  danger: civic.rose,
  info: civic.sky,
} as const;

export const colors = { brand, civic, slate, semantic } as const;
