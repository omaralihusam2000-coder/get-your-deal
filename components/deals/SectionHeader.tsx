import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">{eyebrow}</p>}
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
