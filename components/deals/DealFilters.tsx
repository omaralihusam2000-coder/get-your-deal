"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENRES, SORT_OPTIONS } from "@/lib/constants";

function setParam(params: URLSearchParams, key: string, value: string | undefined) {
  if (!value) params.delete(key);
  else params.set(key, value);
}

export function DealFilters({ storeLocked }: { storeLocked?: "steam" | "gog" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    setParam(params, key, value);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-brand/50";

  return (
    <div className="mb-8 grid gap-3 rounded-3xl border border-line bg-card/80 p-4 sm:grid-cols-2 lg:grid-cols-4">
      {!storeLocked && (
        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
          Store
          <select
            className={inputClass}
            value={searchParams.get("store") ?? "both"}
            onChange={(event) => update("store", event.target.value === "both" ? undefined : event.target.value)}
          >
            <option value="both">Steam + GOG</option>
            <option value="steam">Steam</option>
            <option value="gog">GOG</option>
          </select>
        </label>
      )}
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Genre
        <select
          className={inputClass}
          value={searchParams.get("genre") ?? ""}
          onChange={(event) => update("genre", event.target.value || undefined)}
        >
          <option value="">All genres</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Max price
        <input
          className={inputClass}
          type="number"
          min={0}
          placeholder="Any"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          onBlur={(event) => update("maxPrice", event.target.value || undefined)}
        />
      </label>
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Min discount %
        <input
          className={inputClass}
          type="number"
          min={0}
          max={90}
          placeholder="0"
          defaultValue={searchParams.get("minDiscount") ?? ""}
          onBlur={(event) => update("minDiscount", event.target.value || undefined)}
        />
      </label>
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Release year
        <input
          className={inputClass}
          type="number"
          min={1990}
          max={2030}
          placeholder="Any"
          defaultValue={searchParams.get("year") ?? ""}
          onBlur={(event) => update("year", event.target.value || undefined)}
        />
      </label>
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Min rating
        <select
          className={inputClass}
          value={searchParams.get("minRating") ?? ""}
          onChange={(event) => update("minRating", event.target.value || undefined)}
        >
          <option value="">Any rating</option>
          <option value="60">60%+</option>
          <option value="75">75%+</option>
          <option value="85">85%+</option>
          <option value="95">95%+</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Play mode
        <select
          className={inputClass}
          value={searchParams.get("play") ?? "any"}
          onChange={(event) => update("play", event.target.value === "any" ? undefined : event.target.value)}
        >
          <option value="any">Single or multiplayer</option>
          <option value="single">Single-player</option>
          <option value="multi">Multiplayer</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Sort
        <select
          className={inputClass}
          value={searchParams.get("sort") ?? "deal"}
          onChange={(event) => update("sort", event.target.value === "deal" ? undefined : event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-4">
        <FilterChip
          active={searchParams.get("recent") === "1"}
          onClick={() => update("recent", searchParams.get("recent") === "1" ? undefined : "1")}
        >
          Recently released
        </FilterChip>
        <FilterChip
          active={searchParams.get("bestValue") === "1"}
          onClick={() => update("bestValue", searchParams.get("bestValue") === "1" ? undefined : "1")}
        >
          Best value
        </FilterChip>
        <FilterChip
          active={searchParams.get("biggest") === "1"}
          onClick={() => update("biggest", searchParams.get("biggest") === "1" ? undefined : "1")}
        >
          Biggest discount
        </FilterChip>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-deal text-black" : "bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
