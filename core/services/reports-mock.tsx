import { pdf } from "@react-pdf/renderer";

import { MockReportPdfDocument } from "@/components/reports/mock-report-pdf-document";
import { buildReportPreviewDisplay } from "@/lib/reports/build-report-display";
import type { ReportBlobResult } from "@/core/types/reports";

const MOCK_DELAY_MS = 700;

export async function fetchMockReportPdf(
    reportTitle: string,
    reportKind: string,
    filters: Record<string, unknown>,
    filename: string,
): Promise<ReportBlobResult> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

    const display = buildReportPreviewDisplay(
        reportTitle,
        reportKind,
        filters,
        true,
    );

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
