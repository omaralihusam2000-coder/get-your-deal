import Link from "next/link";
import { TRUST_COPY } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-black/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold">DealForge</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            Find the game. Compare the price. Get the best deal. Live Steam and GOG prices, never invented.
          </p>
          <p className="mt-4 max-w-xl text-xs leading-5 text-muted/80">{TRUST_COPY}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Explore</p>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <Link href="/deals" className="hover:text-foreground">
              All deals
            </Link>
            <Link href="/steam" className="hover:text-foreground">
              Steam deals
            </Link>
            <Link href="/gog" className="hover:text-foreground">
              GOG deals
            </Link>
            <Link href="/drops" className="hover:text-foreground">
              Price drops
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Account</p>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <Link href="/favorites" className="hover:text-foreground">
              Favorites
            </Link>
            <Link href="/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/browse" className="hover:text-foreground">
              Browse
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
