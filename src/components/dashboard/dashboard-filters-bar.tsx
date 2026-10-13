"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, ArrowUpDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SortKey = "recent" | "name" | "score-desc" | "score-asc" | "tests";

const SORT_LABELS: Record<SortKey, string> = {
  recent: "Activité récente",
  name: "Nom A→Z",
  "score-desc": "Score ↓",
  "score-asc": "Score ↑",
  tests: "Nombre de tests",
};

interface DashboardFiltersBarProps {
  q: string;
  sort: SortKey;
  total: number;
}

export function DashboardFiltersBar({ q, sort, total }: DashboardFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Input contrôlé localement, debounce 300 ms avant de pousser dans l'URL
  const [input, setInput] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushedRef = useRef(q);

  useEffect(() => {
    setInput(q);
    lastPushedRef.current = q;
  }, [q]);

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams();
    if (input) params.set("q", input);
    if (sort !== "recent") params.set("sort", sort);
    params.set("page", "1"); // reset pagination
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function onInputChange(value: string) {
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value !== lastPushedRef.current) {
        lastPushedRef.current = value;
        pushParams({ q: value || null });
      }
    }, 300);
  }

  function onSortChange(newSort: SortKey) {
    pushParams({ sort: newSort === "recent" ? null : newSort });
  }

  function clearSearch() {
    setInput("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    lastPushedRef.current = "";
    pushParams({ q: null });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Recherche */}
      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          inputMode="search"
          autoComplete="off"
          placeholder="Rechercher un site (nom ou URL)…"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="pl-9 pr-9"
          aria-label="Rechercher un site"
        />
        {input && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Compteur + tri */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {total} site{total > 1 ? "s" : ""}
        </span>
        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <select
            aria-label="Trier par"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            disabled={isPending}
            className={cn(
              "appearance-none rounded-md border border-border/60 bg-background/40",
              "py-1.5 pl-7 pr-7 text-xs font-medium text-foreground",
              "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              "disabled:opacity-50"
            )}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}