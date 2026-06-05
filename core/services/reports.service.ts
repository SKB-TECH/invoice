import type { AxiosResponse } from "axios";

import { api } from "@/core/services/api";
import type {
    InvoiceEditionReportFilters,
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
import { buildInvoicePaymentsPreviewDisplay } from "@/lib/reports/build-invoice-payments-display";
import { buildReportAPreviewDisplay } from "@/lib/reports/build-report-a-display";
import { buildReportPreviewDisplay } from "@/lib/reports/build-report-display";
import { MOCK_REPORT_A_HISTORY } from "@/lib/reports/report-a-mock-history";

type ReportTitleOptions = {
    reportTitle: string;
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
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

type ScalarQueryValue = string | number | boolean | null | undefined;

const REPORT_ENDPOINTS = {
    invoiceEdition: "/invoices/reports/invoices",
    invoiceNormalization: "/invoices/reports/normalization",
    invoicePayments: "/invoices/reports/payments",
    vatCollection: "/invoices/reports/tva",
    toolUsage: "/invoices/reports/usage",
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

export const reportsService = {
    getInvoiceEditionReport(filters: InvoiceEditionReportFilters) {
        return requestReportBlob(REPORT_ENDPOINTS.invoiceEdition, {
            date_from: filters.date_from,
            date_to: filters.date_to,
            client_id: filters.client_id,
            contract_id: filters.contract_id,
            point_of_sale: filters.point_of_sale,
            workflow_status: filters.workflow_status,
        });
    },

    getInvoiceNormalizationReport(filters: InvoiceNormalizationReportFilters) {
        return requestReportBlob(REPORT_ENDPOINTS.invoiceNormalization, {
            date_from: filters.date_from,
            date_to: filters.date_to,
            point_of_sale: filters.point_of_sale,
            invoice_type_code: filters.invoice_type_code,
            period_type: filters.period_type,
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
        return requestReportBlob(REPORT_ENDPOINTS.vatCollection, {
            date_from: filters.date_from,
            date_to: filters.date_to,
            payment_status: filters.payment_status,
            invoice_type_code: filters.invoice_type_code,
            client_id: filters.client_id,
            period_type: filters.period_type,
        });
    },

    getToolUsageReport(filters: ToolUsageReportFilters) {
        return requestReportBlob(REPORT_ENDPOINTS.toolUsage, {
            date_from: filters.date_from,
            date_to: filters.date_to,
            user_name: filters.user_name,
            action_type: filters.action_type,
            period_type: filters.period_type,
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

        const response =
            kind === "invoice-edition"
                ? await this.getInvoiceEditionReport(
                      filters as InvoiceEditionReportFilters,
                  )
                : kind === "invoice-normalization"
                  ? await this.getInvoiceNormalizationReport(
                        filters as InvoiceNormalizationReportFilters,
                    )
                  : kind === "vat-collection"
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

        return {
            filename,
            display: buildReportPreviewDisplay(
                options.reportTitle,
                kind,
                filters as Record<string, unknown>,
                { profile: options.profile, user: options.user },
            ),
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
            return {
                filename: fallbackFilename,
                display: buildReportAPreviewDisplay(filters as ReportAFilters, {
                    profile: options.profile,
                    user: options.user,
                }),
            };
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

    async listReportA(): Promise<ReportAHistoryListResult> {
        return {
            items: MOCK_REPORT_A_HISTORY,
            meta: { total: MOCK_REPORT_A_HISTORY.length },
        };
    },
};
