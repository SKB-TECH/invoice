import { api } from "@/core/services/api";
import { fetchMockReportPdf } from "@/core/services/reports-mock";
import { ENV } from "@/core/constants/env";
import { buildReportAPreviewDisplay } from "@/lib/reports/build-report-a-display";
import { buildReportPreviewDisplay } from "@/lib/reports/build-report-display";
import { filenameFromContentDisposition } from "@/core/utils/downloadBlob";
import { MOCK_REPORT_A_HISTORY } from "@/lib/reports/report-a-mock-history";
import type {
    InvoiceEditionReportFilters,
    InvoiceNormalizationReportFilters,
    InvoicePaymentsReportFilters,
    OrdinaryReportKind,
    ReportAFilters,
    ReportAHistoryItem,
    ReportAHistoryListResult,
    ReportBlobResult,
    ReportXDailyFilters,
    ReportXPeriodicFilters,
    ReportZFilters,
    SpecialPdfReportKind,
    ToolUsageReportFilters,
    VatCollectionReportFilters,
} from "@/core/types/reports";
import { unwrapApiData } from "@/core/utils/apiResponse";

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

function normalizeReportAHistoryItem(row: unknown): ReportAHistoryItem | null {
    if (!row || typeof row !== "object") return null;
    const o = row as Record<string, unknown>;
    const idRaw = o.id;
    const id =
        typeof idRaw === "number"
            ? idRaw
            : Number.isFinite(Number(idRaw))
              ? Number(idRaw)
              : NaN;
    if (!Number.isFinite(id)) return null;

    const generatedAt =
        (typeof o.generated_at === "string" && o.generated_at) ||
        (typeof o.generatedAt === "string" && o.generatedAt) ||
        "—";
    const dateFrom =
        (typeof o.date_from === "string" && o.date_from) ||
        (typeof o.dateFrom === "string" && o.dateFrom) ||
        "—";
    const dateTo =
        (typeof o.date_to === "string" && o.date_to) ||
        (typeof o.dateTo === "string" && o.dateTo) ||
        "—";
    const isf = typeof o.isf === "string" ? o.isf : String(o.isf ?? "—");
    const pointOfSale =
        (typeof o.point_of_sale === "string" && o.point_of_sale) ||
        (typeof o.pointOfSale === "string" && o.pointOfSale) ||
        "—";

    return { id, generatedAt, dateFrom, dateTo, isf, pointOfSale };
}

function parseReportAHistoryList(raw: unknown): ReportAHistoryListResult {
    const body = unwrapApiData<unknown>(raw) ?? raw;
    let rows: unknown[] = [];

    if (Array.isArray(body)) {
        rows = body;
    } else if (body && typeof body === "object") {
        const o = body as Record<string, unknown>;
        if (Array.isArray(o.items)) rows = o.items;
        else if (Array.isArray(o.data)) rows = o.data;
    }

    const items = rows
        .map(normalizeReportAHistoryItem)
        .filter((item): item is ReportAHistoryItem => item !== null);

    return { items, meta: { total: items.length } };
}

export const reportsService = {
    async listReportA(): Promise<ReportAHistoryListResult> {
        if (ENV.REPORTS_USE_MOCK) {
            return {
                items: MOCK_REPORT_A_HISTORY,
                meta: { total: MOCK_REPORT_A_HISTORY.length },
            };
        }

        const { data } = await api.get<unknown>(SPECIAL_PDF_PATHS.a);
        return parseReportAHistoryList(data);
    },

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

        const display =
            kind === "a"
                ? buildReportAPreviewDisplay(body)
                : buildReportPreviewDisplay(
                      options.reportTitle,
                      kind,
                      payload,
                  );

        return { blob, filename, display };
    },
};
