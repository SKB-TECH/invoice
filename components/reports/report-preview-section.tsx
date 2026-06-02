"use client";

import { useTranslations } from "next-intl";

import { ReportDocumentPreview } from "@/components/reports/report-document-preview";
import type { ReportPreviewDisplay } from "@/core/types/reports";

type Props = {
    display: ReportPreviewDisplay;
    onBack: () => void;
    onDownload: () => void;
    disabled?: boolean;
};

export function ReportPreviewSection({
    display,
    onBack,
    onDownload,
    disabled,
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

            {display.isSimulated ? (
                <p className="mb-4 rounded border border-[#0879bd]/20 bg-[#eff6ff] px-4 py-2.5 text-[13px] font-medium text-[#0879bd]">
                    {t("preview.simulatedNotice")}
                </p>
            ) : null}

            <ReportDocumentPreview display={display} />

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
