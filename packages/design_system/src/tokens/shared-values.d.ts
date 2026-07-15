declare const sharedValues: {
  brand: Record<
    "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
    string
  >;
  civic: Record<"purple" | "mint" | "sky" | "amber" | "rose" | "slate", string>;
  spacing: Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl", number>;
  radius: Record<"sm" | "md" | "lg" | "xl", number>;
  shadows: Record<"soft" | "md" | "lg", string>;
  fontFamily: { sans: string };
};

export default sharedValues;
