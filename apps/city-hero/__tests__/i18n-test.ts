import { getLocales } from "expo-localization";
import Storage from "expo-sqlite/kv-store";

import {
  getDeviceDefaultLocale,
  loadPersistedLocale,
  persistLocale,
  resolveInitialLocale,
} from "../lib/i18n";

jest.mock("expo-localization", () => ({
  getLocales: jest.fn(),
}));

jest.mock("expo-sqlite/kv-store", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockGetLocales = getLocales as jest.Mock;
const mockStorage = Storage as unknown as { getItem: jest.Mock; setItem: jest.Mock };

describe("getDeviceDefaultLocale", () => {
  afterEach(() => {
    mockGetLocales.mockReset();
  });

  it("maps a pt-BR device locale to pt-BR", () => {
    mockGetLocales.mockReturnValue([{ languageTag: "pt-BR" }]);
    expect(getDeviceDefaultLocale()).toBe("pt-BR");
  });

  it("falls back to en-US for an unsupported device locale", () => {
    mockGetLocales.mockReturnValue([{ languageTag: "fr-FR" }]);
    expect(getDeviceDefaultLocale()).toBe("en-US");
  });
});

describe("loadPersistedLocale / persistLocale", () => {
  afterEach(() => {
    mockStorage.getItem.mockReset();
    mockStorage.setItem.mockReset();
  });

  it("returns the persisted locale when it's a supported value", async () => {
    mockStorage.getItem.mockResolvedValue("pt-BR");
    await expect(loadPersistedLocale()).resolves.toBe("pt-BR");
  });

  it("returns null when nothing is persisted yet", async () => {
    mockStorage.getItem.mockResolvedValue(null);
    await expect(loadPersistedLocale()).resolves.toBeNull();
  });

  it("returns null when the stored value is no longer a supported locale", async () => {
    mockStorage.getItem.mockResolvedValue("fr-FR");
    await expect(loadPersistedLocale()).resolves.toBeNull();
  });

  it("returns null (instead of rejecting) when the storage read throws", async () => {
    mockStorage.getItem.mockRejectedValue(new Error("disk error"));
    await expect(loadPersistedLocale()).resolves.toBeNull();
  });

  it("returns null instead of hanging forever when the storage read never settles", async () => {
    jest.useFakeTimers();
    mockStorage.getItem.mockReturnValue(new Promise(() => {})); // never resolves

    const pending = loadPersistedLocale();
    await jest.advanceTimersByTimeAsync(2000);

    await expect(pending).resolves.toBeNull();
    jest.useRealTimers();
  });

  it("persists the chosen locale under the expected key", async () => {
    await persistLocale("pt-BR");
    expect(mockStorage.setItem).toHaveBeenCalledWith("cityhero.language", "pt-BR");
  });
});

describe("resolveInitialLocale", () => {
  afterEach(() => {
    mockStorage.getItem.mockReset();
    mockGetLocales.mockReset();
  });

  it("prefers the persisted locale over the device default", async () => {
    mockStorage.getItem.mockResolvedValue("pt-BR");
    mockGetLocales.mockReturnValue([{ languageTag: "en-US" }]);
    await expect(resolveInitialLocale()).resolves.toBe("pt-BR");
  });

  it("falls back to the device default when nothing is persisted", async () => {
    mockStorage.getItem.mockResolvedValue(null);
    mockGetLocales.mockReturnValue([{ languageTag: "pt-BR" }]);
    await expect(resolveInitialLocale()).resolves.toBe("pt-BR");
  });

  it("falls back to the device default when the storage read rejects", async () => {
    mockStorage.getItem.mockRejectedValue(new Error("disk error"));
    mockGetLocales.mockReturnValue([{ languageTag: "pt-BR" }]);
    await expect(resolveInitialLocale()).resolves.toBe("pt-BR");
  });
});
