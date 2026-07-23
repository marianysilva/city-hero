import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LocaleProvider, useLocale, useLocaleContext, useTranslation } from "./LocaleProvider";

function Probe() {
  const { t, locale } = useTranslation();
  const { setLocale } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="greeting">{t("common.appName")}</span>
      <span data-testid="plural">{t("report.supportsCount", { count: 5 })}</span>
      <button onClick={() => setLocale("pt-BR")}>switch</button>
    </div>
  );
}

describe("LocaleProvider", () => {
  it("defaults to en-US when no initialLocale is given", () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("en-US");
    expect(screen.getByTestId("plural")).toHaveTextContent("5 supports");
  });

  it("honors an initialLocale prop", () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("pt-BR");
    expect(screen.getByTestId("plural")).toHaveTextContent("5 apoios");
  });

  it("re-renders all visible text when setLocale is called, without a remount", () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("plural")).toHaveTextContent("5 supports");

    act(() => {
      screen.getByRole("button", { name: "switch" }).click();
    });

    expect(screen.getByTestId("locale")).toHaveTextContent("pt-BR");
    expect(screen.getByTestId("plural")).toHaveTextContent("5 apoios");
  });

  it("calls onLocaleChange so the host app can persist the choice", () => {
    const onLocaleChange = vi.fn();
    render(
      <LocaleProvider onLocaleChange={onLocaleChange}>
        <Probe />
      </LocaleProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "switch" }).click();
    });

    expect(onLocaleChange).toHaveBeenCalledWith("pt-BR");
  });

  it("calls onMissingKey when t() can't resolve a key", () => {
    const onMissingKey = vi.fn();
    function MissingKeyProbe() {
      const { t } = useTranslation();
      return <span>{t("common.doesNotExist" as never)}</span>;
    }

    render(
      <LocaleProvider onMissingKey={onMissingKey}>
        <MissingKeyProbe />
      </LocaleProvider>,
    );

    expect(onMissingKey).toHaveBeenCalledWith({ key: "common.doesNotExist", locale: "en-US" });
  });

  it("throws a clear error when used outside a provider", () => {
    function Bare() {
      useLocaleContext();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/must be called within a <LocaleProvider>/);
  });
});
