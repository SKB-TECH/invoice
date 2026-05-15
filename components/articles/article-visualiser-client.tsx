"use client";

import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArticleTaxGroupLabel } from "@/components/articles/article-tax-group-label";
import { VisualiserArticleActions } from "@/components/articles/visualiser-article-actions";
import { formatDeviseLibelle } from "@/lib/fournitures/articles/articles-data";
import { mapFournitureArticleToDetailRecord } from "@/lib/fournitures/articles/fournitures-mappers";
import { useFournitureDetail } from "@/core/hooks/fournitures/useFournitureDetail";
import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";

function formatMontant(n: number): string {
    return n.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

type Props = {
    articleId: string;
};

export function ArticleVisualiserClient({ articleId }: Props) {
    const t = useTranslations("articles.view");
    const tNavbar = useTranslations("navbar");
    const tList = useTranslations("articles.list");

    const { data, isPending, isError, error, refetch } =
        useFournitureDetail(articleId);

    if (isPending) {
        return <Loader variant="page" text={tList("loading")} />;
    }

    if (isError || !data) {
        return (
            <main className="mx-auto w-full min-w-full space-y-4 text-foreground">
                <p className="text-sm text-red-600">
                    {tList("loadErrorDetail")}
                </p>
                <p className="text-xs text-slate-500">
                    {error instanceof Error ? error.message : ""}
                </p>
                <Button type="button" variant="secondary" onClick={() => refetch()}>
                    {tList("retry")}
                </Button>
            </main>
        );
    }

    const article = mapFournitureArticleToDetailRecord(data);
    const devise = formatDeviseLibelle(article.devise);
    const basePath = `/home/articles/${encodeURIComponent(article.idIkwook)}`;

    return (
        <main className="mx-auto w-full min-w-full text-foreground">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNavbar("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link href="/home/articles" className="hover:text-slate-700">
                    {tList("title")}
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <span className="max-w-[12rem] truncate text-slate-600 sm:max-w-md">
                    {article.title}
                </span>
                <ChevronRight className="size-4 shrink-0" />
                {tNavbar("Visualiser")}
            </span>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                        {t("title")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        {t("referenceLabel")}
                        {"\u00a0"}
                        <span className="font-medium text-slate-800">
                            {article.code}
                        </span>
                    </p>
                </div>
            </div>

            <section className="rounded border border-slate-200/80 bg-white p-6 sm:p-8">
                <dl className="grid gap-8 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t("fields.name")}
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {article.title}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t("fields.code")}
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {article.code}
                        </dd>
                    </div>

                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t("fields.description")}
                        </dt>
                        <dd className="mt-2 rounded border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-800">
                            {article.description || "—"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t("fields.priceExclTax")}
                        </dt>
                        <dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">
                            {formatMontant(article.prixHt)} {devise}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t("fields.priceInclTax")}
                        </dt>
                        <dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">
                            {formatMontant(article.prixTtc)} {devise}
                        </dd>
                    </div>

                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t("fields.taxGroup")}
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            <ArticleTaxGroupLabel taxGroupId={article.groupeTax} />
                        </dd>
                    </div>
                </dl>

                <VisualiserArticleActions modifierPath={`${basePath}/modifier`} />
            </section>
        </main>
    );
}
