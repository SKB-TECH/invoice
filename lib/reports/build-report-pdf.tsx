import { pdf } from "@react-pdf/renderer";

import {
    ReportAPdfDocument,
    type ReportAPdfLabels,
} from "@/components/reports/report-a-pdf-document";
import {
    ReportXPeriodicPdfDocument,
    type ReportXPeriodicPdfLabels,
} from "@/components/reports/report-x-periodic-pdf-document";
import {
    ReportDocumentPdfDocument,
    type ReportDocumentPdfLabels,
} from "@/components/reports/report-document-pdf-document";
import { ReportOrdinaryTablePdfDocument } from "@/components/reports/report-ordinary-table-pdf-document";
import type { ReportPreviewDisplay } from "@/core/types/reports";
import type { OrdinaryReportTablePdfLabels } from "@/lib/reports/ordinary-report-configs";
import {
    getOrdinaryReportTableConfig,
    isOrdinaryReportTableVariant,
    type OrdinaryReportTableVariant,
} from "@/lib/reports/ordinary-report-configs";

export type ReportPdfLabels = {
    generic: ReportDocumentPdfLabels;
    reportA: ReportAPdfLabels;
    reportXPeriodic: ReportXPeriodicPdfLabels;
    reportZ: ReportXPeriodicPdfLabels;
    reportXDaily: ReportXPeriodicPdfLabels;
    ordinary: Record<OrdinaryReportTableVariant, OrdinaryReportTablePdfLabels>;
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

    if (display.variant === "a") {
        const document = (
            <ReportAPdfDocument
                content={display.content}
                labels={labels.reportA}
            />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "x-daily") {
        const document = (
            <ReportXPeriodicPdfDocument
                content={display.content}
                labels={labels.reportXDaily}
            />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "x-periodic") {
        const document = (
            <ReportXPeriodicPdfDocument
                content={display.content}
                labels={labels.reportXPeriodic}
            />
        );
        return pdf(document).toBlob();
    }

    if (display.variant === "z") {
        const document = (
            <ReportXPeriodicPdfDocument
                content={display.content}
                labels={labels.reportZ}
            />
        );
        return pdf(document).toBlob();
    }

    if (isOrdinaryReportTableVariant(display.variant)) {
        const config = getOrdinaryReportTableConfig(display.variant);
        const document = (
            <ReportOrdinaryTablePdfDocument
                content={display.content}
                config={config}
                labels={labels.ordinary[display.variant]}
            />
        );
        return pdf(document).toBlob();
    }

    throw new Error(`Unsupported report preview variant: ${display.variant}`);
}
