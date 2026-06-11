"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchInvoiceItemTypes } from "@/core/services/item-types.service";

const ITEM_TYPES_QUERY_KEY = ["invoice-item-types"] as const;

export function useItemTypes() {
    return useQuery({
        queryKey: ITEM_TYPES_QUERY_KEY,
        queryFn: () => fetchInvoiceItemTypes(),
        staleTime: 60 * 1000,
    });
}
