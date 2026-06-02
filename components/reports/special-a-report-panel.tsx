"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { ReportFiltersGrid } from "@/components/reports/report-filters-grid";
import { ReportGenerateBar } from "@/components/reports/report-generate-bar";
import {
    ReportIsfField,
    ReportPeriodFields,
    ReportPointOfSaleField,
} from "@/components/reports/report-filter-fields";
import { useSpecialPdfReportGenerate } from "@/core/hooks/reports/useReportGenerate";
import type { ReportAFilters } from "@/core/types/reports";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

export function SpecialAReportPanel() {
    const t = useTranslations("reports");
    const generateMutation = useSpecialPdfReportGenerate();

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [pointOfSale, setPointOfSale] = useState("");
    const [isf, setIsf] = useState("");

    const handleGenerate = () => {
        const filters: ReportAFilters = {
            date_from: dateFrom.trim() || undefined,
            date_to: dateTo.trim() || undefined,
            point_of_sale: pointOfSale.trim() || undefined,
            isf: isf.trim() || undefined,
        };

        generateMutation.mutate(
            {
                kind: "a",
                filters,
                filename: "rapport-a.pdf",
            },
            {
                onSuccess: () => toast.success(t("toast.pdfGenerated")),
                onError: (err) =>
                    toast.error(
                        getAxiosErrorMessage(err, t("toast.generateError")),
                    ),
            },
        );
    };

    return (
        <SectionCard title={t("specialA.title")}>
            <p className="mb-3 max-w-3xl text-[13px] leading-relaxed text-slate-500">
                {t("specialA.description")}
            </p>
            <ul className="mb-5 list-inside list-disc space-y-1 text-[13px] text-slate-600">
                {(t.raw("specialA.includes") as string[]).map((line) => (
                    <li key={line}>{line}</li>
                ))}
            </ul>

            <ReportFiltersGrid>
                <ReportPeriodFields
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                />
                <ReportPointOfSaleField
                    value={pointOfSale}
                    onChange={setPointOfSale}
                />
                <ReportIsfField value={isf} onChange={setIsf} />
            </ReportFiltersGrid>

            <ReportGenerateBar
                onGenerate={handleGenerate}
                isPending={generateMutation.isPending}
            />
        </SectionCard>
    );
}
