import type {
    ReportPreviewDisplay,
    VatCollectionPreviewContent,
    VatCollectionReportFilters,
    VatCollectionReportLineItem,
} from "@/core/types/reports";
import { formatReportGeneratedAt } from "@/lib/reports/build-report-display";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";

type BuildOptions = {
    filters: VatCollectionReportFilters;
    rows: Record<string, unknown>[];
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
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

function formatReportDateLabel(value?: string): string {
    if (!value?.trim()) return "—";
    const parsed = new Date(`${value.trim()}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(parsed);
}

function formatInvoiceDate(value: string): string {
    if (value === "—") return value;
    const parsed = new Date(value.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(parsed);
}

function formatAmount(amount: string): string {
    if (amount === "—") return amount;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return amount;
    return numericAmount.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function buildLineItem(row: Record<string, unknown>): VatCollectionReportLineItem {
    const clientName = firstResolved(
        pickNestedString(row, "client", ["client_name", "legal_name", "name"]),
        pickNestedString(row, "client_info", ["client_name", "legal_name", "name"]),
        pickString(row, ["client_name", "customer_name", "legal_name"]),
    );

    const invoiceType = firstResolved(
        pickNestedString(row, "type_info", ["title", "name", "value", "code"]),
        pickNestedString(row, "invoice_type", ["title", "name", "value", "code"]),
        pickString(row, ["invoice_type", "type", "invoice_type_code"]),
    );

    return {
        clientName,
        invoiceAmount: formatAmount(pickString(row, ["invoice_amount"])),
        taxAmount: formatAmount(pickString(row, ["tax_amount"])),
        paidAmount: formatAmount(pickString(row, ["paid_amount"])),
        totalAmount: formatAmount(pickString(row, ["total_amount"])),
        currency: pickString(row, ["currency"]),
        invoiceType,
        dueDate: formatInvoiceDate(pickString(row, ["due_date"])),
    };
}

export function buildVatCollectionPreviewDisplay({
    filters,
    rows,
    profile,
    user,
}: BuildOptions): ReportPreviewDisplay {
    const emitter = extractReportEmitter(profile, user);

    const content: VatCollectionPreviewContent = {
        generatedAt: formatReportGeneratedAt(),
        dateFrom: formatReportDateLabel(filters.period_start),
        dateTo: formatReportDateLabel(filters.period_end),
        companyName: emitter.companyName,
        logoUrl: emitter.logoUrl,
        nif: emitter.nif,
        isf: emitter.isf,
        lineItems: rows.map((row) => buildLineItem(row)),
    };

    return { variant: "vat-collection", content };
}
