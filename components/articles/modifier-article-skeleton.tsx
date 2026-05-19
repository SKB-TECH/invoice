"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/invoices/create/Fields";

function SkeletonLine({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "block rounded bg-slate-200/90 animate-pulse",
                className,
            )}
            aria-hidden
        />
    );
}

function SkeletonField() {
    return <SkeletonLine className="h-[50px] w-full" />;
}

export function ModifierArticleSkeleton() {
    const tCreate = useTranslations("articles.create");
    const tEdit = useTranslations("articles.edit");
    const tList = useTranslations("articles.list");
    const tNavbar = useTranslations("navbar");

    return (
        <main
            role="status"
            aria-busy="true"
            aria-label={tList("loading")}
            className="relative w-full text-slate-700"
        >
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                <span>/</span>
                <Link href="/home/articles" className="hover:text-slate-600">
                    {tList("title")}
                </Link>
                <span>/</span>
                <SkeletonLine className="inline-block h-4 w-28 max-w-40 sm:max-w-xs" />
                <span>/</span>
                <span className="font-semibold text-slate-500">
                    {tEdit("breadcrumbSegment")}
                </span>
            </div>

            <SkeletonLine className="h-10 w-full max-w-md" />
            <SkeletonLine className="mt-3 h-5 w-36" />

            <div className="mt-4 bg-white p-8">
                <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2 animate-pulse">
                    <div>
                        <FieldLabel>{tCreate("fields.name")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tCreate("fields.code")}</FieldLabel>
                        <SkeletonField />
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>{tCreate("fields.referential")}</FieldLabel>
                        <SkeletonField />
                    </div>

                    <div>
                        <FieldLabel>{tCreate("fields.currency")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tCreate("fields.priceExclTax")}</FieldLabel>
                        <SkeletonField />
                    </div>

                    <div>
                        <FieldLabel>{tCreate("fields.taxGroup")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tCreate("fields.priceInclTax")}</FieldLabel>
                        <SkeletonField />
                    </div>

                    <div>
                        <FieldLabel>{tCreate("fields.specialPrice")}</FieldLabel>
                        <SkeletonField />
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1">
                            <FieldLabel>{tCreate("fields.pieceUnit")}</FieldLabel>
                            <SkeletonField />
                        </div>
                        <div className="w-full sm:w-40">
                            <FieldLabel>{tCreate("fields.unit")}</FieldLabel>
                            <SkeletonField />
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>{tCreate("fields.description")}</FieldLabel>
                        <SkeletonLine className="min-h-[120px] w-full" />
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-end gap-5">
                    <SkeletonLine className="h-[50px] w-52 shrink-0 rounded" />
                    <SkeletonLine className="h-[50px] w-52 shrink-0 rounded" />
                </div>
            </div>
        </main>
    );
}
