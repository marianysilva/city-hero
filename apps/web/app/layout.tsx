import { ThemeProvider } from "@city-hero/design-system";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ApolloWrapper } from "./ApolloWrapper";
import { getServerT } from "./lib/i18n";
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
  const { t } = await getServerT();
  return {
    title: t("dashboard.metaTitle"),
    description: t("dashboard.metaDescription"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading cookies/headers here (via getServerT -> resolveServerLocale)
  // forces dynamic rendering for every route under this root layout, not
  // just the ones that actually need per-request locale data — there's no
  // static/ISR path left anywhere in the app. Acceptable today since this is
  // an authenticated dashboard with no public/marketing routes; revisit if
  // one is ever added under a layout that doesn't need this.
  const { locale } = await getServerT();

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
