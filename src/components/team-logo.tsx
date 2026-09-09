"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { teamColor } from "@/lib/team-colors";

export function TeamLogo({
  teamId,
  abbreviation,
  size = 32,
  className,
}: {
  teamId: number;
  abbreviation: string;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const { primary } = teamColor(abbreviation);

  if (errored) {
    return (
      <div
        style={{ width: size, height: size, backgroundColor: primary }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-white",
          className
        )}
      >
        {abbreviation}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`}
      alt={abbreviation}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ width: size, height: size }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
