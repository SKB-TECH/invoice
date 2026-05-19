"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArticleTaxGroupLabel } from "@/components/articles/article-tax-group-label";
import { VisualiserArticleActions } from "@/components/articles/visualiser-article-actions";
import { ArticleVisualiserSkeleton } from "@/components/articles/article-visualiser-skeleton";
import { formatDeviseLibelle } from "@/lib/fournitures/articles/articles-data";
import { mapFournitureArticleToDetailRecord } from "@/lib/fournitures/articles/fournitures-mappers";
import { useFournitureDetail } from "@/core/hooks/fournitures/useFournitureDetail";
import {
    FieldLabel,
    ReadOnlyField,
    ReadOnlyTextarea,
} from "@/components/invoices/create/Fields";
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
        return <ArticleVisualiserSkeleton />;
    }

    if (isError || !data) {
        return (
            <main className="w-full text-slate-700">
                <p className="text-sm font-medium text-red-500">
                    {tList("loadErrorDetail")}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                    {error instanceof Error ? error.message : ""}
                </p>
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-3"
                    onClick={() => refetch()}
                >
                    {tList("retry")}
                </Button>
            </main>
        );
    }

    const article = mapFournitureArticleToDetailRecord(data);
    const devise = formatDeviseLibelle(article.devise);
    const basePath = `/home/articles/${encodeURIComponent(article.idIkwook)}`;

    return (
        <main className="relative w-full text-slate-700">
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                <span>/</span>
                <Link href="/home/articles" className="hover:text-slate-600">
                    {tList("title")}
                </Link>
                <span>/</span>
                <span className="max-w-48 truncate text-slate-600 sm:max-w-md">
                    {article.title}
                </span>
                <span>/</span>
                <span className="font-semibold text-slate-600">
                    {tNavbar("Visualiser")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {article.title}
            </h1>
            <p className="mt-2 text-[17px] font-medium text-slate-500">
                {t("referenceLabel")}
                {"\u00a0"}
                <span className="text-slate-700">{article.code}</span>
            </p>

            <div className="mt-4 bg-white p-8">
                <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                    <div>
                        <FieldLabel>{t("fields.name")}</FieldLabel>
                        <ReadOnlyField>{article.title}</ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.code")}</FieldLabel>
                        <ReadOnlyField>{article.code}</ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.priceExclTax")}</FieldLabel>
                        <ReadOnlyField className="font-semibold tabular-nums">
                            {formatMontant(article.prixHt)} {devise}
                        </ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.priceInclTax")}</FieldLabel>
                        <ReadOnlyField className="font-semibold tabular-nums">
                            {formatMontant(article.prixTtc)} {devise}
                        </ReadOnlyField>
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>{t("fields.taxGroup")}</FieldLabel>
                        <ReadOnlyField>
                            <ArticleTaxGroupLabel
                                taxGroupId={article.groupeTax}
                                includeCode={false}
                            />
                        </ReadOnlyField>
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>{t("fields.description")}</FieldLabel>
                        <ReadOnlyTextarea>
                            {article.description || "—"}
                        </ReadOnlyTextarea>
                    </div>
                </div>

                <VisualiserArticleActions
                    modifierPath={`${basePath}/modifier`}
                />
            </div>
        </main>
    );
}
