import type { AxiosResponse } from "axios";

import { api } from "@/core/services/api";
import type {
    InvoiceEditionReportFilters,
    InvoiceEditionReportApiRow,
    InvoiceNormalizationReportApiRow,
    InvoiceNormalizationReportFilters,
    InvoicePaymentReportApiRow,
    InvoicePaymentsReportFilters,
    OrdinaryReportKind,
    ReportAFilters,
    ReportAHistoryListResult,
    ReportBlobResult,
    ReportXDailyFilters,
    ReportXPeriodicFilters,
    ReportZFilters,
    SpecialPdfReportKind,
    ToolUsageReportFilters,
    VatCollectionReportFilters,
} from "@/core/types/reports";
import { filenameFromContentDisposition } from "@/core/utils/downloadBlob";
import { buildInvoiceEditionPreviewDisplay } from "@/lib/reports/build-invoice-edition-display";
import { buildInvoiceNormalizationPreviewDisplay } from "@/lib/reports/build-invoice-normalization-display";
import { buildInvoicePaymentsPreviewDisplay } from "@/lib/reports/build-invoice-payments-display";
import { buildReportPreviewDisplay } from "@/lib/reports/build-report-display";
import { buildToolUsagePreviewDisplay } from "@/lib/reports/build-tool-usage-display";
import { buildVatCollectionPreviewDisplay } from "@/lib/reports/build-vat-collection-display";
import type { VatCollectionDisplayLabels } from "@/lib/reports/build-vat-collection-display";
import {
    MOCK_REPORT_A_API_RESPONSE,
    buildReportAPreviewDisplayFromApi,
    filenameFromReportAPdfUrl,
    parseReportAApiResponse,
    parseReportAHistoryList,
} from "@/lib/reports/report-a-api";
import { MOCK_REPORT_A_HISTORY } from "@/lib/reports/report-a-mock-history";
import { ENV } from "@/core/constants/env";
import { unwrapApiData } from "@/core/utils/apiResponse";

type ReportTitleOptions = {
    reportTitle: string;
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
    locale?: string;
    vatCollectionLabels?: VatCollectionDisplayLabels;
    clients?: Array<{
        id: number | string;
        client_id?: number | string | null;
        client_name?: string | null;
        company_name?: string | null;
        legal_name?: string | null;
        name?: string | null;
    }>;
    invoiceTypes?: Array<{
        id: number | string;
        code?: string | null;
        title?: string | null;
        name?: string | null;
        value?: string | null;
    }>;
};

type InvoicePaymentsContext = {
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
    clients?: Array<{
        id: number | string;
        client_id?: number | string | null;
        client_name?: string | null;
        company_name?: string | null;
        legal_name?: string | null;
        name?: string | null;
    }>;
};

type InvoiceEditionContext = {
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
    clients?: InvoicePaymentsContext["clients"];
    invoiceTypes?: Array<{
        id: number | string;
        code?: string | null;
        title?: string | null;
        name?: string | null;
        value?: string | null;
    }>;
};

type ScalarQueryValue = string | number | boolean | null | undefined;

const REPORT_ENDPOINTS = {
    invoiceEdition: "/invoices/reports/invoices",
    invoiceNormalization: "/invoices/reports/normalization",
    invoicePayments: "/invoices/reports/payments",
    vatCollection: "/invoices/reports/tva",
    toolUsage: "/invoices/reports/usage",
    reportA: "/invoices/reports/a",
} as const;

function cleanQueryParams(
    params: Record<string, ScalarQueryValue>,
): Record<string, string | number | boolean> {
    const entries = Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
    );
    return Object.fromEntries(entries) as Record<string, string | number | boolean>;
}

function getHeaderValue(
    headers: Record<string, unknown> | undefined,
    key: string,
): string | undefined {
    if (!headers) return undefined;

    const lower = key.toLowerCase();
    const value = headers[key] ?? headers[lower];
    return typeof value === "string" ? value : undefined;
}

async function requestReportBlob(
    path: string,
    params: Record<string, ScalarQueryValue>,
): Promise<AxiosResponse<Blob>> {
    return api.get(path, {
        params: cleanQueryParams(params),
        responseType: "blob",
    });
}

