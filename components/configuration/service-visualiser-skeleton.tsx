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

export function ServiceVisualiserSkeleton() {
    const tView = useTranslations("configuration.services.view");
    const tList = useTranslations("configuration.services");
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
                <Link href="/home/services" className="hover:text-slate-600">
                    {tList("listSectionTitle")}
                </Link>
                <span>/</span>
                <SkeletonLine className="inline-block h-4 w-28 max-w-48 sm:max-w-md" />
                <span>/</span>
                <span className="font-semibold text-slate-500">
                    {tNavbar("Visualiser")}
                </span>
            </div>

            <SkeletonLine className="h-10 w-full max-w-lg" />
            <SkeletonLine className="mt-3 h-5 w-36" />

            <div className="mt-4 bg-white p-8">
                <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2 animate-pulse">
                    <div>
                        <FieldLabel>{tView("fields.serviceName")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tView("fields.code")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tView("fields.businessSector")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tView("fields.unitPrice")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tView("fields.taxGroup")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tView("fields.priceInclTax")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tView("fields.currency")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{tView("fields.referential")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div className="lg:col-span-2">
                        <FieldLabel>{tView("fields.description")}</FieldLabel>
                        <SkeletonLine className="min-h-[120px] w-full" />
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-end gap-5">
                    <SkeletonLine className="h-[50px] w-52 shrink-0 rounded" />
                    <SkeletonLine className="h-[50px] w-52 shrink-0 rounded" />
                    <SkeletonLine className="h-[50px] w-52 shrink-0 rounded" />
                </div>
            </div>
        </main>
    );
}
