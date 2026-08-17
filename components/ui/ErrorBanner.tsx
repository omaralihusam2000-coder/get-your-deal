import { AlertTriangle } from "lucide-react";
import type { SourceStatus } from "@/lib/types";

export function ErrorBanner({
  sources,
  notice,
}: {
  sources?: {
    cheapshark?: SourceStatus;
    steam?: SourceStatus;
    gog?: SourceStatus;
    fx?: SourceStatus;
  };
  notice?: string | null;
}) {
  const failed = [
    sources?.cheapshark === "unavailable" ? "CheapShark deal listings" : null,
    sources?.steam === "unavailable" ? "Steam" : null,
    sources?.gog === "unavailable" ? "GOG" : null,
    sources?.fx === "unavailable" ? "currency conversion" : null,
  ].filter(Boolean);

  if (!failed.length && !notice) return null;

  return (
    <div className="mb-6 flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {failed.length > 0 && (
          <p>
            Some data sources are unavailable: {failed.join(", ")}. Showing whatever live prices we could verify.
          </p>
        )}
        {notice && <p className={failed.length ? "mt-1" : ""}>{notice}</p>}
      </div>
    </div>
  );
}
