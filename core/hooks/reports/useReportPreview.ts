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
    const tReportXPeriodic = useTranslations(
        "reports.specialXz.reportXPeriodic.preview",
    );
    const tReportZ = useTranslations("reports.specialXz.reportZ.preview");
    const tReportXDaily = useTranslations(
        "reports.specialXz.reportXDaily.preview",
    );
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
            reportXPeriodic: {
                reportCode: tReportXPeriodic("reportCode"),
                emitter: tReportXPeriodic("emitter"),
                periodSection: tReportXPeriodic("periodSection"),
                company: tReportXPeriodic("company"),
                nif: tReportXPeriodic("nif"),
                generatedAt: tReportXPeriodic("generatedAt"),
                dateFrom: tReportXPeriodic("dateFrom"),
                dateTo: tReportXPeriodic("dateTo"),
                tableTitle: tReportXPeriodic("tableTitle"),
                columns: {
                    invoiceCount: tReportXPeriodic("columns.invoiceCount"),
                    totalHt: tReportXPeriodic("columns.totalHt"),
                    totalTva: tReportXPeriodic("columns.totalTva"),
                    totalTtc: tReportXPeriodic("columns.totalTtc"),
                    totalPaid: tReportXPeriodic("columns.totalPaid"),
                    totalBalance: tReportXPeriodic("columns.totalBalance"),
                },
                page: tReportXPeriodic("page", { current: 1, total: 1 }),
            },
            reportXDaily: {
                reportCode: tReportXDaily("reportCode"),
                emitter: tReportXDaily("emitter"),
                periodSection: tReportXDaily("periodSection"),
                company: tReportXDaily("company"),
                nif: tReportXDaily("nif"),
                generatedAt: tReportXDaily("generatedAt"),
                dateFrom: tReportXDaily("dateFrom"),
                dateTo: tReportXDaily("dateTo"),
                tableTitle: tReportXDaily("tableTitle"),
                columns: {
                    invoiceCount: tReportXDaily("columns.invoiceCount"),
                    totalHt: tReportXDaily("columns.totalHt"),
                    totalTva: tReportXDaily("columns.totalTva"),
                    totalTtc: tReportXDaily("columns.totalTtc"),
                    totalPaid: tReportXDaily("columns.totalPaid"),
                    totalBalance: tReportXDaily("columns.totalBalance"),
                },
                page: tReportXDaily("page", { current: 1, total: 1 }),
            },
            reportZ: {
                reportCode: tReportZ("reportCode"),
                emitter: tReportZ("emitter"),
                periodSection: tReportZ("periodSection"),
                company: tReportZ("company"),
                nif: tReportZ("nif"),
                generatedAt: tReportZ("generatedAt"),
                dateFrom: tReportZ("dateFrom"),
                dateTo: tReportZ("dateTo"),
                tableTitle: tReportZ("tableTitle"),
                columns: {
                    invoiceCount: tReportZ("columns.invoiceCount"),
                    totalHt: tReportZ("columns.totalHt"),
                    totalTva: tReportZ("columns.totalTva"),
                    totalTtc: tReportZ("columns.totalTtc"),
                    totalPaid: tReportZ("columns.totalPaid"),
                    totalBalance: tReportZ("columns.totalBalance"),
                },
                page: tReportZ("page", { current: 1, total: 1 }),
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
        tReportXPeriodic,
        tReportXDaily,
        tReportZ,
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
