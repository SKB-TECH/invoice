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
    ReportReportDateField,
} from "@/components/reports/report-filter-fields";
import { useSpecialPdfReportPreview } from "@/core/hooks/reports/useReportGenerate";
import { useReportPreview } from "@/core/hooks/reports/useReportPreview";
import type {
    ReportXDailyFilters,
    ReportXPeriodicFilters,
    ReportZFilters,
    SpecialPdfReportKind,
} from "@/core/types/reports";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

export type XzReportPanelId = "reportXDaily" | "reportZ" | "reportXPeriodic";

const PANEL_TO_KIND: Record<XzReportPanelId, SpecialPdfReportKind> = {
    reportXDaily: "x-daily",
    reportZ: "z",
    reportXPeriodic: "x-periodic",
};

type Props = {
    panelId: XzReportPanelId;
};

export function SpecialXzReportPanel({ panelId }: Props) {
    const t = useTranslations("reports");
    const kind = PANEL_TO_KIND[panelId];
    const previewMutation = useSpecialPdfReportPreview();
    const {
        previewDisplay,
        isShowingPreview,
        applyPreview,
        clearPreview,
        downloadPreview,
    } = useReportPreview();

    const [reportDate, setReportDate] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [pointOfSale, setPointOfSale] = useState("");
    const [isf, setIsf] = useState("");

    const isPeriodic = panelId === "reportXPeriodic";

    const buildFilters = ():
        | ReportXDailyFilters
        | ReportZFilters
        | ReportXPeriodicFilters => {
        const common = {
            point_of_sale: pointOfSale.trim() || undefined,
            isf: isf.trim() || undefined,
        };

        if (isPeriodic) {
            return {
                ...common,
                date_from: dateFrom.trim() || undefined,
                date_to: dateTo.trim() || undefined,
            };
        }

        return {
            ...common,
            report_date: reportDate.trim() || undefined,
        };
    };

    const handleGeneratePreview = () => {
        previewMutation.mutate(
            {
                kind,
                filters: buildFilters(),
                filename: `${kind}.pdf`,
                reportTitle: t(`specialXz.${panelId}.title`),
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
        <SectionCard title={t(`specialXz.${panelId}.title`)}>
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
                {t(`specialXz.${panelId}.description`)}
            </p>
            <ul className="mb-5 list-inside list-disc space-y-1 text-[13px] text-slate-600">
                {(t.raw(`specialXz.${panelId}.includes`) as string[]).map(
                    (line) => (
                        <li key={line}>{line}</li>
                    ),
                )}
            </ul>

            <ReportFiltersGrid>
                {isPeriodic ? (
                    <ReportPeriodFields
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={setDateFrom}
                        onDateToChange={setDateTo}
                    />
                ) : (
                    <ReportReportDateField
                        value={reportDate}
                        onChange={setReportDate}
                    />
                )}
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
