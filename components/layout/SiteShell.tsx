import { AppProviders } from "@/components/providers/AppProviders";
import { AlertWatcher } from "@/components/game/AlertWatcher";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import type { CurrencyCode } from "@/lib/types";

export function SiteShell({
  children,
  currency,
}: {
  children: React.ReactNode;
  currency: CurrencyCode;
}) {
  return (
    <AppProviders currency={currency}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <AlertWatcher />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AppProviders>
  );
}
