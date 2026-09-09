"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";

export function PlayerSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    startTransition(() => router.push(`/players?${params.toString()}`));
  }

  return (
    <Input
      defaultValue={initialQuery}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search players by name..."
      className="max-w-sm"
    />
  );
}
