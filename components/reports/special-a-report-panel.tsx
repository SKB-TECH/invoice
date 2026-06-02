"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { ReportFiltersGrid } from "@/components/reports/report-filters-grid";
import { ReportActionsBar } from "@/components/reports/report-generate-bar";
import { ReportPreviewSection } from "@/components/reports/report-preview-section";
import {
    ReportIsfField,
    ReportPeriodFields,
    ReportPointOfSaleField,
} from "@/components/reports/report-filter-fields";
import { useSpecialPdfReportPreview } from "@/core/hooks/reports/useReportGenerate";
import { useReportPreview } from "@/core/hooks/reports/useReportPreview";
import type { ReportAFilters } from "@/core/types/reports";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

export function SpecialAReportPanel() {
    const t = useTranslations("reports");
    const previewMutation = useSpecialPdfReportPreview();
    const {
        previewDisplay,
        isShowingPreview,
        applyPreview,
        clearPreview,
        downloadPreview,
    } = useReportPreview();

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [pointOfSale, setPointOfSale] = useState("");
    const [isf, setIsf] = useState("");

    const handleGeneratePreview = () => {
        const filters: ReportAFilters = {
            date_from: dateFrom.trim() || undefined,
            date_to: dateTo.trim() || undefined,
            point_of_sale: pointOfSale.trim() || undefined,
            isf: isf.trim() || undefined,
        };

        previewMutation.mutate(
            {
                kind: "a",
                filters,
                filename: "rapport-a.pdf",
                reportTitle: t("specialA.title"),
            },
            {
                onSuccess: (result) => {
                    applyPreview(result);
                    toast.success(t("toast.previewReady"));
                },
                onError: (err) =>
                    toast.error(
                        getAxiosErrorMessage(err, t("toast.generateError")),
                    ),
            },
        );
    };

    const handleDownload = () => {
        downloadPreview();
        toast.success(t("toast.downloaded"));
    };

    return (
        <SectionCard title={t("specialA.title")}>
            {isShowingPreview && previewDisplay ? (
                <ReportPreviewSection
                    display={previewDisplay}
                    onBack={clearPreview}
                    onDownload={handleDownload}
                    disabled={previewMutation.isPending}
                />
            ) : (
                <>
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

            <ReportActionsBar
                onGeneratePreview={handleGeneratePreview}
                isPreviewPending={previewMutation.isPending}
            />
                </>
            )}
        </SectionCard>
    );
}
