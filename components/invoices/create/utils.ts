import { catalogItems } from "./constants";
import type {
    CatalogItem,
    InvoiceItem,
    ItemKind,
} from "./types";

export async function searchCatalogApi(
    type: ItemKind,
    query: string
): Promise<CatalogItem[]> {
    const q = query.trim().toLowerCase();

    await new Promise((resolve) => setTimeout(resolve, 250));

    return catalogItems.filter((item) => {
        const sameType = item.type === type;
        const matchQuery = !q || item.name.toLowerCase().includes(q);

        return sameType && matchQuery;
    });
}

export function formatMoney(value: number) {
    return value.toLocaleString("fr-FR").replace(/\s/g, ".");
}

export function getLineSubtotal(item: InvoiceItem) {
    if (item.type === "Service") {
        const men = item.men ?? 1;
        const days = item.days ?? 1;
        const dailyPrice = item.dailyPrice ?? 0;

        return men * days * dailyPrice;
    }

    return item.quantity * item.priceHT;
}

export function getLineTax(item: InvoiceItem) {
    return Math.round(getLineSubtotal(item) * (item.tax / 100));
}

export function getLineTotal(item: InvoiceItem) {
    return getLineSubtotal(item) + getLineTax(item);
}

export function getTaxGroups(items: InvoiceItem[]) {
    const groups = new Map<
        number,
        {
            rate: number;
            subtotal: number;
            taxAmount: number;
            total: number;
        }
    >();

    items.forEach((item) => {
        const subtotal = getLineSubtotal(item);
        const taxAmount = getLineTax(item);
        const total = subtotal + taxAmount;

        const existing = groups.get(item.tax);

        if (existing) {
            existing.subtotal += subtotal;
            existing.taxAmount += taxAmount;
            existing.total += total;
        } else {
            groups.set(item.tax, {
                rate: item.tax,
                subtotal,
                taxAmount,
                total,
            });
        }
    });

    return Array.from(groups.values()).sort((a, b) => b.rate - a.rate);
}
