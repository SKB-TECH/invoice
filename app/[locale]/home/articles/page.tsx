"use client";

import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, House, Search } from "lucide-react";
import { ArticlesTable } from "@/components/articles/articles-table";
import { ArticlesTableSkeleton } from "@/components/articles/articles-table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import type {
    ArticleRowStatus,
    ArticleTableRow,
} from "@/components/articles/types";
import { useFournituresList } from "@/core/hooks/fournitures/useFournituresList";
import { useReferentielsCatalog } from "@/core/hooks/referentiels/useReferentielsCatalog";
import { mapFournitureToTableRow } from "@/lib/fournitures/articles/fournitures-mappers";

const LIMIT = 10;

function matchesArticleSearch(
    row: ArticleTableRow,
    query: string,
    statusLabels: Record<ArticleRowStatus, string>,
): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const fields = [
        String(row.id),
        row.code,
        row.title,
        row.referential,
        row.taxGroup,
        row.priceHt,
        row.priceTtc,
        statusLabels[row.status],
        row.status,
        row.period,
    ];
    return fields.some((field) =>
        String(field).toLowerCase().includes(q),
    );
}

export default function HomeFournituresArticlesPage() {
    const router = useRouter();
    const t = useTranslations("articles.list");
    const tNavbar = useTranslations("navbar");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const listParams = useMemo(
        () => ({
            page,
            perPage: LIMIT,
        }),
        [page],
    );

    const { data, isError, error, refetch, isFetching } =
        useFournituresList(listParams);

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
                }),
            ),
        [tableRows, search, suspenduLabel, actifLabel, completLabel],
    );

    const total = data?.meta.total ?? data?.items?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));
    const showLoader = isFetching && data === undefined;
    const columnCount = 8;

    return (
        <main className="mx-auto w-full min-w-full py-4 text-foreground">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNavbar("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <span className="text-slate-800">{t("title")}</span>
            </span>

            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                    {t("title")}
                </h1>
                <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1 sm:w-80">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                            aria-hidden
                        />
                        <Input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("searchPlaceholder")}
                            className="h-12 w-full rounded border-slate-200 pl-9 text-sm shadow-none focus-visible:ring-[#0879bd]/30"
                            aria-label={t("searchAriaLabel")}
                            autoComplete="off"
                        />
                    </div>
                    <Button
                        type="button"
                        size="lg"
                        onClick={() => {
                            router.push("/home/articles/nouveau");
                        }}
                        className="h-12 w-full shrink-0 cursor-pointer rounded bg-[#0879bd] px-5 text-white hover:bg-[#076ca8] sm:w-52"
                    >
                        {tNavbar("NouvelArticle")}
                    </Button>
                </div>
            </div>

            <div className="w-full min-w-full">
                {showLoader ? (
                    <ArticlesTableSkeleton className="w-full" />
                ) : isError ? (
                    <div className="overflow-hidden border border-slate-200/80 bg-white">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        colSpan={columnCount}
                                        className="h-40 px-4 text-center"
                                    >
                                        <p className="text-sm text-red-500">
                                            {t("loadError")}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500 break-words">
                                            {error instanceof Error
                                                ? error.message
                                                : ""}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => refetch()}
                                        >
                                            {t("retry")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="overflow-hidden border border-slate-200/80 bg-white">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        colSpan={columnCount}
                                        className="h-40 text-center text-sm text-slate-500"
                                    >
                                        {t("empty")}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <>
                        {isFetching && data !== undefined ? (
                            <p className="mb-2 text-sm text-slate-500">
                                {t("refreshing")}
                            </p>
                        ) : null}
                        <ArticlesTable
                            rows={filteredArticles}
                            className="w-full"
                        />
                    </>
                )}
            </div>

            {!showLoader && !isError ? (
                <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-slate-500">
                        {t("totalCount", { count: total })}
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || isFetching}
                            className="h-10 w-10 rounded"
                            aria-label={t("paginationPrev")}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>

                        <div className="flex h-10 min-w-32 items-center justify-center border border-slate-200 px-4 text-sm font-medium text-slate-700">
                            {t("pageOfTotal", {
                                page,
                                totalPages,
                            })}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={
                                page >= totalPages || isFetching || total === 0
                            }
                            className="h-10 w-10 rounded"
                            aria-label={t("paginationNext")}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
