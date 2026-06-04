"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { XzReportGeneratePanel } from "@/components/reports/xz-report-generate-panel";
import { XzReportListPanel } from "@/components/reports/xz-report-list-panel";
import { usePathname, useRouter } from "@/i18n/routing";

export function SpecialXzReportPanel() {
    const t = useTranslations("reports");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isGenerateView = searchParams.get("generate") === "1";

    const goToGenerate = () => {
        const q = new URLSearchParams(searchParams.toString());
        q.set("menu", "reportXDaily");
        q.set("generate", "1");
        router.push(`${pathname}?${q.toString()}`);
    };

    const goToList = () => {
        const q = new URLSearchParams(searchParams.toString());
        q.set("menu", "reportXDaily");
        q.delete("generate");
        const suffix = q.toString();
        router.replace(suffix ? `${pathname}?${suffix}` : pathname);
    };

    return (
        <SectionCard title={t("specialXz.title")}>
            {isGenerateView ? (
                <XzReportGeneratePanel onBack={goToList} />
            ) : (
                <XzReportListPanel onGenerate={goToGenerate} />
            )}
        </SectionCard>
    );
}
