import { getCachedFormatter } from "./formatterCache";
import type { Locale } from "./types";

export function formatDateTime(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const resolvedOptions = options ?? { dateStyle: "short", timeStyle: "short" };
  const formatter = getCachedFormatter(
    "dateTime",
    locale,
    resolvedOptions,
    () => new Intl.DateTimeFormat(locale, resolvedOptions),
  );
  return formatter.format(date);
}

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "week", seconds: 604800 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
];

/** "2 hours ago" / "há 2 horas" style relative time, via `Intl.RelativeTimeFormat`. */
export function formatRelativeTime(date: Date, locale: Locale, now: Date = new Date()): string {
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const rtf = getCachedFormatter(
    "relativeTime",
    locale,
    { numeric: "auto" },
    () => new Intl.RelativeTimeFormat(locale, { numeric: "auto" }),
  );

  for (const { unit, seconds } of RELATIVE_UNITS) {
    if (absSeconds >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }

  return rtf.format(diffSeconds, "second");
}
