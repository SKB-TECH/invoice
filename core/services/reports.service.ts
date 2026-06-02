import { api } from "@/core/services/api";
import { fetchMockReportPdf } from "@/core/services/reports-mock";
import { ENV } from "@/core/constants/env";
import { buildReportPreviewDisplay } from "@/lib/reports/build-report-display";
import { filenameFromContentDisposition } from "@/core/utils/downloadBlob";
import type {
    InvoiceEditionReportFilters,
    InvoiceNormalizationReportFilters,
    InvoicePaymentsReportFilters,
    OrdinaryReportKind,
    ReportAFilters,
    ReportBlobResult,
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

function blobFromResponse(
    response: { data: Blob; headers: Record<string, unknown> },
    fallbackFilename: string,
): Pick<ReportBlobResult, "blob" | "filename"> {
    const disposition =
        typeof response.headers["content-disposition"] === "string"
            ? response.headers["content-disposition"]
            : undefined;

    const filename = filenameFromContentDisposition(
        disposition,
        fallbackFilename,
    );

    return { blob: response.data, filename };
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

type FetchOptions = {
    reportTitle: string;
};

export const reportsService = {
    async fetchOrdinaryReport(
        kind: OrdinaryReportKind,
        filters:
            | InvoiceEditionReportFilters
            | InvoiceNormalizationReportFilters
            | InvoicePaymentsReportFilters
            | VatCollectionReportFilters
            | ToolUsageReportFilters,
        fallbackFilename: string,
        options: FetchOptions,
    ): Promise<ReportBlobResult> {
        const params = stripUndefined(filters as Record<string, unknown>);

        if (ENV.REPORTS_USE_MOCK) {
            return fetchMockReportPdf(
                options.reportTitle,
                kind,
                params,
                fallbackFilename,
            );
        }

        const response = await api.get(ORDINARY_PATHS[kind], {
            params,
            responseType: "blob",
        });

        const { blob, filename } = blobFromResponse(response, fallbackFilename);

        return {
            blob,
            filename,
            display: buildReportPreviewDisplay(
                options.reportTitle,
                kind,
                params,
                false,
            ),
        };
    },

    async fetchSpecialPdfReport(
        kind: SpecialPdfReportKind,
        body:
            | ReportXDailyFilters
            | ReportZFilters
            | ReportXPeriodicFilters
            | ReportAFilters,
        fallbackFilename: string,
        options: FetchOptions,
    ): Promise<ReportBlobResult> {
        const payload = stripUndefined(body as Record<string, unknown>);

        if (ENV.REPORTS_USE_MOCK) {
            return fetchMockReportPdf(
                options.reportTitle,
                kind,
                payload,
                fallbackFilename,
            );
        }

        const response = await api.post(SPECIAL_PDF_PATHS[kind], payload, {
            responseType: "blob",
        });

        const { blob, filename } = blobFromResponse(response, fallbackFilename);

        return {
            blob,
            filename,
            display: buildReportPreviewDisplay(
                options.reportTitle,
                kind,
                payload,
                false,
            ),
        };
    },
};
