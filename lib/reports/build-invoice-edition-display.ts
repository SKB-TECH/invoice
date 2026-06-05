import type {
    InvoiceEditionPreviewContent,
    InvoiceEditionReportApiRow,
    InvoiceEditionReportFilters,
    ReportPreviewDisplay,
} from "@/core/types/reports";
import { formatReportGeneratedAt } from "@/lib/reports/build-report-display";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";

type BuildOptions = {
    filters: InvoiceEditionReportFilters;
    rows: InvoiceEditionReportApiRow[];
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
    clients?: ClientLike[];
    invoiceTypes?: InvoiceTypeLike[];
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

function asRecord(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : undefined;
}

function pickString(source: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) return value.trim();
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
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

function resolveClientName(
    row: Record<string, unknown>,
    clients: ClientLike[],
): string {
    const nestedName = firstResolved(
        pickNestedString(row, "client", ["client_name", "legal_name", "name"]),
        pickNestedString(row, "client_info", [
            "client_name",
            "legal_name",
            "name",
        ]),
    );
    if (nestedName !== "—") return nestedName;

    const directName = pickString(row, [
        "client_name",
        "customer_name",
        "legal_name",
    ]);
    if (directName !== "—") return directName;

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

function resolveInvoiceTypeName(
    row: Record<string, unknown>,
    invoiceTypes: InvoiceTypeLike[],
): string {
    const nestedType = firstResolved(
        pickNestedString(row, "type_info", ["title", "name", "value", "code"]),
        pickNestedString(row, "invoice_type", [
            "title",
            "name",
            "value",
            "code",
        ]),
    );
    if (nestedType !== "—") return nestedType;

    const typeId = pickString(row, ["type", "invoice_type"]);
    const invoiceType = invoiceTypes.find((item) => String(item.id) === typeId);

    return (
        invoiceType?.title?.trim() ||
        invoiceType?.name?.trim() ||
        invoiceType?.value?.trim() ||
        invoiceType?.code?.trim() ||
        typeId
    );
}

export function buildInvoiceEditionPreviewDisplay({
    filters,
    rows,
    profile,
    user,
    clients = [],
    invoiceTypes = [],
}: BuildOptions): ReportPreviewDisplay {
    const emitter = extractReportEmitter(profile, user);

    const content: InvoiceEditionPreviewContent = {
        generatedAt: formatReportGeneratedAt(),
        dateFrom: formatReportDateLabel(filters.periode_date),
        dateTo: formatReportDateLabel(filters.period_end),
        companyName: emitter.companyName,
        logoUrl: emitter.logoUrl,
        nif: emitter.nif,
        isf: emitter.isf,
        lineItems: rows.map((row) => {
            return {
                clientName: resolveClientName(row, clients),
                invoiceAmount: formatAmount(pickString(row, ["invoice_amount"])),
                taxAmount: formatAmount(pickString(row, ["tax_amount"])),
                paidAmount: formatAmount(pickString(row, ["paid_amount"])),
                totalAmount: formatAmount(pickString(row, ["total_amount"])),
                currency: pickString(row, ["currency"]),
                invoiceType: resolveInvoiceTypeName(row, invoiceTypes),
                dueDate: formatInvoiceDate(pickString(row, ["due_date"])),
            };
        }),
    };

    return { variant: "invoice-edition", content };
}
