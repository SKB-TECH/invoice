"use client";

import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { InvoiceEditionGeneratePanel } from "@/components/reports/invoice-edition-generate-panel";

export function InvoiceEditionReportPanel() {
    const t = useTranslations("reports");

    return (
        <SectionCard title={t("ordinary.invoiceEdition.title")}>
            <InvoiceEditionGeneratePanel />
        </SectionCard>
    );
}
