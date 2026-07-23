import { getLocales } from "expo-localization";
import Storage from "expo-sqlite/kv-store";

import { getDeviceDefaultLocale, loadPersistedLocale, persistLocale } from "../lib/i18n";

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

  it("persists the chosen locale under the expected key", async () => {
    await persistLocale("pt-BR");
    expect(mockStorage.setItem).toHaveBeenCalledWith("cityhero.language", "pt-BR");
  });
});
