"use client";

import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

function SkeletonLine({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "inline-block rounded bg-slate-200/90 align-middle animate-pulse",
                className
            )}
            aria-hidden
        />
    );
}

export function ArticleVisualiserSkeleton() {
    const tView = useTranslations("articles.view");
    const tList = useTranslations("articles.list");
    const tNavbar = useTranslations("navbar");

    return (
        <main
            role="status"
            aria-busy="true"
            aria-label={tList("loading")}
            className="mx-auto w-full min-w-full text-foreground"
        >
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNavbar("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link href="/home/articles" className="hover:text-slate-700">
                    {tList("title")}
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <SkeletonLine className="h-4 min-w-[8rem] max-w-[12rem] flex-1 sm:max-w-md" />
                <ChevronRight className="size-4 shrink-0 opacity-70" />
                <span className="text-slate-400">{tNavbar("Visualiser")}</span>
            </span>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                        {tView("title")}
                    </h1>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <span>{tView("referenceLabel")}</span>
                        <SkeletonLine className="h-4 w-32" />
                    </p>
                </div>
            </div>

            <section className="rounded border border-slate-200/80 bg-white p-6 sm:p-8">
                <dl className="grid gap-8 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {tView("fields.name")}
                        </dt>
                        <dd className="mt-2">
                            <SkeletonLine className="h-5 w-[88%]" />
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {tView("fields.code")}
                        </dt>
                        <dd className="mt-2">
                            <SkeletonLine className="h-5 w-36" />
                        </dd>
                    </div>

                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {tView("fields.description")}
                        </dt>
                        <dd className="mt-2 rounded border border-slate-100 bg-slate-50/80 px-4 py-3">
                            <div className="space-y-2">
                                <SkeletonLine className="h-4 w-full" />
                                <SkeletonLine className="h-4 w-[96%]" />
                                <SkeletonLine className="h-4 w-[78%]" />
                            </div>
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {tView("fields.priceExclTax")}
                        </dt>
                        <dd className="mt-2">
                            <SkeletonLine className="h-5 w-44" />
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {tView("fields.priceInclTax")}
                        </dt>
                        <dd className="mt-2">
                            <SkeletonLine className="h-5 w-44" />
                        </dd>
                    </div>

                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {tView("fields.taxGroup")}
                        </dt>
                        <dd className="mt-2">
                            <SkeletonLine className="h-6 w-48" />
                        </dd>
                    </div>
                </dl>

                <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 md:flex-row md:flex-wrap md:justify-end">
                    <SkeletonLine className="h-12 w-52 shrink-0 rounded-none" />
                    <SkeletonLine className="h-12 w-52 shrink-0 rounded-none" />
                </div>
            </section>
        </main>
    );
}
