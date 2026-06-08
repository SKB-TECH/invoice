import { pdf } from "@react-pdf/renderer";

import {
    ReportAPdfDocument,
    type ReportAPdfLabels,
} from "@/components/reports/report-a-pdf-document";
import {
    ReportDocumentPdfDocument,
    type ReportDocumentPdfLabels,
} from "@/components/reports/report-document-pdf-document";
import { ReportInvoiceEditionPdfDocument } from "@/components/reports/report-invoice-edition-pdf-document";
import { ReportInvoiceNormalizationPdfDocument } from "@/components/reports/report-invoice-normalization-pdf-document";
import {
    ReportPaymentsPdfDocument,
    type ReportPaymentsPdfLabels,
} from "@/components/reports/report-payments-pdf-document";
import { ReportToolUsagePdfDocument } from "@/components/reports/report-tool-usage-pdf-document";
import { ReportVatCollectionPdfDocument } from "@/components/reports/report-vat-collection-pdf-document";
import type { ReportPreviewDisplay } from "@/core/types/reports";

export type ReportPdfLabels = {
    generic: ReportDocumentPdfLabels;
    payments: ReportPaymentsPdfLabels;
    reportA: ReportAPdfLabels;
};

export async function buildReportPdfBlob(
    display: ReportPreviewDisplay,
    labels: ReportPdfLabels,
): Promise<Blob> {
    if (display.variant === "generic") {
        const document = (
            <ReportDocumentPdfDocument
                reportTitle={display.reportTitle}
                reportKind={display.reportKind}
                generatedAt={display.generatedAt}
                emitterName={display.emitterName}
                logoUrl={display.logoUrl}
                filterRows={display.filterRows}
                labels={labels.generic}
            />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "payments") {
        const document = (
            <ReportPaymentsPdfDocument
                content={display.content}
                labels={labels.payments}
            />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "invoice-edition") {
        const document = (
            <ReportInvoiceEditionPdfDocument content={display.content} />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "invoice-normalization") {
        const document = (
            <ReportInvoiceNormalizationPdfDocument content={display.content} />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "vat-collection") {
        const document = (
            <ReportVatCollectionPdfDocument content={display.content} />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "tool-usage") {
        const document = (
            <ReportToolUsagePdfDocument content={display.content} />
        );
        return pdf(document).toBlob();
    }

    const document = (
        <ReportAPdfDocument
            content={display.content}
            labels={labels.reportA}
        />
    );
    return pdf(document).toBlob();
}
