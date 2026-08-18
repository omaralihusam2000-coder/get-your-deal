import { notFound } from "next/navigation";
import { ComparisonTable } from "@/components/deals/ComparisonTable";
import { PriceChart } from "@/components/deals/PriceChart";
import { StoreDealLink } from "@/components/deals/StoreDealLink";
import { FavoriteButton } from "@/components/game/FavoriteButton";
import { PriceAlertForm } from "@/components/game/PriceAlertForm";
import { CoverImage } from "@/components/ui/CoverImage";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { formatDate, formatDiscount, formatMoney } from "@/lib/format";
import { getGameDetails } from "@/lib/deals";
import { getRequestCurrency } from "@/lib/currency-server";
import { isOfficialStoreUrl } from "@/lib/store-links";
import { TRUST_COPY } from "@/lib/constants";

export const revalidate = 180;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currency = await getRequestCurrency();
  const game = await getGameDetails(id, currency);
  return {
    title: game ? `${game.title} price comparison` : "Game not found",
    description: game?.shortDescription ?? "Compare live Steam and GOG prices.",
  };
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currency = await getRequestCurrency();
  const game = await getGameDetails(id, currency);
  if (!game) notFound();

  const discount = game.bestOffer ? Math.round(game.bestOffer.discountPercent) : 0;

  return (
    <article>
      <section className="relative min-h-[420px] overflow-hidden">
        <CoverImage
          src={game.background || game.cover}
          fallback={game.cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#08090d] via-[#08090d]/75 to-black/30" />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-end px-4 py-10 sm:px-6">
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-deal">
            {game.genres.slice(0, 4).map((genre) => (
              <span key={genre} className="rounded-full bg-black/40 px-3 py-1">
                {genre}
              </span>
            ))}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">{game.title}</h1>
          <div className="mt-5 flex flex-wrap items-end gap-4">
            {discount > 0 && (
              <span className="badge-live rounded-full bg-deal px-3 py-1 text-lg font-bold text-black">
                {formatDiscount(discount)}
              </span>
            )}
            <p className="text-5xl font-extrabold">
              {game.bestOffer ? formatMoney(game.bestOffer.currentPrice) : "Unavailable"}
            </p>
            {game.bestOffer && game.bestOffer.originalPrice.amount > game.bestOffer.currentPrice.amount && (
              <p className="text-xl text-muted line-through">{formatMoney(game.bestOffer.originalPrice)}</p>
            )}
          </div>
          <p className="mt-2 text-sm text-muted">
            Cheapest store: {game.bestOffer?.storeName ?? "None available"} · Release: {formatDate(game.releaseDate)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {game.bestOffer && (
              <StoreDealLink
                offer={game.bestOffer}
                className="inline-flex items-center gap-2 rounded-full bg-deal px-6 py-3 text-sm font-bold text-black"
              />
            )}
            <FavoriteButton gameId={game.gameId} title={game.title} cover={game.cover} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-10">
          <ErrorBanner sources={game.sources} />
          <section>
            <h2 className="mb-4 text-2xl font-bold">Price comparison</h2>
            <p className="mb-4 text-sm text-muted">These are the current prices on Steam and GOG, not third-party copies.</p>
            <ComparisonTable offers={game.offers.filter((offer) => offer.verified)} bestStore={game.bestOffer?.store} />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-bold">Price history</h2>
            <PriceChart history={game.history} />
          </section>
          {game.shortDescription && (
            <section>
              <h2 className="mb-3 text-2xl font-bold">About</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-muted">{game.description || game.shortDescription}</p>
            </section>
          )}
          {game.screenshots.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">Screenshots</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {game.screenshots.map((shot) => (
                  <CoverImage key={shot} src={shot} alt="" className="h-48 w-full rounded-2xl object-cover" />
                ))}
              </div>
            </section>
          )}
          {(game.systemRequirements.minimum || game.systemRequirements.recommended) && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">System requirements</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {game.systemRequirements.minimum && (
                  <pre className="whitespace-pre-wrap rounded-2xl border border-line bg-card p-4 font-sans text-sm leading-6 text-muted">
                    {game.systemRequirements.minimum}
                  </pre>
                )}
                {game.systemRequirements.recommended && (
                  <pre className="whitespace-pre-wrap rounded-2xl border border-line bg-card p-4 font-sans text-sm leading-6 text-muted">
                    {game.systemRequirements.recommended}
                  </pre>
                )}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-5">
          <div className="rounded-3xl border border-line bg-card p-5">
            <dl className="grid gap-3 text-sm">
              <Row label="Developer" value={game.developers.join(", ") || "—"} />
              <Row label="Publisher" value={game.publishers.join(", ") || "—"} />
              <Row label="Release date" value={formatDate(game.releaseDate)} />
              <Row label="Genre" value={game.genres.join(", ") || "—"} />
              <Row
                label="User rating"
                value={
                  game.userRating?.percent
                    ? `${game.userRating.percent}% ${game.userRating.text ? `(${game.userRating.text})` : ""} · ${game.userRating.source}`
                    : "Not published here"
                }
              />
            </dl>
            <div className="mt-5 grid gap-2">
              {game.steamUrl && isOfficialStoreUrl(game.steamUrl) && (
                <a href={game.steamUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/8 px-4 py-3 text-sm font-semibold hover:bg-white/12">
                  Official Steam page →
                </a>
              )}
              {game.gogUrl && isOfficialStoreUrl(game.gogUrl) && (
                <a href={game.gogUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/8 px-4 py-3 text-sm font-semibold hover:bg-white/12">
                  Official GOG page →
                </a>
              )}
            </div>
          </div>
          <PriceAlertForm
            gameId={game.gameId}
            title={game.title}
            cover={game.cover}
            currentPrice={game.bestOffer?.currentPrice.amount ?? null}
          />
          <p className="text-xs leading-5 text-muted">{TRUST_COPY}</p>
        </aside>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
