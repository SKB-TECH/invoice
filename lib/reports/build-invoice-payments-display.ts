import type {
    InvoicePaymentReportApiRow,
    InvoicePaymentsPreviewContent,
    InvoicePaymentsReportFilters,
    ReportPreviewDisplay,
} from "@/core/types/reports";
import { formatReportGeneratedAt } from "@/lib/reports/build-report-display";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";

type ClientLike = {
    id: number | string;
    client_id?: number | string | null;
    client_name?: string | null;
    company_name?: string | null;
    legal_name?: string | null;
    name?: string | null;
};

type BuildOptions = {
    filters: InvoicePaymentsReportFilters;
    rows: InvoicePaymentReportApiRow[];
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
    clients?: ClientLike[];
};

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

function formatPaymentDate(value?: string): string {
    if (!value?.trim()) return "—";

    const parsed = new Date(value.trim().replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
}

function formatPaymentAmount(amount: number, currency?: string): string {
    const code = currency?.trim() || "USD";
    return `${amount.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${code}`;
}

function resolveClientName(
    clientId: number | undefined,
    clients: ClientLike[],
): string {
    if (!clientId) return "—";

    const client = clients.find(
        (item) =>
            Number(item.id) === clientId ||
            Number((item as { client_id?: unknown }).client_id) === clientId,
    );
    if (!client) return "—";

    return (
        client.client_name?.trim() ||
        client.company_name?.trim() ||
        client.legal_name?.trim() ||
        client.name?.trim() ||
        "—"
    );
}

export function buildInvoicePaymentsPreviewDisplay({
    filters,
    rows,
    profile,
    user,
    clients = [],
}: BuildOptions): ReportPreviewDisplay {
    const emitter = extractReportEmitter(profile, user);

    const content: InvoicePaymentsPreviewContent = {
        generatedAt: formatReportGeneratedAt(),
        dateFrom: formatReportDateLabel(filters.period_start),
        dateTo: formatReportDateLabel(filters.period_end),
        companyName: emitter.companyName,
        logoUrl: emitter.logoUrl,
        nif: emitter.nif,
        isf: emitter.isf,
        lineItems: rows.map((row) => ({
            reference: row.reference?.trim() || "—",
            clientName: resolveClientName(row.client_id, clients),
            amount: formatPaymentAmount(row.amount, row.currency),
            date: formatPaymentDate(row.date),
        })),
    };

    return { variant: "payments", content };
}
