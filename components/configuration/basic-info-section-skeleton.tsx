"use client";

import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { cn } from "@/lib/utils";

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

function SkeletonField({ wide = false }: { wide?: boolean }) {
    return (
        <div className={wide ? "md:col-span-2" : undefined}>
            <SkeletonLine className="mb-1 h-4 w-24" />
            <SkeletonLine className="h-12 w-full" />
        </div>
    );
}

export function BasicInfoSectionSkeleton() {
    const t = useTranslations("configuration");

    return (
        <SectionCard title={t("basicInfo.sectionTitle")}>
            <div
                role="status"
                aria-busy="true"
                aria-label={t("basicInfo.loading")}
            >
                <div className="mb-4 flex justify-end">
                    <SkeletonLine className="h-9 w-24" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <SkeletonField />
                    <SkeletonField />
                    <SkeletonField />
                    <SkeletonField />
                    <SkeletonField wide />
                </div>
            </div>
        </SectionCard>
    );
}
