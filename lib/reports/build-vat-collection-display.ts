import type {
    ReportPreviewDisplay,
    VatCollectionPreviewContent,
    VatCollectionReportFilters,
    VatCollectionReportLineItem,
} from "@/core/types/reports";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";
import {
    formatReportAmount,
    formatReportDateLabel,
    formatReportDateTime,
    formatReportGeneratedAt,
} from "@/lib/reports/report-locale-format";

export type VatCollectionDisplayLabels = {
    locale: string;
    workflowStatuses: Record<string, string>;
    invoiceTypeSale: string;
    invoiceTypeCredit: string;
    invoiceTypeUnknown: string;
};

type BuildOptions = {
    filters: VatCollectionReportFilters;
    rows: Record<string, unknown>[];
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
    clients?: ClientLike[];
    invoiceTypes?: InvoiceTypeLike[];
    labels?: VatCollectionDisplayLabels;
};

type ClientLike = {
    id: number | string;
    client_id?: number | string | null;
    client_name?: string | null;
    company_name?: string | null;
    legal_name?: string | null;
    name?: string | null;
};

type InvoiceTypeLike = {
    id: number | string;
    code?: string | null;
    title?: string | null;
    name?: string | null;
    value?: string | null;
};

const DEFAULT_LABELS: VatCollectionDisplayLabels = {
    locale: "fr",
    workflowStatuses: {},
    invoiceTypeSale: "Facture de vente",
    invoiceTypeCredit: "Facture d'avoir",
    invoiceTypeUnknown: "Type inconnu ({id})",
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : undefined;
}

function pickString(source: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) return value.trim();
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }
    return "—";
}

function pickNestedString(
    source: Record<string, unknown>,
    key: string,
    keys: string[],
): string {
    const nested = asRecord(source[key]);
    return nested ? pickString(nested, keys) : "—";
}

function firstResolved(...values: string[]): string {
    return values.find((value) => value !== "—") ?? "—";
}

function resolveClientName(
    row: Record<string, unknown>,
    clients: ClientLike[],
): string {
    const nested = firstResolved(
        pickNestedString(row, "client", ["client_name", "legal_name", "name"]),
        pickNestedString(row, "client_info", ["client_name", "legal_name", "name"]),
        pickString(row, ["client_name", "customer_name", "legal_name"]),
    );
    if (nested !== "—") return nested;

    const clientId = pickString(row, ["client_id"]);
    const client = clients.find(
        (item) =>
            String(item.id) === clientId ||
            String(item.client_id ?? "") === clientId,
    );

    return (
        client?.client_name?.trim() ||
        client?.company_name?.trim() ||
        client?.legal_name?.trim() ||
        client?.name?.trim() ||
        "—"
    );
}

function resolveInvoiceType(
    row: Record<string, unknown>,
    invoiceTypes: InvoiceTypeLike[],
    labels: VatCollectionDisplayLabels,
): string {
    const raw = firstResolved(
        pickNestedString(row, "type_info", ["title", "name", "value", "code"]),
        pickNestedString(row, "invoice_type", ["title", "name", "value", "code"]),
        pickString(row, ["invoice_type", "type", "invoice_type_code"]),
    );
    const typeId = firstResolved(
        pickString(row, ["type"]),
        pickString(row, ["invoice_type_id"]),
        pickString(row, ["invoice_type"]),
        raw,
    );

    const typeById = invoiceTypes.find((item) => String(item.id) === typeId);
    if (typeById) {
        return (
            typeById.title?.trim() ||
            typeById.name?.trim() ||
            typeById.value?.trim() ||
            typeById.code?.trim() ||
            labels.invoiceTypeUnknown.replace("{id}", String(typeById.id))
        );
    }

    if (raw !== "—" && !/^\d+$/.test(raw)) return raw;

    if (raw === "1" || typeId === "1") return labels.invoiceTypeSale;
    if (raw === "2" || typeId === "2") return labels.invoiceTypeCredit;
    if (typeId !== "—") {
        return labels.invoiceTypeUnknown.replace("{id}", typeId);
    }
    return labels.invoiceTypeUnknown.replace("{id}", "—");
}

function resolveWorkflowStatus(
    status: string,
    labels: VatCollectionDisplayLabels,
): string {
    if (status === "—") return status;
    return labels.workflowStatuses[status] ?? status;
}

function buildLineItem(
    row: Record<string, unknown>,
    clients: ClientLike[],
    invoiceTypes: InvoiceTypeLike[],
    labels: VatCollectionDisplayLabels,
): VatCollectionReportLineItem {
    const locale = labels.locale;

    return {
        date: formatReportDateTime(pickString(row, ["date"]), locale),
        reference: pickString(row, ["invoice_ref", "number", "reference"]),
        amount: formatReportAmount(pickString(row, ["invoice_amount"]), locale),
        taxAmount: formatReportAmount(pickString(row, ["tax_amount"]), locale),
        currency: pickString(row, ["currency"]),
        totalAmount: formatReportAmount(pickString(row, ["total_amount"]), locale),
        clientName: resolveClientName(row, clients),
        invoiceType: resolveInvoiceType(row, invoiceTypes, labels),
        workflowStatus: resolveWorkflowStatus(
            pickString(row, ["workflow_status"]),
            labels,
        ),
        paidAmount: formatReportAmount(pickString(row, ["paid_amount"]), locale),
    };
}

export function buildVatCollectionPreviewDisplay({
    filters,
    rows,
    profile,
    user,
    clients = [],
    invoiceTypes = [],
    labels = DEFAULT_LABELS,
}: BuildOptions): ReportPreviewDisplay {
    const emitter = extractReportEmitter(profile, user);
    const locale = labels.locale;

    const content: VatCollectionPreviewContent = {
        generatedAt: formatReportGeneratedAt(new Date(), locale),
        dateFrom: formatReportDateLabel(filters.period_start, locale),
        dateTo: formatReportDateLabel(filters.period_end, locale),
        companyName: emitter.companyName,
        logoUrl: emitter.logoUrl,
        nif: emitter.nif,
        isf: emitter.isf,
        lineItems: rows.map((row) =>
            buildLineItem(row, clients, invoiceTypes, labels),
        ),
    };

    return { variant: "vat-collection", content };
}
