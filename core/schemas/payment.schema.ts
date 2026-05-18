import { z } from "zod";

import { unwrapApiData } from "@/core/utils/apiResponse";

export const paymentRecordSchema = z
    .object({
        id: z.coerce.number().optional(),
        invoice_id: z.coerce.number().optional(),
        client_id: z.coerce.number().optional(),
        contract_id: z.coerce.number().optional(),
        amount: z.coerce.number().optional(),
        currency: z.string().optional(),
        reference: z.string().optional(),
        channel_id: z.coerce.number().optional(),
        method_id: z.coerce.number().optional(),
        exchange_rate: z.coerce.number().optional(),
        cash_info: z
            .object({
                collector: z.string().optional(),
                drawer: z.string().optional(),
            })
            .passthrough()
            .optional(),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
    })
    .passthrough();

export type PaymentRecord = z.infer<typeof paymentRecordSchema>;

export const cashInfoSchema = z.object({
    collector: z.string(),
    drawer: z.string(),
});

export const createPaymentPayloadSchema = z.object({
    invoice_id: z.number().int().positive(),
    client_id: z.number().int().positive(),
    amount: z.number().positive(),
    currency: z.string().min(1).max(16),
    channel_id: z.number().int().positive(),
    cash_info: cashInfoSchema,
    contract_id: z.number().int().positive(),
    method_id: z.number().int().positive(),
    exchange_rate: z.number().positive(),
});

export type CreatePaymentPayload = z.infer<typeof createPaymentPayloadSchema>;

export type GetPaymentsParams = {
    page?: number;
    perPage?: number;
};

export type PaymentsPageMeta = {
    page: number;
    perPage: number;
    lastPage?: number;
    total?: number;
};

export type PaymentsPageResult = {
    items: PaymentRecord[];
    meta?: PaymentsPageMeta;
};

/** Valeurs non vides pour les APIs qui utilisent des clés du type `Reference_11`. */
function pickRowScalar(
    row: Record<string, unknown>,
    ...keys: string[]
): string | undefined {
    for (const k of keys) {
        const v = row[k];
        if (v === undefined || v === null) continue;
        const s = String(v).trim();
        if (s !== "") return s;
    }
    return undefined;
}

/**
 * Fusionne les champs canoniques avec les clés suffixées renvoyées par certaines APIs.
 */
function normalizePaymentRecordRow(
    row: Record<string, unknown>
): Record<string, unknown> {
    const reference = pickRowScalar(
        row,
        "reference",
        "Reference_11",
        "payment_reference"
    );

    const invoiceId = pickRowScalar(row, "invoice_id", "Invoice_id_7");

    const amount = pickRowScalar(row, "amount", "Amount_9");

    const currency = pickRowScalar(row, "currency", "Currency_10");

    const createdAt = pickRowScalar(
        row,
        "payment_date",
        "paid_at",
        "created_at",
        "Date_1",
        "Changes_5"
    );

    const id = pickRowScalar(row, "id", "Id_0");
    const client_id = pickRowScalar(row, "client_id", "Client_id_8");
    const contract_id = pickRowScalar(row, "contract_id", "Contract_id_17");
    const channel_id = pickRowScalar(row, "channel_id", "Channel_id_12");
    const method_id = pickRowScalar(row, "method_id", "Method_id_18");
    const exchange_rate = pickRowScalar(
        row,
        "exchange_rate",
        "Exchange_rate_19"
    );

    let cash_info: unknown = row.cash_info ?? row.Cash_info_13;
    if (typeof cash_info === "string") {
        try {
            cash_info = JSON.parse(cash_info) as unknown;
        } catch {
            cash_info = { drawer: "", collector: "" };
        }
    }

    return {
        ...row,
        ...(id !== undefined ? { id } : {}),
        ...(reference !== undefined ? { reference } : {}),
        ...(invoiceId !== undefined ? { invoice_id: invoiceId } : {}),
        ...(amount !== undefined ? { amount } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(createdAt !== undefined ? { created_at: createdAt } : {}),
        ...(client_id !== undefined ? { client_id } : {}),
        ...(contract_id !== undefined ? { contract_id } : {}),
        ...(channel_id !== undefined ? { channel_id } : {}),
        ...(method_id !== undefined ? { method_id } : {}),
        ...(exchange_rate !== undefined ? { exchange_rate } : {}),
        ...(cash_info !== undefined ? { cash_info } : {}),
    };
}

function coerceMeta(
    meta: Record<string, unknown> | undefined
): PaymentsPageMeta | undefined {
    if (!meta || typeof meta !== "object") return undefined;

    const pickNum = (...keys: string[]): number | undefined => {
        for (const k of keys) {
            const v = meta[k];
            if (typeof v === "number" && Number.isFinite(v)) return v;
            if (typeof v === "string" && v.trim() !== "") {
                const n = Number(v);
                if (!Number.isNaN(n)) return n;
            }
        }
        return undefined;
    };

    const page = pickNum("page", "current_page") ?? 1;
    const perPage = pickNum("perPage", "per_page") ?? 20;
    const lastPage = pickNum("last_page", "lastPage");
    const total = pickNum("total");

    const out: PaymentsPageMeta = { page, perPage };
    if (lastPage !== undefined) out.lastPage = lastPage;
    if (total !== undefined) out.total = total;
    return out;
}

export function parsePagedPayments(raw: unknown): PaymentsPageResult {
    const shells = [raw, unwrapApiData<unknown>(raw)];

    const parseItems = (items: unknown[]): PaymentsPageResult | null => {
        const normalized = items.map((item) => {
            if (!item || typeof item !== "object") {
                return {};
            }
            return normalizePaymentRecordRow(item as Record<string, unknown>);
        });

        const parsed = z.array(paymentRecordSchema).safeParse(normalized);
        return parsed.success ? { items: parsed.data } : null;
    };

    for (const shell of shells) {
        if (shell === null || typeof shell !== "object") continue;

        if (Array.isArray(shell)) {
            const result = parseItems(shell);
            if (result) return result;
            continue;
        }

        const o = shell as Record<string, unknown>;
        const meta = coerceMeta(
            o.meta as Record<string, unknown> | undefined
        );

        const itemsCandidate =
            o.items ??
            o.data ??
            (Array.isArray(o.payments) ? o.payments : undefined);

        if (Array.isArray(itemsCandidate)) {
            const result = parseItems(itemsCandidate);
            if (result) return { ...result, meta };
        }
    }

    throw new Error(
        "Paiements : structure de liste ou pagination non reconnue."
    );
}
