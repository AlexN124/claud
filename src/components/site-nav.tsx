"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/leaders", label: "Leaders" },
  { href: "/players", label: "Players" },
  { href: "/teams", label: "Teams" },
];

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className="shrink-0">
      <circle cx="12" cy="12" r="11" fill="#f97316" />
      <path
        d="M12 1v22M1 12h22M4.2 4.2c3 3 3 12.6 0 15.6M19.8 4.2c-3 3-3 12.6 0 15.6"
        stroke="#0a0a0a"
        strokeWidth="1.1"
        fill="none"
      />
    </svg>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/players?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-heading text-lg font-bold tracking-tight">
          <LogoMark />
          Hardwood Almanac
        </Link>

        <form onSubmit={onSearch} className="hidden max-w-sm flex-1 sm:block">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any player..."
            className="w-full rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm outline-none transition-colors focus:border-accent focus:bg-background"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
