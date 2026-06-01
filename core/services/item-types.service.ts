import { api } from "@/core/services/api";
import type { InvoiceItemType } from "@/core/types/item-type";
import { unwrapApiData } from "@/core/utils/apiResponse";

const ITEM_TYPES_PATH = "/invoices/item-types";

function normalizeItemType(row: unknown): InvoiceItemType | null {
    if (!row || typeof row !== "object") return null;

    const o = row as Record<string, unknown>;
    const id = typeof o.id === "number" ? o.id : Number(o.id);
    const code = typeof o.code === "string" ? o.code.trim() : "";

    if (!Number.isFinite(id) || id < 1 || !code) return null;

    return {
        id,
        code,
        is_default: o.is_default === true,
        sort: typeof o.sort === "number" ? o.sort : Number(o.sort) || 0,
    };
}

function extractItems(raw: unknown): unknown[] {
    if (Array.isArray(raw)) return raw;

    if (raw && typeof raw === "object") {
        const o = raw as Record<string, unknown>;
        if (Array.isArray(o.items)) return o.items;
        if (o.data) return extractItems(o.data);
    }

    return [];
}

export async function fetchInvoiceItemTypes(): Promise<InvoiceItemType[]> {
    const response = await api.get(ITEM_TYPES_PATH);
    const unwrapped = unwrapApiData<unknown>(response.data);
    const items = extractItems(unwrapped);

    return items
        .map(normalizeItemType)
        .filter((item): item is InvoiceItemType => item !== null)
        .sort((a, b) => {
            const sortDiff = a.sort - b.sort;
            if (sortDiff !== 0) return sortDiff;
            return a.code.localeCompare(b.code, "fr", { sensitivity: "base" });
        });
}
