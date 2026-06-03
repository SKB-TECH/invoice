import type { PaymentRecord } from "@/core/schemas/payment.schema";

export function formatAmount(
    amount: number | undefined,
    currency: string | undefined,
) {
    const cur = (currency ?? "").trim() || "—";
    if (amount === undefined || Number.isNaN(amount)) {
        return `${cur} —`;
    }

    return `${cur} ${new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 2,
    }).format(amount)}`;
}

export function paymentRowLabel(row: PaymentRecord, index: number): string {
    if (row.reference && String(row.reference).trim() !== "") {
        return String(row.reference);
    }
    if (row.id !== undefined) {
        return `#${row.id}`;
    }
    return `#${index + 1}`;
}

export function pickTruthyString(...vals: unknown[]): string | undefined {
    for (const v of vals) {
        if (typeof v === "string" && v.trim() !== "") {
            return v.trim();
        }
    }
    return undefined;
}

export function invoiceListClientDisplayName(inv: unknown): string | undefined {
    if (!inv || typeof inv !== "object") return undefined;
    const item = inv as Record<string, unknown>;
    const receiver =
        item.receiver_info && typeof item.receiver_info === "object"
            ? (item.receiver_info as Record<string, unknown>)
            : undefined;
    const clientInfo =
        item.client_info && typeof item.client_info === "object"
            ? (item.client_info as Record<string, unknown>)
            : undefined;
    const client =
        item.client && typeof item.client === "object"
            ? (item.client as Record<string, unknown>)
            : undefined;

    return pickTruthyString(
        receiver?.legal_name,
        receiver?.name,
        clientInfo?.legal_name,
        clientInfo?.name,
        client?.legal_name,
        client?.client_name,
        client?.name,
    );
}

export function paymentInvoiceDisplayName(
    row: PaymentRecord,
    invoiceLabelById: Map<number, string>,
): string {
    const r = row as Record<string, unknown>;
    const nested = r.invoice;

    if (nested && typeof nested === "object") {
        const o = nested as Record<string, unknown>;
        const fromNested = pickTruthyString(
            o.invoice_ref,
            o.reference,
            o.number,
            o.invoice_number,
            o.title,
            o.name,
        );
        if (fromNested) return fromNested;
    }

    const fromRow = pickTruthyString(
        r.invoice_ref,
        r.invoice_number,
        r.invoice_name,
        r.number,
    );
    if (fromRow) return fromRow;

    if (row.invoice_id !== undefined) {
        return invoiceLabelById.get(row.invoice_id) ?? `#${row.invoice_id}`;
    }

    return "—";
}

export function paymentDisplayDateIso(row: PaymentRecord): string | undefined {
    const r = row as Record<string, unknown>;
    const keys = [
        "payment_date",
        "paid_at",
        "created_at",
        "updated_at",
        "date",
    ] as const;

    for (const k of keys) {
        const v = r[k];
        if (typeof v === "string" && v.trim() !== "") {
            return v.trim();
        }
    }

    return undefined;
}

export function formatPaymentTableDate(raw: string): string {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
        return raw;
    }
    return d.toLocaleString("fr-FR");
}
