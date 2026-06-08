import type {
    ReportPreviewDisplay,
    ToolUsagePreviewContent,
    ToolUsageReportFilters,
    ToolUsageReportLineItem,
} from "@/core/types/reports";
import { formatReportGeneratedAt } from "@/lib/reports/build-report-display";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";

type BuildOptions = {
    filters: ToolUsageReportFilters;
    rows: Record<string, unknown>[];
    profile?: Record<string, unknown> | null;
    user?: Record<string, unknown> | null;
};

type ConnectedUserIdentity = {
    id?: string;
    fullName?: string;
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
        hour: "2-digit",
        minute: "2-digit",
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

function extractConnectedUserIdentity(
    user?: Record<string, unknown> | null,
): ConnectedUserIdentity {
    if (!user) return {};

    const firstName = pickString(user, ["firstname", "first_name"]);
    const lastName = pickString(user, ["lastname", "last_name"]);
    const fullName =
        [firstName, lastName].filter((value) => value !== "—").join(" ").trim() ||
        pickString(user, ["name", "full_name", "username"]);

    return {
        id: pickString(user, ["id", "user_id", "Id_0"]),
        fullName: fullName === "—" ? undefined : fullName,
    };
}

function buildLineItem(
    row: Record<string, unknown>,
    connectedUser?: ConnectedUserIdentity,
): ToolUsageReportLineItem {
    const rowUserId = pickString(row, ["user_id"]);
    const userName = firstResolved(
        pickNestedString(row, "user", ["name", "full_name", "username"]),
        pickNestedString(row, "user_info", ["name", "full_name", "username"]),
        pickString(row, ["user_name", "username", "name"]),
    );
    const resolvedUserName =
        userName !== "—"
            ? userName
            : connectedUser?.fullName &&
                (!rowUserId || !connectedUser.id || rowUserId === connectedUser.id)
              ? connectedUser.fullName
              : rowUserId;

    const displayUserName =
        resolvedUserName && resolvedUserName !== "—" ? resolvedUserName : "—";

    return {
        userName: displayUserName,
        invoiceCount: pickString(row, ["invoice_count"]),
        totalAmount: formatAmount(pickString(row, ["total_amount"])),
        totalTva: formatAmount(pickString(row, ["total_tva", "total_tax"])),
        firstInvoice: formatInvoiceDate(pickString(row, ["first_invoice"])),
        lastInvoice: formatInvoiceDate(pickString(row, ["last_invoice"])),
    };
}

export function buildToolUsagePreviewDisplay({
    filters,
    rows,
    profile,
    user,
}: BuildOptions): ReportPreviewDisplay {
    const emitter = extractReportEmitter(profile, user);
    const connectedUser = extractConnectedUserIdentity(user);

    const content: ToolUsagePreviewContent = {
        generatedAt: formatReportGeneratedAt(),
        dateFrom: formatReportDateLabel(filters.period_start),
        dateTo: formatReportDateLabel(filters.period_end),
        companyName: emitter.companyName,
        logoUrl: emitter.logoUrl,
        nif: emitter.nif,
        isf: emitter.isf,
        lineItems: rows.map((row) => buildLineItem(row, connectedUser)),
    };

    return { variant: "tool-usage", content };
}
