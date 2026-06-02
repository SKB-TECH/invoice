import { api } from "@/core/services/api";
import {
    downloadBlob,
    filenameFromContentDisposition,
} from "@/core/utils/downloadBlob";
import type {
    InvoiceEditionReportFilters,
    InvoiceNormalizationReportFilters,
    InvoicePaymentsReportFilters,
    OrdinaryReportKind,
    ReportAFilters,
    ReportXDailyFilters,
    ReportXPeriodicFilters,
    ReportZFilters,
    SpecialPdfReportKind,
    ToolUsageReportFilters,
    VatCollectionReportFilters,
} from "@/core/types/reports";

const REPORTS_BASE = "/invoices/reports";

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const out: Partial<T> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null || value === "") continue;
        out[key as keyof T] = value as T[keyof T];
    }
    return out;
}

async function downloadBlobResponse(
    response: { data: Blob; headers: Record<string, unknown> },
    fallbackFilename: string,
): Promise<void> {
    const disposition =
        typeof response.headers["content-disposition"] === "string"
            ? response.headers["content-disposition"]
            : undefined;

    const filename = filenameFromContentDisposition(
        disposition,
        fallbackFilename,
    );
    downloadBlob(response.data, filename);
}

const ORDINARY_PATHS: Record<OrdinaryReportKind, string> = {
    "invoice-edition": `${REPORTS_BASE}/invoice-edition`,
    "invoice-normalization": `${REPORTS_BASE}/invoice-normalization`,
    "invoice-payments": `${REPORTS_BASE}/invoice-payments`,
    "vat-collection": `${REPORTS_BASE}/vat-collection`,
    "tool-usage": `${REPORTS_BASE}/tool-usage`,
};

const SPECIAL_PDF_PATHS: Record<SpecialPdfReportKind, string> = {
    "x-daily": `${REPORTS_BASE}/x/daily`,
    z: `${REPORTS_BASE}/z`,
    "x-periodic": `${REPORTS_BASE}/x/periodic`,
    a: `${REPORTS_BASE}/a`,
};

export const reportsService = {
    async downloadOrdinaryReport(
        kind: OrdinaryReportKind,
        filters:
            | InvoiceEditionReportFilters
            | InvoiceNormalizationReportFilters
            | InvoicePaymentsReportFilters
            | VatCollectionReportFilters
            | ToolUsageReportFilters,
        fallbackFilename: string,
    ): Promise<void> {
        const response = await api.get(ORDINARY_PATHS[kind], {
            params: stripUndefined(filters as Record<string, unknown>),
            responseType: "blob",
        });

        await downloadBlobResponse(response, fallbackFilename);
    },

    async downloadSpecialPdfReport(
        kind: SpecialPdfReportKind,
        body:
            | ReportXDailyFilters
            | ReportZFilters
            | ReportXPeriodicFilters
            | ReportAFilters,
        fallbackFilename: string,
    ): Promise<void> {
        const response = await api.post(
            SPECIAL_PDF_PATHS[kind],
            stripUndefined(body as Record<string, unknown>),
            { responseType: "blob" },
        );

        await downloadBlobResponse(response, fallbackFilename);
    },
};
