"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import { downloadBlob } from "@/core/utils/downloadBlob";
import type { ReportBlobResult, ReportPreviewDisplay } from "@/core/types/reports";
import { buildReportPdfBlob } from "@/lib/reports/build-report-pdf";

export function useReportPreview() {
    const tOrdinary = useTranslations("reports.preview.ordinary");
    const tPayments = useTranslations("reports.preview.payments");
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
            payments: {
                reportCode: tPayments("reportCode"),
                emitter: tPayments("emitter"),
                periodSection: tPayments("periodSection"),
                company: tPayments("company"),
                nif: tPayments("nif"),
                isf: tPayments("isf"),
                generatedAt: tPayments("generatedAt"),
                dateFrom: tPayments("dateFrom"),
                dateTo: tPayments("dateTo"),
                tableTitle: tPayments("tableTitle"),
                columns: {
                    reference: tPayments("columns.reference"),
                    clientName: tPayments("columns.clientName"),
                    amount: tPayments("columns.amount"),
                    date: tPayments("columns.date"),
                },
                empty: tPayments("empty"),
                page: tPayments("page", { current: 1, total: 1 }),
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
    }, [preview, tOrdinary, tPayments, tReportA]);

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
