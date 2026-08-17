"use client";

import { useState } from "react";

export function CoverImage({
  src,
  fallback,
  alt,
  className,
}: {
  src?: string | null;
  fallback?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  const current = [src, fallback].filter((value): value is string => Boolean(value) && !failed[value])[0] ?? "";

  if (!current) {
    return <div className={`bg-white/5 ${className ?? ""}`} aria-hidden />;
  }

  return (
    // External store CDNs vary; native img avoids optimizer 404s on missing artwork.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed((prev) => ({ ...prev, [current]: true }))}
    />
  );
}
