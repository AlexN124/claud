"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function PlayerAvatar({
  playerId,
  name,
  size = 40,
  className,
}: {
  playerId: number;
  name: string;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground",
          className
        )}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-full bg-secondary object-cover object-top", className)}
    />
  );
}
