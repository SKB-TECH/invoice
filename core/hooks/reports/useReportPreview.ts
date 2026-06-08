"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import { downloadBlob } from "@/core/utils/downloadBlob";
import type { ReportBlobResult, ReportPreviewDisplay } from "@/core/types/reports";
import { buildOrdinaryReportTablePdfLabels } from "@/lib/reports/build-ordinary-report-pdf-labels";
import { buildReportPdfBlob } from "@/lib/reports/build-report-pdf";

export function useReportPreview() {
    const tOrdinary = useTranslations("reports.preview.ordinary");
    const tInvoiceEdition = useTranslations("reports.preview.invoiceEdition");
    const tInvoiceNormalization = useTranslations(
        "reports.preview.invoiceNormalization",
    );
    const tPayments = useTranslations("reports.preview.payments");
    const tVatCollection = useTranslations("reports.preview.vatCollection");
    const tToolUsage = useTranslations("reports.preview.toolUsage");
    const tReportA = useTranslations("reports.specialA.preview");
    const [preview, setPreview] = useState<ReportBlobResult | null>(null);

    const applyPreview = useCallback((result: ReportBlobResult) => {
        setPreview(result);
    }, []);

    const clearPreview = useCallback(() => {
        setPreview(null);
    }, []);

    const downloadPreview = useCallback(async () => {
        if (!preview) return;

        const pdfBlob = await buildReportPdfBlob(preview.display, {
            generic: {
                reportCode: tOrdinary("reportCode"),
                generatedAt: tOrdinary("generatedAt"),
                reportType: tOrdinary("reportType"),
                objectSection: tOrdinary("objectSection"),
                columns: {
                    criteria: tOrdinary("columns.criteria"),
                    value: tOrdinary("columns.value"),
                },
                empty: tOrdinary("empty"),
                footer: tOrdinary("footer"),
            },
            ordinary: {
                "invoice-edition": buildOrdinaryReportTablePdfLabels(
                    tInvoiceEdition,
                    "invoice-edition",
                ),
                "invoice-normalization": buildOrdinaryReportTablePdfLabels(
                    tInvoiceNormalization,
                    "invoice-normalization",
                ),
                payments: buildOrdinaryReportTablePdfLabels(
                    tPayments,
                    "payments",
                ),
                "vat-collection": buildOrdinaryReportTablePdfLabels(
                    tVatCollection,
                    "vat-collection",
                ),
                "tool-usage": buildOrdinaryReportTablePdfLabels(
                    tToolUsage,
                    "tool-usage",
                ),
            },
            reportA: {
                reportCode: tReportA("reportCode"),
                emitter: tReportA("emitter"),
                periodSection: tReportA("periodSection"),
                company: tReportA("company"),
                nif: tReportA("nif"),
                isf: tReportA("isf"),
                generatedAt: tReportA("generatedAt"),
                dateFrom: tReportA("dateFrom"),
                dateTo: tReportA("dateTo"),
                tableTitle: tReportA("tableTitle"),
                columns: {
                    code: tReportA("columns.code"),
                    designation: tReportA("columns.designation"),
                    unitPrice: tReportA("columns.unitPrice"),
                    tax: tReportA("columns.tax"),
                    qtySold: tReportA("columns.qtySold"),
                    qtyReturned: tReportA("columns.qtyReturned"),
                    fiscalStock: tReportA("columns.fiscalStock"),
                },
                total: tReportA("total"),
                page: tReportA("page", { current: 1, total: 1 }),
            },
        });
        downloadBlob(pdfBlob, preview.filename);
    }, [
        preview,
        tInvoiceEdition,
        tInvoiceNormalization,
        tOrdinary,
        tPayments,
        tReportA,
        tToolUsage,
        tVatCollection,
    ]);

    const previewDisplay: ReportPreviewDisplay | null =
        preview?.display ?? null;

    const isShowingPreview = preview !== null;

    return {
        previewDisplay,
        isShowingPreview,
        applyPreview,
        clearPreview,
        downloadPreview,
    };
}
