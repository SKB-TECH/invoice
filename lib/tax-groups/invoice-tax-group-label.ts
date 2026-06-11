import type { InvoiceTaxGroup } from "@/core/types/invoice-tax-group";

const FR_PERCENT_SUFFIX = "\u202f%";

export function formatTaxRatePercent(rate: number): string {
    return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    }).format(rate);
}

export function formatInvoiceTaxGroupSelectLabel(
    group: Pick<InvoiceTaxGroup, "title" | "rate">,
): string {
    return `${group.title.trim()} [${formatTaxRatePercent(group.rate)}${FR_PERCENT_SUFFIX}]`;
}

export function findInvoiceTaxGroupById(
    groups: InvoiceTaxGroup[],
    id: number | undefined,
): InvoiceTaxGroup | undefined {
    if (typeof id !== "number" || !Number.isFinite(id)) return undefined;
    return groups.find((group) => group.id === id);
}

export function resolveBillableServiceTaxRate(
    taxRate: number | undefined,
    taxGroupId: number | undefined,
    taxGroups: InvoiceTaxGroup[],
): number | undefined {
    if (typeof taxRate === "number" && Number.isFinite(taxRate)) {
        return taxRate;
    }

    return findInvoiceTaxGroupById(taxGroups, taxGroupId)?.rate;
}

export function resolveBillableServiceTaxGroupLabel(
    taxGroupId: number | undefined,
    taxGroups: InvoiceTaxGroup[],
): string | undefined {
    const group = findInvoiceTaxGroupById(taxGroups, taxGroupId);
    if (!group) return undefined;

    return formatInvoiceTaxGroupSelectLabel(group);
}

export function computePriceAfterTax(
    priceBefore: number,
    ratePercent: number,
): number {
    return priceBefore * (1 + ratePercent / 100);
}

export function formatPriceAfterTaxDisplay(
    priceBefore: number | null,
    ratePercent: number | undefined,
): string {
    if (priceBefore === null || ratePercent === undefined) return "";

    const priceAfter = computePriceAfterTax(priceBefore, ratePercent);
    if (!Number.isFinite(priceAfter)) return "";

    return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(priceAfter);
}

export function pickDefaultInvoiceTaxGroupId(
    groups: InvoiceTaxGroup[],
): string {
    if (groups.length === 0) return "";

    const defaultGroup =
        groups.find((g) => g.is_default) ??
        groups.find((g) => g.id === 2) ??
        groups[0];

    return String(defaultGroup.id);
}
