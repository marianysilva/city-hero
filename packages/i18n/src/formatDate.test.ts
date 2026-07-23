import { describe, expect, it } from "vitest";

import { formatDateTime, formatRelativeTime } from "./formatDate";

describe("formatDateTime", () => {
  const sample = new Date("2026-04-21T14:30:00Z");

  it("formats using pt-BR conventions (dd/mm/yyyy)", () => {
    const result = formatDateTime(sample, "pt-BR", { dateStyle: "short", timeZone: "UTC" });
    expect(result).toBe("21/04/2026");
  });

  it("formats using en-US conventions (Mon d, yyyy)", () => {
    const result = formatDateTime(sample, "en-US", { dateStyle: "medium", timeZone: "UTC" });
    expect(result).toBe("Apr 21, 2026");
  });
});

describe("formatRelativeTime", () => {
  it("renders 'X hours ago' in en-US", () => {
    const now = new Date("2026-04-21T14:30:00Z");
    const twoHoursAgo = new Date("2026-04-21T12:30:00Z");
    expect(formatRelativeTime(twoHoursAgo, "en-US", now)).toBe("2 hours ago");
  });

  it("renders 'há X horas' in pt-BR", () => {
    const now = new Date("2026-04-21T14:30:00Z");
    const twoHoursAgo = new Date("2026-04-21T12:30:00Z");
    expect(formatRelativeTime(twoHoursAgo, "pt-BR", now)).toBe("há 2 horas");
  });
});
