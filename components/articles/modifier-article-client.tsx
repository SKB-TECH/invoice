"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ModifierArticleForm } from "@/components/articles/modifier-article-form";
import { ModifierArticleSkeleton } from "@/components/articles/modifier-article-skeleton";
import { useFournitureDetail } from "@/core/hooks/fournitures/useFournitureDetail";
import { mapFournitureArticleToDetailRecord } from "@/lib/fournitures/articles/fournitures-mappers";
import { Button } from "@/components/ui/button";

type Props = {
    articleId: string;
};

export function ModifierArticleClient({ articleId }: Props) {
    const tEdit = useTranslations("articles.edit");
    const tList = useTranslations("articles.list");
    const tNavbar = useTranslations("navbar");

    const { data, isPending, isError, error, refetch } =
        useFournitureDetail(articleId);

    if (isPending) {
        return <ModifierArticleSkeleton />;
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
    const visualiserPath = `/home/articles/${encodeURIComponent(article.code)}/visualiser`;

    return (
        <main className="relative w-full text-slate-700">
            <div className="mb-3 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                {" / "}
                <Link href="/home/articles" className="hover:text-slate-600">
                    {tList("title")}
                </Link>
                {" / "}
                <Link
                    href={visualiserPath}
                    className="max-w-[12rem] truncate hover:text-slate-600 sm:max-w-xs"
                >
                    {article.title}
                </Link>
                {" / "}
                <span className="font-semibold text-slate-600">
                    {tEdit("breadcrumbSegment")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {tEdit("title")}
            </h1>
            <p className="mt-2 text-[17px] font-medium text-slate-500">
                {tEdit("referencePrefix")}
                <span className="text-slate-700">{article.code}</span>
            </p>

            <ModifierArticleForm initial={article} apiBaseline={data} />
        </main>
    );
}
