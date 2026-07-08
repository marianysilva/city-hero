/**
 * Color tokens. `brand` and `civic` are ported verbatim from the prototype
 * (design/src/tokens/colors.js, design/index.html) — that HTML file is the
 * source of truth for these exact hex values. `slate` mirrors Tailwind's
 * default slate scale, since the prototype already relies on Tailwind's
 * built-in `slate-*` utility classes rather than a custom scale.
 */

export const brand = {
  50: "#FFF7ED",
  100: "#FFEDD5",
  200: "#FED7AA",
  300: "#FDBA74",
  400: "#FB923C",
  500: "#F97316",
  600: "#EA580C",
  700: "#C2410C",
  800: "#9A3412",
  900: "#7C2D12",
} as const;

export const civic = {
  purple: "#7C3AED",
  mint: "#10B981",
  sky: "#0EA5E9",
  amber: "#F59E0B",
  rose: "#F43F5E",
  slate: "#0F172A",
} as const;

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
