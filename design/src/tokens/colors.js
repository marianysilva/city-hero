/**
 * Design tokens · colors
 *
 * Mirror of the Tailwind theme extension configured inline in the entry HTML.
 * Imported by atoms/molecules when JS-side color math is needed
 * (e.g. Leaflet pin backgrounds), so values stay in a single source.
 */

export const BRAND = {
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
};

export const CIVIC = {
  purple: "#7C3AED",
  mint: "#10B981",
  sky: "#0EA5E9",
  amber: "#F59E0B",
  rose: "#F43F5E",
  slate: "#0F172A",
};

/** Category palette — used across Home, Feed, Câmera, Manual Report. */
export const CATEGORY = {
  pothole: { color: CIVIC.amber, emoji: "🕳️", label: "Buraco" },
  trash: { color: CIVIC.mint, emoji: "🗑️", label: "Lixo" },
  lighting: { color: CIVIC.sky, emoji: "💡", label: "Iluminação" },
  graffiti: { color: CIVIC.purple, emoji: "🎨", label: "Pichação" },
  sidewalk: { color: CIVIC.purple, emoji: "🚧", label: "Calçada" },
  hazard: { color: CIVIC.rose, emoji: "⚠️", label: "Risco" },
};
