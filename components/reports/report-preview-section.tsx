"use client";

import { useTranslations } from "next-intl";

import { ReportAPreview } from "@/components/reports/report-a-preview";
import { ReportXzSnapshotPreview } from "@/components/reports/report-x-periodic-preview";
import { ReportDocumentPreview } from "@/components/reports/report-document-preview";
import { ReportOrdinaryTablePreview } from "@/components/reports/report-ordinary-table-preview";
import type { ReportPreviewDisplay } from "@/core/types/reports";
import {
    getOrdinaryReportTableConfig,
    isOrdinaryReportTableDisplay,
} from "@/lib/reports/ordinary-report-configs";

type Props = {
    display: ReportPreviewDisplay;
    onBack: () => void;
    onDownload: () => void;
    disabled?: boolean;
    documentLayout?: "default" | "ordinary";
};

export function ReportPreviewSection({
    display,
    onBack,
    onDownload,
    disabled,
    documentLayout = "default",
}: Props) {
    const t = useTranslations("reports");

    return (
        <section aria-label={t("preview.title")}>
            <div className="mb-6">
                <h3 className="text-[25px] font-semibold text-slate-700">
                    {t("preview.title")}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                    {t("preview.subtitle")}
                </p>
            </div>

            {display.variant === "a" ? (
                <ReportAPreview content={display.content} />
            ) : display.variant === "x-daily" ? (
                <ReportXzSnapshotPreview
                    content={display.content}
                    scope="reportXDaily"
                />
            ) : display.variant === "x-periodic" ? (
                <ReportXzSnapshotPreview
                    content={display.content}
                    scope="reportXPeriodic"
                />
            ) : display.variant === "z" ? (
                <ReportXzSnapshotPreview
                    content={display.content}
                    scope="reportZ"
                />
            ) : isOrdinaryReportTableDisplay(display) ? (
                <div
                    className={
                        documentLayout === "ordinary"
                            ? "w-full min-w-0 overflow-x-auto"
                            : "w-full overflow-x-auto"
                    }
                >
                    <ReportOrdinaryTablePreview
                        content={display.content}
                        config={getOrdinaryReportTableConfig(display.variant)}
                    />
                </div>
            ) : (
                <ReportDocumentPreview display={display} />
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={disabled}
                    className="h-12 w-52 rounded border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {t("actions.back")}
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={onDownload}
                    className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {t("actions.download")}
                </button>
            </div>
        </section>
    );
}
