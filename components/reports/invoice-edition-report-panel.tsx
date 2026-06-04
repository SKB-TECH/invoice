"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { InvoiceEditionGeneratePanel } from "@/components/reports/invoice-edition-generate-panel";
import { InvoiceEditionReportListPanel } from "@/components/reports/invoice-edition-report-list-panel";
import { usePathname, useRouter } from "@/i18n/routing";

export function InvoiceEditionReportPanel() {
    const t = useTranslations("reports");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isGenerateView = searchParams.get("generate") === "1";

    const goToGenerate = () => {
        const q = new URLSearchParams(searchParams.toString());
        q.set("menu", "invoiceEdition");
        q.set("generate", "1");
        router.push(`${pathname}?${q.toString()}`);
    };

    const goToList = () => {
        const q = new URLSearchParams(searchParams.toString());
        q.set("menu", "invoiceEdition");
        q.delete("generate");
        const suffix = q.toString();
        router.replace(suffix ? `${pathname}?${suffix}` : pathname);
    };

    return (
        <SectionCard title={t("ordinary.invoiceEdition.title")}>
            {isGenerateView ? (
                <InvoiceEditionGeneratePanel onBack={goToList} />
            ) : (
                <InvoiceEditionReportListPanel onGenerate={goToGenerate} />
            )}
        </SectionCard>
    );
}
