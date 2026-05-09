import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { formatDeviseLibelle, getArticleDetailById } from "@/lib/fournitures/articles/articles-data";
import { ArticleTaxGroupLabel } from "@/components/articles/article-tax-group-label";
import { VisualiserArticleActions } from "@/components/articles/visualiser-article-actions";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

function formatMontant(n: number): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function VisualiserArticlePage({ params }: PageProps) {
  const { articleId } = await params;
  const decoded = decodeURIComponent(articleId);
  const article = getArticleDetailById(decoded);
  if (!article) {
    notFound();
  }

  const devise = formatDeviseLibelle(article.devise);
  const basePath = `/home/articles/${encodeURIComponent(article.idIkwook)}`;

  return (
    <main className="mx-auto w-full min-w-full text-foreground">
      <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link href="/home">
          <House className="size-4" />
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <Link
          href="/home/articles"
          className="hover:text-slate-700"
        >
          Articles
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <span className="max-w-[12rem] truncate text-slate-600 sm:max-w-md">
          {article.title}
        </span>
        <ChevronRight className="size-4 shrink-0" />
        Visualiser
      </span>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Détail de l&apos;article
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Réf.&nbsp;{" "}
            <span className="font-medium text-slate-800">{article.idIkwook}</span>
          </p>
        </div>
      </div>

      <section className="rounded border border-slate-200/80 bg-white p-6 sm:p-8">
        <dl className="grid gap-8 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nom
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {article.title}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Code
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {article.code}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </dt>
            <dd className="mt-2 rounded border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-800">
              {article.description}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Prix hors taxes
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">
              {formatMontant(article.prixHt)} {devise}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Prix TTC
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">
              {formatMontant(article.prixTtc)} {devise}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tax
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
