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

export function ModifierBillableServiceSkeleton() {
    const t = useTranslations("configuration.services");
    const tEdit = useTranslations("configuration.services.edit");
    const tNavbar = useTranslations("navbar");

    return (
        <main
            role="status"
            aria-busy="true"
            aria-label={t("loading")}
            className="relative w-full text-slate-700"
        >
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                <span>/</span>
                <Link href="/home/services" className="hover:text-slate-600">
                    {t("listSectionTitle")}
                </Link>
                <span>/</span>
                <SkeletonLine className="inline-block h-4 w-28 max-w-48 sm:max-w-xs" />
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
                        <FieldLabel>{t("fields.serviceName")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{t("fields.code")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{t("fields.businessSector")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{t("fields.currency")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{t("fields.unitPrice")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div>
                        <FieldLabel>{t("fields.priceInclTax")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div className="lg:col-span-2">
                        <FieldLabel>{t("fields.taxGroup")}</FieldLabel>
                        <SkeletonField />
                    </div>
                    <div className="lg:col-span-2">
                        <FieldLabel>{t("fields.description")}</FieldLabel>
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
