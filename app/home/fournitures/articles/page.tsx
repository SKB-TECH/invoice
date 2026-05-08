"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, House, Search } from "lucide-react";
import { ArticlesTable } from "@/components/fournitures/articles/articles-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoArticles } from "@/lib/fournitures/articles/articles-data";
import type {
  ArticleRowStatus,
  ArticleTableRow,
} from "@/components/fournitures/articles/types";

const STATUS_LABEL_FR: Record<ArticleRowStatus, string> = {
  suspendu: "Suspendu",
  actif: "Actif",
  complet: "Complet",
};

function matchesArticleSearch(row: ArticleTableRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const fields = [
    row.idIkwook,
    row.title,
    row.group,
    row.priceTtc,
    STATUS_LABEL_FR[row.status],
    row.status,
    row.period,
  ];
  return fields.some((field) => String(field).toLowerCase().includes(q));
}

export default function HomeFournituresArticlesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredArticles = useMemo(
    () => demoArticles.filter((row) => matchesArticleSearch(row, search)),
    [search]
  );

  return (
    <div className="w-full min-w-full space-y-6">
      <span className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/home">
          <House className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        Articles
      </span>

      <div className="flex w-full min-w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-slate-800">Articles</h1>
        <div className="flex min-w-0 w-full flex-row items-center justify-end gap-3 sm:w-auto sm:max-w-none">
          <div className="relative min-w-0 flex-1 sm:flex-none sm:w-96 md:w-md lg:w-lg">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche par ID, titre, groupe, prix TTC, statut, période..."
              className="h-9 w-full rounded-none border-slate-200 pl-9 text-sm shadow-none focus-visible:ring-[#0879bd]/30"
              aria-label="Rechercher un article"
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              router.push("/home/fournitures/articles/nouveau");
            }}
            className="h-9 shrink-0 rounded-none! bg-[#0879bd] px-4 text-sm font-medium text-white hover:bg-[#0879bd]/90"
          >
            Nouvel article
          </Button>
        </div>
      </div>

      <div className="w-full min-w-full">
        {filteredArticles.length === 0 ? (
          <p className="rounded border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
            Aucun article ne correspond à votre recherche.
          </p>
        ) : (
          <ArticlesTable rows={filteredArticles} className="w-full" />
        )}
      </div>
    </div>
  );
}
