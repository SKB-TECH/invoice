import { api } from "@/core/services/api";
import { unwrapApiData } from "@/core/utils/apiResponse";
import type {
    BillableServiceItem,
    BillableServicesListMeta,
    BillableServicesListResult,
    CreateBillableServicePayload,
} from "@/core/types/billable-service";

const SERVICES_PATH = "/invoices/services";

export type ListBillableServicesParams = {
    page?: number;
    perPage?: number;
    business_sector?: string;
    status?: number;
    tax_group?: number;
    category_id?: number;
    billing_type?: number;
};

function readTotal(meta: unknown, fallback: number): number {
    if (!meta || typeof meta !== "object") return fallback;
    const m = meta as Record<string, unknown>;
    const t = m.total ?? m.Total;
    if (typeof t === "number" && Number.isFinite(t)) return t;
    if (typeof t === "string" && t.trim() !== "") {
        const n = Number(t);
        if (Number.isFinite(n)) return n;
    }
    return fallback;
}

function extractRowsAndTotal(raw: unknown): {
    rows: unknown[];
    total: number;
} | null {
    const tryParse = (
        body: unknown,
    ): { rows: unknown[]; total: number } | null => {
        if (!body || typeof body !== "object") return null;

        let rows: unknown[] | undefined;
        let metaUnknown: unknown = (body as Record<string, unknown>).meta;

        const o = body as Record<string, unknown>;
        if (Array.isArray(o.items)) rows = o.items;
        else if (Array.isArray(o.data)) {
            rows = o.data as unknown[];
        } else if (
            o.data &&
            typeof o.data === "object" &&
            !Array.isArray(o.data)
        ) {
            const inner = o.data as Record<string, unknown>;
            if (Array.isArray(inner.data)) rows = inner.data;
            else if (Array.isArray(inner.items)) rows = inner.items;
            metaUnknown = inner.meta ?? metaUnknown;
        }

        if (!rows) return null;
        const total = readTotal(metaUnknown, rows.length);
        return { rows, total };
    };

    const a = tryParse(raw);
    if (a) return a;
    const u = unwrapApiData<unknown>(raw);
    if (u !== raw) return tryParse(u);
    if (Array.isArray(raw))
        return { rows: raw, total: raw.length };
    return null;
}

export function normalizeBillableService(row: unknown): BillableServiceItem {
    const o = row as Record<string, unknown>;
    const idRaw = o.id;
    const name =
        (typeof o.name === "string" && o.name) ||
        (typeof o.service_name === "string" && o.service_name) ||
        "";
    return {
        id: typeof idRaw === "number" ? idRaw : Number(idRaw ?? 0),
        name,
        code: typeof o.code === "string" ? o.code : String(o.code ?? ""),
        description:
            typeof o.description === "string" ? o.description : undefined,
        price_before:
            typeof o.price_before === "number" ? o.price_before : undefined,
        price_after:
            typeof o.price_after === "number" ? o.price_after : undefined,
        currency:
            typeof o.currency === "string"
                ? o.currency.toUpperCase()
                : "USD",
        tax_group:
            typeof o.tax_group === "number" ? o.tax_group : undefined,
        tax_rate:
            typeof o.tax_rate === "number" ? o.tax_rate : undefined,
        unit_price:
            typeof o.unit_price === "number" ? o.unit_price : undefined,
        people_apply:
            typeof o.people_apply === "boolean" ? o.people_apply : undefined,
        quantity_apply:
            typeof o.quantity_apply === "boolean"
                ? o.quantity_apply
                : undefined,
        billing_type:
            typeof o.billing_type === "number" ? o.billing_type : undefined,
        category_id:
            typeof o.category_id === "number" ? o.category_id : undefined,
        business_sector:
            typeof o.business_sector === "string"
                ? o.business_sector
                : undefined,
        notes: typeof o.notes === "string" ? o.notes : undefined,
        status: typeof o.status === "number" ? o.status : undefined,
        account_id:
            typeof o.account_id === "number" ? o.account_id : undefined,
    };
}

function parseBillableServicesList(raw: unknown): BillableServicesListResult {
    const extracted = extractRowsAndTotal(raw);
    if (!extracted) return { items: [], meta: { total: 0 } };
    const meta: BillableServicesListMeta = { total: extracted.total };
    return {
        items: extracted.rows.map(normalizeBillableService),
        meta,
    };
}

export const billableServicesService = {
    async list(
        params: ListBillableServicesParams = {},
    ): Promise<BillableServicesListResult> {
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 20;
        const sector = params.business_sector?.trim();

        const { data } = await api.get<unknown>(SERVICES_PATH, {
            params: {
                page,
                perPage,
                per_page: perPage,
                business_sector: sector || undefined,
                status: params.status,
                tax_group: params.tax_group,
                category_id: params.category_id,
                billing_type: params.billing_type,
            },
        });
        return parseBillableServicesList(data);
    },

    async create(
        payload: CreateBillableServicePayload,
    ): Promise<BillableServiceItem> {
        const { data } = await api.post<unknown>(
            SERVICES_PATH,
            payload,
        );
        const raw =
            data &&
            typeof data === "object" &&
            "data" in data &&
            (data as { data: unknown }).data !== undefined
                ? (data as { data: unknown }).data
                : data;
        return normalizeBillableService(raw);
    },
};
