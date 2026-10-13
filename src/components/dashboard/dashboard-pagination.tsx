"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortKey = "recent" | "name" | "score-desc" | "score-asc" | "tests";

interface DashboardPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  q: string;
  sort: SortKey;
}

function buildHref(
  pathname: string,
  page: number,
  q: string,
  sort: SortKey
): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (sort !== "recent") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function DashboardPagination({
  page,
  totalPages,
  total,
  perPage,
  q,
  sort,
}: DashboardPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function navigate(targetPage: number) {
    startTransition(() => {
      router.push(buildHref(pathname, targetPage, q, sort), { scroll: false });
    });
  }

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  // Génère une liste compacte de pages : 1, …, p-1, p, p+1, …, last
  const pages: (number | "ellipsis")[] = [];
  const around = new Set<number>([page - 1, page, page + 1]);
  if (page <= 3) [1, 2, 3, 4].forEach((p) => around.add(p));
  if (page >= totalPages - 2) {
    for (let p = totalPages - 3; p <= totalPages; p++) around.add(p);
  }
  const sorted = Array.from(around)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  sorted.forEach((p, idx) => {
    if (idx > 0 && p - sorted[idx - 1] > 1) pages.push("ellipsis");
    pages.push(p);
  });

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted-foreground tabular-nums">
        {start}–{end} sur {total}
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(page - 1)}
          disabled={page <= 1 || isPending}
          aria-label="Page précédente"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="px-1 text-xs text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => navigate(p)}
              disabled={isPending}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={cn(
                "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-medium tabular-nums transition-colors",
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                "disabled:opacity-50"
              )}
            >
              {p}
            </button>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(page + 1)}
          disabled={page >= totalPages || isPending}
          aria-label="Page suivante"
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}