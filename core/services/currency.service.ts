import { api } from "@/core/services/api";
import { unwrapApiData } from "@/core/utils/apiResponse";

/** Aligné avec la doc API (Swagger) du module invoices ; ajuster si l’URL diffère. */
const CURRENCIES_PATH = "/invoices/currencies";

export type CurrencyListItem = {
    /** Code ISO 4217 à envoyer dans les payloads (USD, CDF, …). */
    code: string;
    /** Texte affiché dans les listes. */
    label: string;
};

const DEFAULT_CONTRACT_CURRENCIES: CurrencyListItem[] = [
    { code: "USD", label: "USD" },
    { code: "CDF", label: "CDF" },
    { code: "EUR", label: "EUR" },
    { code: "GBP", label: "GBP" },
];

function pickStr(v: unknown): string | undefined {
    if (v === null || v === undefined) return undefined;
    const s = String(v).trim();
    return s || undefined;
}

function normalizeCode(raw: unknown): string | undefined {
    const s = pickStr(raw);
    if (!s) return undefined;
    const compact = s.replace(/\s+/g, "").toUpperCase();
    if (/^[A-Z]{3}$/.test(compact)) return compact;
    if (compact.length >= 3 && /^[A-Z]+$/.test(compact))
        return compact.slice(0, 3);
    return undefined;
}

function objectToCurrencyItem(el: Record<string, unknown>): CurrencyListItem | null {
    const code =
        normalizeCode(el.code) ??
        normalizeCode(el.currency) ??
        normalizeCode(el.iso) ??
        normalizeCode(el.value);
    if (!code) return null;

    const label =
        pickStr(el.label) ??
        pickStr(el.name) ??
        pickStr(el.title) ??
        pickStr(el.description) ??
        code;

    return { code, label };
}

function parseCurrencyArray(arr: unknown[]): CurrencyListItem[] {
    const out: CurrencyListItem[] = [];
    for (const el of arr) {
        if (typeof el === "string" || typeof el === "number") {
            const code = normalizeCode(el);
            if (code) out.push({ code, label: code });
            continue;
        }
        if (el && typeof el === "object" && !Array.isArray(el)) {
            const item = objectToCurrencyItem(el as Record<string, unknown>);
            if (item) out.push(item);
        }
    }
    const seen = new Set<string>();
    return out.filter((row) => {
        if (seen.has(row.code)) return false;
        seen.add(row.code);
        return true;
    });
}

/**
 * Tolère plusieurs enveloppes ({ items }, { data }, corps nu, etc.) comme pour les autres listes invoices.
 */
export function parseCurrenciesResponse(raw: unknown): CurrencyListItem[] {
    const shells = [raw, unwrapApiData<unknown>(raw)];

    for (const shell of shells) {
        if (shell === null || shell === undefined) continue;

        if (Array.isArray(shell)) {
            const rows = parseCurrencyArray(shell);
            if (rows.length > 0) return rows;
            continue;
        }

        if (typeof shell !== "object") continue;

        const o = shell as Record<string, unknown>;
        const inner = o.items ?? o.data ?? o.currencies ?? o.currency_list;

        if (Array.isArray(inner)) {
            const rows = parseCurrencyArray(inner);
            if (rows.length > 0) return rows;
        }
    }

    throw new Error("Format de liste devises inconnu.");
}

export const currencyService = {
    /**
     * Devises autorisées côté API. En cas d’échec, l’UI peut retomber sur `defaultContractCurrencies`.
     */
    async list(): Promise<CurrencyListItem[]> {
        const res = await api.get(CURRENCIES_PATH);
        return parseCurrenciesResponse(res.data);
    },

    defaultContractCurrencies(): CurrencyListItem[] {
        return [...DEFAULT_CONTRACT_CURRENCIES];
    },
};
