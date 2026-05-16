"use client";

import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ChevronRight, House, Search } from "lucide-react";
import { ArticlesTable } from "@/components/articles/articles-table";
import { ArticlesTableSkeleton } from "@/components/articles/articles-table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
    ArticleRowStatus,
    ArticleTableRow,
} from "@/components/articles/types";
import { useFournituresList } from "@/core/hooks/fournitures/useFournituresList";
import { useReferentielsCatalog } from "@/core/hooks/referentiels/useReferentielsCatalog";
import { mapFournitureToTableRow } from "@/lib/fournitures/articles/fournitures-mappers";

function matchesArticleSearch(
    row: ArticleTableRow,
    query: string,
    statusLabels: Record<ArticleRowStatus, string>
): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const fields = [
        row.navigationId,
        row.code,
        row.title,
        row.referential,
        row.group,
        row.taxGroup,
        row.priceTtc,
        statusLabels[row.status],
        row.status,
        row.period,
    ];
    return fields.some((field) =>
        String(field).toLowerCase().includes(q)
    );
}

export default function HomeFournituresArticlesPage() {
    const router = useRouter();
    const t = useTranslations("articles.list");
    const tNavbar = useTranslations("navbar");
    const [search, setSearch] = useState("");

    const { data, isLoading, isError, error, refetch, isFetching } =
        useFournituresList(1);

    const { items: referentialRows } = useReferentielsCatalog(null);

    const referentialTitleByCategoryId = useMemo(() => {
        const m = new Map<number, string>();
        for (const r of referentialRows) {
            m.set(r.id, r.title.trim());
        }
        return m;
    }, [referentialRows]);

    const suspenduLabel = t("status.suspendu");
    const actifLabel = t("status.actif");
    const completLabel = t("status.complet");

    const tableRows = useMemo(() => {
        const items = data?.items;
        if (!items?.length) return [];
        return items.map((item) =>
            mapFournitureToTableRow(item, referentialTitleByCategoryId),
        );
    }, [data, referentialTitleByCategoryId]);

    const filteredArticles = useMemo(
        () =>
            tableRows.filter((row) =>
                matchesArticleSearch(row, search, {
                    suspendu: suspenduLabel,
                    actif: actifLabel,
                    complet: completLabel,
                })
            ),
        [tableRows, search, suspenduLabel, actifLabel, completLabel]
    );

    const showLoader = isLoading && !data;

    return (
        <div className="w-full min-w-full space-y-6">
            <span className="flex items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNavbar("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4" />
                {t("title")}
            </span>

            <div className="flex w-full min-w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-lg font-bold text-slate-800">{t("title")}</h1>
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
                            placeholder={t("searchPlaceholder")}
                            className="h-9 w-full rounded-none border-slate-200 pl-9 text-sm shadow-none focus-visible:ring-[#0879bd]/30"
                            aria-label={t("searchAriaLabel")}
                            autoComplete="off"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={() => {
                            router.push("/home/articles/nouveau");
                        }}
                        className="h-9 shrink-0 rounded-none! bg-[#0879bd] px-4 text-sm font-medium text-white hover:bg-[#0879bd]/90"
                    >
                        {tNavbar("NouvelArticle")}
                    </Button>
                </div>
            </div>

            <div className="w-full min-w-full">
                {showLoader ? (
                    <ArticlesTableSkeleton className="w-full" />
                ) : isError ? (
                    <div className="rounded border border-slate-200 bg-white px-5 py-8 text-center text-sm space-y-3">
                        <p className="text-red-600">{t("loadError")}</p>
                        <p className="text-xs text-slate-500 break-words">
                            {error instanceof Error ? error.message : ""}
                        </p>
                        <Button type="button" variant="secondary" size="sm" onClick={() => refetch()}>
                            {t("retry")}
                        </Button>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <p className="rounded border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
                        {t("empty")}
                    </p>
                ) : (
                    <>
                        {isFetching && !isLoading ? (
                            <p className="mb-2 text-xs text-slate-400">{t("refreshing")}</p>
                        ) : null}
                        <ArticlesTable rows={filteredArticles} className="w-full" />
                    </>
                )}
            </div>
        </div>
    );
}