function parsePaymentsRows(data: unknown): InvoicePaymentReportApiRow[] {
    if (Array.isArray(data)) {
        return data as InvoicePaymentReportApiRow[];
    }

    if (data && typeof data === "object") {
        const candidate = data as { items?: unknown; data?: unknown };

        if (Array.isArray(candidate.items)) {
            return candidate.items as InvoicePaymentReportApiRow[];
        }

        if (Array.isArray(candidate.data)) {
            return candidate.data as InvoicePaymentReportApiRow[];
        }
    }

    return [];
}

function parseInvoiceEditionRows(data: unknown): InvoiceEditionReportApiRow[] {
    if (Array.isArray(data)) {
        return data as InvoiceEditionReportApiRow[];
    }

    if (data && typeof data === "object") {
        const candidate = data as {
            items?: unknown;
            data?: unknown;
            invoices?: unknown;
            rows?: unknown;
        };

        if (Array.isArray(candidate.items)) {
            return candidate.items as InvoiceEditionReportApiRow[];
        }

        if (Array.isArray(candidate.data)) {
            return candidate.data as InvoiceEditionReportApiRow[];
        }

        if (candidate.data && typeof candidate.data === "object") {
            const nested = candidate.data as {
                items?: unknown;
                invoices?: unknown;
                rows?: unknown;
            };

            if (Array.isArray(nested.items)) {
                return nested.items as InvoiceEditionReportApiRow[];
            }

            if (Array.isArray(nested.invoices)) {
                return nested.invoices as InvoiceEditionReportApiRow[];
            }

            if (Array.isArray(nested.rows)) {
                return nested.rows as InvoiceEditionReportApiRow[];
            }
        }

        if (Array.isArray(candidate.invoices)) {
            return candidate.invoices as InvoiceEditionReportApiRow[];
        }

        if (Array.isArray(candidate.rows)) {
            return candidate.rows as InvoiceEditionReportApiRow[];
        }
    }

    return [];
}

function parseInvoiceNormalizationRows(
    data: unknown,
): InvoiceNormalizationReportApiRow[] {
    if (Array.isArray(data)) {
        return data as InvoiceNormalizationReportApiRow[];
    }

    if (data && typeof data === "object") {
        const candidate = data as {
            items?: unknown;
            data?: unknown;
            invoices?: unknown;
            rows?: unknown;
        };

        if (Array.isArray(candidate.items)) {
            return candidate.items as InvoiceNormalizationReportApiRow[];
        }

        if (Array.isArray(candidate.data)) {
            return candidate.data as InvoiceNormalizationReportApiRow[];
        }

        if (candidate.data && typeof candidate.data === "object") {
            const nested = candidate.data as {
                items?: unknown;
                invoices?: unknown;
                rows?: unknown;
            };

            if (Array.isArray(nested.items)) {
                return nested.items as InvoiceNormalizationReportApiRow[];
            }

            if (Array.isArray(nested.invoices)) {
                return nested.invoices as InvoiceNormalizationReportApiRow[];
            }

            if (Array.isArray(nested.rows)) {
                return nested.rows as InvoiceNormalizationReportApiRow[];
            }
        }

        if (Array.isArray(candidate.invoices)) {
            return candidate.invoices as InvoiceNormalizationReportApiRow[];
        }

        if (Array.isArray(candidate.rows)) {
            return candidate.rows as InvoiceNormalizationReportApiRow[];
        }
    }

    return [];
}

function parseGenericRows(data: unknown): Record<string, unknown>[] {
    if (Array.isArray(data)) {
        return data as Record<string, unknown>[];
    }

    if (data && typeof data === "object") {
        const candidate = data as {
            items?: unknown;
            data?: unknown;
            rows?: unknown;
            invoices?: unknown;
        };

        if (Array.isArray(candidate.items)) {
            return candidate.items as Record<string, unknown>[];
        }

        if (Array.isArray(candidate.data)) {
            return candidate.data as Record<string, unknown>[];
        }

        if (candidate.data && typeof candidate.data === "object") {
            const nested = candidate.data as {
                items?: unknown;
                rows?: unknown;
                invoices?: unknown;
            };

            if (Array.isArray(nested.items)) {
                return nested.items as Record<string, unknown>[];
            }

            if (Array.isArray(nested.rows)) {
                return nested.rows as Record<string, unknown>[];
            }

            if (Array.isArray(nested.invoices)) {
                return nested.invoices as Record<string, unknown>[];
            }
        }

        if (Array.isArray(candidate.rows)) {
            return candidate.rows as Record<string, unknown>[];
        }

        if (Array.isArray(candidate.invoices)) {
            return candidate.invoices as Record<string, unknown>[];
        }
    }

    return [];
}

