"use client";

import { useTranslations } from "next-intl";

import { ReportAPreview } from "@/components/reports/report-a-preview";
import { ReportDocumentPreview } from "@/components/reports/report-document-preview";
import { ReportInvoiceEditionPreview } from "@/components/reports/report-invoice-edition-preview";
import { ReportInvoiceNormalizationPreview } from "@/components/reports/report-invoice-normalization-preview";
import { ReportPaymentsPreview } from "@/components/reports/report-payments-preview";
import { ReportToolUsagePreview } from "@/components/reports/report-tool-usage-preview";
import { ReportVatCollectionPreview } from "@/components/reports/report-vat-collection-preview";
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

            {display.variant === "a" ? (
                <ReportAPreview content={display.content} />
            ) : display.variant === "invoice-edition" ? (
                <ReportInvoiceEditionPreview content={display.content} />
            ) : display.variant === "invoice-normalization" ? (
                <ReportInvoiceNormalizationPreview content={display.content} />
            ) : display.variant === "payments" ? (
                <ReportPaymentsPreview content={display.content} />
            ) : display.variant === "vat-collection" ? (
                <ReportVatCollectionPreview content={display.content} />
            ) : display.variant === "tool-usage" ? (
                <ReportToolUsagePreview content={display.content} />
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
