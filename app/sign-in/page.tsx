"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProviders";

export default function SignInPage() {
  const { profile, setProfile } = useApp();
  const router = useRouter();
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");

  function submit(event: FormEvent) {
    event.preventDefault();
    setProfile({ name: name.trim() || email.split("@")[0], email: email.trim() });
    router.push("/favorites");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        DealForge keeps a simple device account for favorites and alerts. No password is stored. Add an email to
        receive CheapShark price-drop messages.
      </p>
      <form onSubmit={submit} className="mt-8 grid gap-4 rounded-3xl border border-line bg-card p-6">
        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
          Name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-foreground"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-foreground"
          />
        </label>
        <button type="submit" className="mt-2 h-12 rounded-xl bg-white font-bold text-black hover:bg-deal">
          Save and continue
        </button>
        {profile && (
          <button
            type="button"
            onClick={() => {
              setProfile(null);
              setName("");
              setEmail("");
            }}
            className="text-sm text-muted hover:text-foreground"
          >
            Sign out on this device
          </button>
        )}
      </form>
    </div>
  );
}
