/**
 * `Intl.*Format` constructors are relatively expensive to instantiate (they
 * parse locale/options data internally) and are immutable + stateless once
 * built, so it's safe and worthwhile to reuse one instance per distinct
 * (locale, options) pair instead of constructing one on every call — this
 * matters for table-heavy rendering (e.g. the users list) that formats many
 * dates/numbers per render.
 */
const cache = new Map<string, unknown>();

export function getCachedFormatter<T>(
  kind: string,
  locale: string,
  options: object | undefined,
  create: () => T,
): T {
  const key = `${kind}:${locale}:${JSON.stringify(options ?? {})}`;
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached as T;
  }
  const formatter = create();
  cache.set(key, formatter);
  return formatter;
}
