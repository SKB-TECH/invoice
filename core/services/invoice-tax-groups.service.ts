import { api } from "@/core/services/api";
import type { InvoiceTaxGroup } from "@/core/types/invoice-tax-group";
import { unwrapApiData } from "@/core/utils/apiResponse";

const TAX_GROUPS_PATH = "/invoices/tax-groups";

function normalizeTaxGroup(row: unknown): InvoiceTaxGroup | null {
    if (!row || typeof row !== "object") return null;

    const o = row as Record<string, unknown>;
    const id = typeof o.id === "number" ? o.id : Number(o.id);
    const rate = typeof o.rate === "number" ? o.rate : Number(o.rate);
    const code = typeof o.code === "string" ? o.code.trim() : "";
    const title = typeof o.title === "string" ? o.title.trim() : "";

    if (!Number.isFinite(id) || id < 1 || !code || !title || !Number.isFinite(rate)) {
        return null;
    }

    return {
        id,
        account_id:
            typeof o.account_id === "number" ? o.account_id : undefined,
        code,
        title,
        description:
            typeof o.description === "string" ? o.description : undefined,
        mention: typeof o.mention === "string" ? o.mention : undefined,
        value: typeof o.value === "string" ? o.value : undefined,
        sort: typeof o.sort === "number" ? o.sort : undefined,
        is_default: o.is_default === true,
        rate,
        requires_certificate: o.requires_certificate === true,
        requires_line_comment: o.requires_line_comment === true,
        is_out_of_scope: o.is_out_of_scope === true,
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

export async function fetchInvoiceTaxGroups(): Promise<InvoiceTaxGroup[]> {
    const response = await api.get(TAX_GROUPS_PATH);
    const unwrapped = unwrapApiData<unknown>(response.data);
    const items = extractItems(unwrapped);

    return items
        .map(normalizeTaxGroup)
        .filter((group): group is InvoiceTaxGroup => group !== null)
        .sort((a, b) => {
            const sortDiff = (a.sort ?? a.id) - (b.sort ?? b.id);
            if (sortDiff !== 0) return sortDiff;
            return a.title.localeCompare(b.title, "fr", {
                sensitivity: "base",
            });
        });
}