export const reportsService = {
    getInvoiceEditionReport(filters: InvoiceEditionReportFilters) {
        return api.get(REPORT_ENDPOINTS.invoiceEdition, {
            params: cleanQueryParams({
                periode_date: filters.periode_date,
                period_end: filters.period_end,
                client_id: filters.client_id,
                contrat_id: filters.contrat_id,
                invoice_type: filters.invoice_type,
            }),
        });
    },

    getInvoiceNormalizationReport(filters: InvoiceNormalizationReportFilters) {
        return requestReportBlob(REPORT_ENDPOINTS.invoiceNormalization, {
            period_start: filters.period_start,
            period_end: filters.period_end,
            client_id: filters.client_id,
        });
    },

    getInvoicePaymentsReport(filters: InvoicePaymentsReportFilters) {
        return api.get(REPORT_ENDPOINTS.invoicePayments, {
            params: cleanQueryParams({
                client_id: filters.client_id,
                contract_id: filters.contract_id,
                period_start: filters.period_start,
                period_end: filters.period_end,
            }),
        });
    },

    getVatCollectionReport(filters: VatCollectionReportFilters) {
        return api.get(REPORT_ENDPOINTS.vatCollection, {
            params: cleanQueryParams({
                period_start: filters.period_start,
                period_end: filters.period_end,
                client_id: filters.client_id,
            }),
        });
    },

    getToolUsageReport(filters: ToolUsageReportFilters) {
        return api.get(REPORT_ENDPOINTS.toolUsage, {
            params: cleanQueryParams({
                period_start: filters.period_start,
                period_end: filters.period_end,
            }),
        });
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
        options: ReportTitleOptions,
    ): Promise<ReportBlobResult> {
        if (kind === "invoice-payments") {
            throw new Error(
                "Use fetchInvoicePaymentsReport for invoice payments reports.",
            );
        }

        if (kind === "invoice-edition") {
            throw new Error(
                "Use fetchInvoiceEditionReport for invoice edition reports.",
            );
        }

        if (kind === "invoice-normalization") {
            throw new Error(
                "Use fetchInvoiceNormalizationReport for invoice normalization reports.",
            );
        }

        const response =
            kind === "vat-collection"
                ? await this.getVatCollectionReport(
                      filters as VatCollectionReportFilters,
                  )
                : await this.getToolUsageReport(
                      filters as ToolUsageReportFilters,
                  );

        const filename = filenameFromContentDisposition(
            getHeaderValue(
                response.headers as unknown as Record<string, unknown>,
                "content-disposition",
            ),
            fallbackFilename,
        );

        const rows = parseGenericRows(response.data);

        return {
            filename,
            display:
                kind === "vat-collection"
                    ? buildVatCollectionPreviewDisplay({
                          filters: filters as VatCollectionReportFilters,
                          rows,
                          profile: options.profile,
                          user: options.user,
                          clients: options.clients ?? [],
                          invoiceTypes: options.invoiceTypes ?? [],
                          labels: options.vatCollectionLabels,
                      })
                    : buildToolUsagePreviewDisplay({
                          filters: filters as ToolUsageReportFilters,
                          rows,
                          profile: options.profile,
                          user: options.user,
                          locale: options.locale,
                      }),
        };
    },

    async fetchInvoiceEditionReport(
        filters: InvoiceEditionReportFilters,
        context: InvoiceEditionContext = {},
    ): Promise<ReportBlobResult> {
        const response = await this.getInvoiceEditionReport(filters);
        const rows = parseInvoiceEditionRows(response.data);

        return {
            filename: "invoice-edition-report.pdf",
            display: buildInvoiceEditionPreviewDisplay({
                filters,
                rows,
                profile: context.profile,
                user: context.user,
                clients: context.clients ?? [],
                invoiceTypes: context.invoiceTypes ?? [],
            }),
        };
    },

    async fetchInvoicePaymentsReport(
        filters: InvoicePaymentsReportFilters,
        context: InvoicePaymentsContext = {},
    ): Promise<ReportBlobResult> {
        const response = await this.getInvoicePaymentsReport(filters);
        const rows = parsePaymentsRows(response.data);

        return {
            filename: "invoice-payments-report.pdf",
            display: buildInvoicePaymentsPreviewDisplay({
                filters,
                rows,
                profile: context.profile,
                user: context.user,
                clients: context.clients,
            }),
        };
    },

    async fetchInvoiceNormalizationReport(
        filters: InvoiceNormalizationReportFilters,
        context: InvoiceEditionContext = {},
    ): Promise<ReportBlobResult> {
        const response = await this.getInvoiceNormalizationReport(filters);
        const rows = parseInvoiceNormalizationRows(response.data);

        return {
            filename: "invoice-normalization-report.pdf",
            display: buildInvoiceNormalizationPreviewDisplay({
                filters,
                rows,
                profile: context.profile,
                user: context.user,
                clients: context.clients ?? [],
                invoiceTypes: context.invoiceTypes ?? [],
            }),
        };
    },

    async fetchSpecialPdfReport(
        kind: SpecialPdfReportKind,
        filters:
            | ReportXDailyFilters
            | ReportZFilters
            | ReportXPeriodicFilters
            | ReportAFilters,
        fallbackFilename: string,
        options: ReportTitleOptions,
    ): Promise<ReportBlobResult> {
        if (kind === "a") {
            return this.fetchReportA(
                filters as ReportAFilters,
                fallbackFilename,
                options,
            );
        }

        return {
            filename: fallbackFilename,
            display: buildReportPreviewDisplay(
                options.reportTitle,
                kind,
                filters as Record<string, unknown>,
                { profile: options.profile, user: options.user },
            ),
        };
    },

    async fetchReportA(
        filters: ReportAFilters,
        fallbackFilename: string,
        options: ReportTitleOptions,
    ): Promise<ReportBlobResult> {
        const payload = cleanQueryParams({
            period_start: filters.period_start,
            period_end: filters.period_end,
        });

        if (ENV.REPORTS_USE_MOCK) {
            const response = {
                ...MOCK_REPORT_A_API_RESPONSE,
                period_start:
                    filters.period_start ??
                    MOCK_REPORT_A_API_RESPONSE.period_start,
                period_end:
                    filters.period_end ?? MOCK_REPORT_A_API_RESPONSE.period_end,
            };

            return {
                filename: filenameFromReportAPdfUrl(
                    response.pdf_url,
                    fallbackFilename,
                ),
                display: buildReportAPreviewDisplayFromApi(response, {
                    profile: options.profile,
                    user: options.user,
                }),
                pdfUrl: response.pdf_url,
            };
        }

        const { data } = await api.post<unknown>(
            REPORT_ENDPOINTS.reportA,
            payload,
        );
        const response = parseReportAApiResponse(unwrapApiData(data) ?? data);

        if (!response) {
            throw new Error("Invalid report A response.");
        }

        return {
            filename: filenameFromReportAPdfUrl(
                response.pdf_url,
                fallbackFilename,
            ),
            display: buildReportAPreviewDisplayFromApi(response, {
                profile: options.profile,
                user: options.user,
            }),
            pdfUrl: response.pdf_url,
        };
    },

    async listReportA(): Promise<ReportAHistoryListResult> {
        if (ENV.REPORTS_USE_MOCK) {
            return {
                items: MOCK_REPORT_A_HISTORY,
                meta: { total: MOCK_REPORT_A_HISTORY.length },
            };
        }

        const { data } = await api.get<unknown>(REPORT_ENDPOINTS.reportA);
        const items = parseReportAHistoryList(unwrapApiData(data) ?? data);

        return {
            items,
            meta: { total: items.length },
        };
    },
};
