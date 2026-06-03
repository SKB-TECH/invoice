import { pdf } from "@react-pdf/renderer";

import { MockReportPdfDocument } from "@/components/reports/mock-report-pdf-document";
import { ReportAPdfDocument } from "@/components/reports/report-a-pdf-document";
import { buildReportPreviewDisplay } from "@/lib/reports/build-report-display";
import { buildReportAPreviewDisplay } from "@/lib/reports/build-report-a-display";
import { REPORT_A_PDF_LABELS } from "@/lib/reports/report-a-pdf-labels";
import type { ReportAFilters, ReportBlobResult } from "@/core/types/reports";

const MOCK_DELAY_MS = 700;

export async function fetchMockReportPdf(
    reportTitle: string,
    reportKind: string,
    filters: Record<string, unknown>,
    filename: string,
): Promise<ReportBlobResult> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

    if (reportKind === "a") {
        const display = buildReportAPreviewDisplay(filters as ReportAFilters);

        if (display.variant !== "a") {
            throw new Error("Invalid report A display");
        }

        const blob = await pdf(
            <ReportAPdfDocument
                content={display.content}
                labels={REPORT_A_PDF_LABELS}
            />,
        ).toBlob();

        return { blob, filename, display };
    }

    const display = buildReportPreviewDisplay(
        reportTitle,
        reportKind,
        filters,
    );

    if (display.variant !== "generic") {
        throw new Error("Invalid generic report display");
    }

    const blob = await pdf(
        <MockReportPdfDocument
            reportTitle={display.reportTitle}
            reportKind={display.reportKind}
            generatedAt={display.generatedAt}
            filterRows={display.filterRows}
        />,
    ).toBlob();

    return { blob, filename, display };
}
