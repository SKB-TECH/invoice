"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ReportFiltersGrid } from "@/components/reports/report-filters-grid";
import { ReportPreviewSection } from "@/components/reports/report-preview-section";
import { ReportPeriodFields } from "@/components/reports/report-filter-fields";
import { useSpecialPdfReportPreview } from "@/core/hooks/reports/useReportGenerate";
import { useReportPreview } from "@/core/hooks/reports/useReportPreview";
import type { ReportAFilters } from "@/core/types/reports";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

type Props = {
    onBack: () => void;
};

export function ReportAGeneratePanel({ onBack }: Props) {
    const t = useTranslations("reports");
    const tA = useTranslations("reports.specialA");
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

    const handleGeneratePreview = () => {
        const filters: ReportAFilters = {
            period_start: dateFrom.trim() || undefined,
            period_end: dateTo.trim() || undefined,
        };

        previewMutation.mutate(
            {
                kind: "a",
                filters,
                filename: "invoice_rapport_a.pdf",
                reportTitle: tA("title"),
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

    if (isShowingPreview && previewDisplay) {
        return (
            <ReportPreviewSection
                display={previewDisplay}
                onBack={clearPreview}
                onDownload={handleDownload}
                disabled={previewMutation.isPending}
            />
        );
    }

    return (
        <>
            <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-500">
                {tA("generateIntro")}
            </p>

            <ReportFiltersGrid>
                <ReportPeriodFields
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                />
            </ReportFiltersGrid>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-5">
                <button
                    type="button"
                    disabled={previewMutation.isPending}
                    onClick={onBack}
                    className="h-12 w-52 rounded border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {t("actions.back")}
                </button>
                <button
                    type="button"
                    disabled={previewMutation.isPending}
                    onClick={handleGeneratePreview}
                    className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {previewMutation.isPending ? (
                        <span className="inline-flex items-center justify-center gap-2">
                            <Loader2
                                className="size-4 animate-spin"
                                aria-hidden
                            />
                            {t("actions.generating")}
                        </span>
                    ) : (
                        t("actions.generate")
                    )}
                </button>
            </div>
        </>
    );
}
