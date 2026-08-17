"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/layout/SearchBar";
import { useApp } from "@/components/providers/AppProviders";
import { CURRENCIES } from "@/lib/types";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/deals", label: "Deals" },
  { href: "/steam", label: "Steam" },
  { href: "/gog", label: "GOG" },
  { href: "/browse", label: "Browse" },
  { href: "/drops", label: "Price Drops" },
  { href: "/favorites", label: "Favorites" },
];

export function Navbar() {
  const pathname = usePathname();
  const { currency, setCurrency, profile } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[#08090d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-linear-to-br from-brand to-accent text-sm shadow-[0_0_24px_rgba(108,59,255,0.45)]">
            DF
          </span>
          <span className="text-lg">DealForge</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground",
                pathname === link.href && "bg-white/8 text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden flex-1 items-center justify-end gap-3 md:flex lg:max-w-md">
          <SearchBar />
        </div>

        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value as (typeof CURRENCIES)[number])}
          className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold md:block"
          aria-label="Currency"
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code} className="bg-surface">
              {code}
            </option>
          ))}
        </select>

        <Link
          href="/sign-in"
          className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-deal md:inline-flex"
        >
          {profile ? profile.name.split(" ")[0] : "Sign In"}
        </Link>

        <button
          type="button"
          className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-white/10 md:ml-0 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-[#08090d] px-4 py-4 lg:hidden">
          <SearchBar className="mb-4" />
          <div className="grid gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as (typeof CURRENCIES)[number])}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold"
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code} className="bg-surface">
                  {code}
                </option>
              ))}
            </select>
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              {profile ? profile.name.split(" ")[0] : "Sign In"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
