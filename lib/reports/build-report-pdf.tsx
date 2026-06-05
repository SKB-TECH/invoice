import { pdf } from "@react-pdf/renderer";

import { ReportAPdfDocument } from "@/components/reports/report-a-pdf-document";
import { ReportDocumentPdfDocument } from "@/components/reports/report-document-pdf-document";
import { ReportPaymentsPdfDocument } from "@/components/reports/report-payments-pdf-document";
import type { ReportPreviewDisplay } from "@/core/types/reports";
import { REPORT_A_PDF_LABELS } from "@/lib/reports/report-a-pdf-labels";

export async function buildReportPdfBlob(
    display: ReportPreviewDisplay,
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
            />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "payments") {
        const document = (
            <ReportPaymentsPdfDocument content={display.content} />
        );
        return pdf(document).toBlob();
    }

    const document = (
        <ReportAPdfDocument
            content={display.content}
            labels={REPORT_A_PDF_LABELS}
        />
    );
    return pdf(document).toBlob();
}
