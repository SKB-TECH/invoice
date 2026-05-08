import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { ModifierArticleForm } from "@/app/home/fournitures/articles/_components/modifier-article-form";
import { getArticleDetailById } from "@/app/home/fournitures/articles/_lib/articles-data";

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

  return (
    <main className="mx-auto w-full min-w-full text-foreground">
      <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link href="/home">
          <House className="size-4" />
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <Link
          href="/home/fournitures/articles"
          className="hover:text-slate-700"
        >
          Articles
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <Link
          href={`/home/fournitures/articles/${encodeURIComponent(article.idIkwook)}/visualiser`}
          className="max-w-[10rem] truncate text-slate-600 hover:text-slate-800 sm:max-w-xs"
        >
          {article.title}
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        Modifier
      </span>

      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
        Modifier l&apos;article
      </h1>
      <p className="mb-6 text-sm text-slate-600">
        Réf.&nbsp;: <span className="font-medium text-slate-800">{article.idIkwook}</span>
      </p>

      <ModifierArticleForm initial={article} />
    </main>
  );
}
