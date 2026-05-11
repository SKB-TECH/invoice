import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { ModifierArticleForm } from "@/components/articles/modifier-article-form";
import { Link } from "@/i18n/routing";
import { getArticleDetailById } from "@/lib/fournitures/articles/articles-data";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function ModifierArticlePage({ params }: PageProps) {
  const { articleId } = await params;
  const decoded = decodeURIComponent(articleId);
  const article = getArticleDetailById(decoded);
  if (!article) {
    notFound();
  }

  const tEdit = await getTranslations("articles.edit");
  const tList = await getTranslations("articles.list");
  const tNavbar = await getTranslations("navbar");

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
        <span className="font-medium text-slate-800">{article.idIkwook}</span>
      </p>

      <ModifierArticleForm initial={article} />
    </main>
  );
}
