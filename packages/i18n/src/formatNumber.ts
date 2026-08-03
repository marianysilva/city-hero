import { getCachedFormatter } from "./formatterCache";
import type { Locale } from "./types";

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  const formatter = getCachedFormatter(
    "number",
    locale,
    options,
    () => new Intl.NumberFormat(locale, options),
  );
  return formatter.format(value);
}
