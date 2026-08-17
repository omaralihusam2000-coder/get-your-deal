"use client";

import { FormEvent, useState } from "react";
import { useApp } from "@/components/providers/AppProviders";

export function AlertCta() {
  const { profile, setProfile } = useApp();
  const [email, setEmail] = useState(profile?.email ?? "");
  const [done, setDone] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) return;
    setProfile({ name: profile?.name || email.split("@")[0], email });
    setDone(true);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-[2rem] border border-brand/30 bg-linear-to-r from-brand/20 to-accent/10 p-8 sm:p-12">
        <h2 className="text-3xl font-bold sm:text-4xl">Never miss a great deal again.</h2>
        <p className="mt-3 max-w-xl text-muted">
          Save your email on this device, then set a target price on any game page. Email alerts are sent through
          CheapShark when a watched game drops.
        </p>
        {done ? (
          <p className="mt-6 font-semibold text-deal">You&apos;re set. Open a game and choose a target price.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 outline-none focus:border-brand/50"
            />
            <button type="submit" className="h-12 rounded-2xl bg-white px-6 font-bold text-black hover:bg-deal">
              Enable alerts
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
