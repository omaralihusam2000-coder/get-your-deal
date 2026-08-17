"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { CoverImage } from "@/components/ui/CoverImage";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { DealGame } from "@/lib/types";

export function SearchBar({
  large = false,
  defaultValue = "",
  className,
}: {
  large?: boolean;
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<DealGame[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) return;
    const handle = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data: { games?: DealGame[] }) => setResults(data.games?.slice(0, 6) ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for a game..."
          className={cn(
            "w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-foreground outline-none transition placeholder:text-muted/70 focus:border-brand/60 focus:bg-black/40 focus:ring-4 focus:ring-brand/20",
            large ? "h-16 text-lg" : "h-11 text-sm",
          )}
        />
      </form>
      {open && query.trim().length >= 2 && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-[#101218] shadow-card">
          {loading && <p className="px-4 py-3 text-sm text-muted">Searching live catalogs…</p>}
          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted">No verified matches yet. Try the full search.</p>
          )}
          {query.trim().length >= 2 &&
            results.map((game) => (
            <Link
              key={game.gameId}
              href={`/game/${game.gameId}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5"
            >
              <CoverImage
                src={game.cover}
                fallback={game.thumb}
                alt=""
                className="h-12 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{game.title}</p>
                <p className="text-sm text-deal">
                  {game.bestOffer ? formatMoney(game.bestOffer.currentPrice) : "Compare prices"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
