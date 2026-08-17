import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-deal">404</p>
      <h1 className="mt-3 text-4xl font-bold">This page has no deal</h1>
      <p className="mt-3 text-muted">The game or page you wanted is missing. Search again or browse live deals.</p>
      <Link href="/deals" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
        Browse deals
      </Link>
    </div>
  );
}
