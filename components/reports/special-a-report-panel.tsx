"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { ReportAGeneratePanel } from "@/components/reports/report-a-generate-panel";
import { ReportAListPanel } from "@/components/reports/report-a-list-panel";
import { usePathname, useRouter } from "@/i18n/routing";

export function SpecialAReportPanel() {
    const t = useTranslations("reports");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isGenerateView = searchParams.get("generate") === "1";

    const goToGenerate = () => {
        const q = new URLSearchParams(searchParams.toString());
        q.delete("menu");
        q.set("generate", "1");
        router.push(`${pathname}?${q.toString()}`);
    };

    const goToList = () => {
        const q = new URLSearchParams(searchParams.toString());
        q.delete("menu");
        q.delete("generate");
        const suffix = q.toString();
        router.replace(suffix ? `${pathname}?${suffix}` : pathname);
    };

    return (
        <SectionCard title={t("specialA.title")}>
            {isGenerateView ? (
                <ReportAGeneratePanel onBack={goToList} />
            ) : (
                <ReportAListPanel onGenerate={goToGenerate} />
            )}
        </SectionCard>
    );
}
