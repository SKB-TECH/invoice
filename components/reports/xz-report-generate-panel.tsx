"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { ReportKindRadioGrid } from "@/components/reports/report-kind-radio-grid";
import { ReportPreviewSection } from "@/components/reports/report-preview-section";
import { ReportPeriodFields } from "@/components/reports/report-filter-fields";
import { useSpecialPdfReportPreview } from "@/core/hooks/reports/useReportGenerate";
import { useReportPreview } from "@/core/hooks/reports/useReportPreview";
import type {
    ReportXDailyFilters,
    ReportXPeriodicFilters,
    ReportZFilters,
    SpecialPdfReportKind,
} from "@/core/types/reports";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

type XzReportKind = "reportXDaily" | "reportZ" | "reportXPeriodic";

const KIND_TO_SPECIAL: Record<XzReportKind, SpecialPdfReportKind> = {
    reportXDaily: "x-daily",
    reportZ: "z",
    reportXPeriodic: "x-periodic",
};

const FILENAME_BY_KIND: Record<XzReportKind, string> = {
    reportXDaily: "invoice_rapport_x_quotidien.pdf",
    reportZ: "invoice_rapport_z.pdf",
    reportXPeriodic: "invoice_rapport_x_periodique.pdf",
};

type Props = {
    onBack: () => void;
};

export function XzReportGeneratePanel({ onBack }: Props) {
    const t = useTranslations("reports");
    const tFlow = useTranslations("reports.xzFlow");
    const previewMutation = useSpecialPdfReportPreview();
    const {
        previewDisplay,
        isShowingPreview,
        applyPreview,
        clearPreview,
        downloadPreview,
    } = useReportPreview();

    const [kind, setKind] = useState<XzReportKind>("reportXDaily");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const buildFilters = ():
        | ReportXDailyFilters
        | ReportZFilters
        | ReportXPeriodicFilters => ({
        period_start: dateFrom.trim() || undefined,
        period_end: dateTo.trim() || undefined,
    });

    const handleGeneratePreview = () => {
        previewMutation.mutate(
            {
                kind: KIND_TO_SPECIAL[kind],
                filters: buildFilters(),
                filename: FILENAME_BY_KIND[kind],
                reportTitle: t(`specialXz.${kind}.title`),
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
                {tFlow("generate.intro")}
            </p>

            <ReportKindRadioGrid
                className="grid-cols-1 md:grid-cols-3 lg:grid-cols-3"
                title={tFlow("generate.radioTitle")}
                value={kind}
                onChange={(v) => setKind(v as XzReportKind)}
                options={[
                    {
                        value: "reportXDaily",
                        label: tFlow("reportKinds.reportXDaily"),
                    },
                    {
                        value: "reportZ",
                        label: tFlow("reportKinds.reportZ"),
                    },
                    {
                        value: "reportXPeriodic",
                        label: tFlow("reportKinds.reportXPeriodic"),
                    },
                ]}
            />

            <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="grid gap-5 md:grid-cols-2">
                    <ReportPeriodFields
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={setDateFrom}
                        onDateToChange={setDateTo}
                    />
                </div>
            </div>

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
                            <Loader2 className="size-4 animate-spin" aria-hidden />
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
