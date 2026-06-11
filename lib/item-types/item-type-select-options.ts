import type { InvoiceItemType } from "@/core/types/item-type";

export function buildItemTypeSelectOptions(
    itemTypes: InvoiceItemType[],
    currentCode?: string,
): InvoiceItemType[] {
    const trimmed = currentCode?.trim() ?? "";
    if (!trimmed || itemTypes.some((item) => item.code === trimmed)) {
        return itemTypes;
    }

    return [
        {
            id: 0,
            code: trimmed,
            is_default: false,
            sort: -1,
        },
        ...itemTypes,
    ];
}
