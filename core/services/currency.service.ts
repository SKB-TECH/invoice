import currenciesRaw from "@/core/utils/currencies.json";

export type CurrencyListItem = {
    /** Code ISO (ou symbole sur 3 caractères) tel que dans le JSON. */
    code: string;
    /** Libellé affiché dans les listes déroulantes. */
    label: string;
};

function buildCurrencyList(): CurrencyListItem[] {
    const o = currenciesRaw as Record<string, string>;
    const items: CurrencyListItem[] = [];

    for (const [codeKey, englishName] of Object.entries(o)) {
        const code = codeKey.trim().toUpperCase();
        const name = (englishName ?? "").trim();
        items.push({
            code,
            label: name ? `${code} - ${name}` : code,
        });
    }

    items.sort((a, b) => a.code.localeCompare(b.code));
    return items;
}

let cachedList: CurrencyListItem[] | null = null;

export const currencyService = {
    /**
     * Liste des devises issue de `core/utils/currencies.json` (code → nom en anglais).
     */
    list(): CurrencyListItem[] {
        if (!cachedList) {
            cachedList = buildCurrencyList();
        }
        return cachedList;
    },

    /** Préférences métier lorsque la valeur courante du formulaire est absente du JSON. */
    preferredFallbackCode(list: CurrencyListItem[]): string {
        const codes = new Set(list.map((c) => c.code));
        if (codes.has("USD")) return "USD";
        if (codes.has("CDF")) return "CDF";
        return list[0]?.code ?? "USD";
    },

    /** @deprecated synonyme de `list()` pour compatibilité. */
    defaultContractCurrencies(): CurrencyListItem[] {
        return [...this.list()];
    },
};
