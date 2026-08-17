import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-card/50 px-6 py-16 text-center">
      <SearchX className="mb-4 h-10 w-10 text-muted" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{body}</p>
    </div>
  );
}
