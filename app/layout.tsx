import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Manrope } from "next/font/google";
import { SiteShell } from "@/components/layout/SiteShell";
import { CURRENCY_COOKIE } from "@/lib/currency-server";
import type { CurrencyCode } from "@/lib/types";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DealForge — Stop Overpaying for Games",
    template: "%s · DealForge",
  },
  description:
    "Compare Steam and GOG prices and find the best PC game deals in seconds. Real live prices, no invented discounts.",
  metadataBase: new URL("https://dealforge.app"),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const store = await cookies();
  const cookie = store.get(CURRENCY_COOKIE)?.value;
  const currency: CurrencyCode = cookie === "EUR" || cookie === "GBP" ? cookie : "USD";

  return (
    <html lang="en" className={`${geist.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <SiteShell currency={currency}>{children}</SiteShell>
      </body>
    </html>
  );
}
