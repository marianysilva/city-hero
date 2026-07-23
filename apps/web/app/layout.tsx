import { ThemeProvider } from "@city-hero/design-system";
import { LOCALE_DICTS, translate } from "@city-hero/i18n";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ApolloWrapper } from "./ApolloWrapper";
import { resolveServerLocale } from "./lib/i18n";
import { LocaleClientProvider } from "./LocaleClientProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveServerLocale();
  return {
    title: translate(LOCALE_DICTS, locale, "dashboard.metaTitle"),
    description: translate(LOCALE_DICTS, locale, "dashboard.metaDescription"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveServerLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleClientProvider initialLocale={locale}>
          <ThemeProvider>
            <ReactQueryProvider>
              <ApolloWrapper>{children}</ApolloWrapper>
            </ReactQueryProvider>
          </ThemeProvider>
        </LocaleClientProvider>
      </body>
    </html>
  );
}
