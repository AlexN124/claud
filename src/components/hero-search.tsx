"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/players?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex max-w-xl gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search any player… e.g. Nikola Jokić"
        className="w-full rounded-full border border-border bg-background/80 px-5 py-3 text-base shadow-sm outline-none transition-colors focus:border-accent"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
