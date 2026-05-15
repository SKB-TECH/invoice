"use client";

import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ModifierArticleForm } from "@/components/articles/modifier-article-form";
import { useFournitureDetail } from "@/core/hooks/fournitures/useFournitureDetail";
import { mapFournitureArticleToDetailRecord } from "@/lib/fournitures/articles/fournitures-mappers";
import Loader from "@/components/loader/Loader";
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
    const visualiserPath = `/home/articles/${encodeURIComponent(article.idIkwook)}/visualiser`;

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
                <Link
                    href={visualiserPath}
                    className="max-w-[10rem] truncate text-slate-600 hover:text-slate-800 sm:max-w-xs"
                >
                    {article.title}
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                {tEdit("breadcrumbSegment")}
            </span>

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                {tEdit("title")}
            </h1>
            <p className="mb-6 text-sm text-slate-600">
                {tEdit("referencePrefix")}
                <span className="font-medium text-slate-800">{article.code}</span>
            </p>

            <ModifierArticleForm initial={article} apiBaseline={data} />
        </main>
    );
}
