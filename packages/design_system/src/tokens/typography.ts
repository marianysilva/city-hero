/**
 * Type scale. Font sizes/line-heights are first-pass values, not pulled
 * from a specific design file (the prototype uses raw Tailwind text-size
 * utilities, no named scale) — refine against real screen designs as
 * components are built.
 */

export const fontFamily = {
  sans: "Plus Jakarta Sans",
} as const;

export type TypographyVariant = {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600" | "700" | "800";
};

export const typography: Record<
  "display" | "h1" | "h2" | "body" | "bodyBold" | "caption" | "micro",
  TypographyVariant
> = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "800" },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: "700" },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "500" },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: "500" },
};
