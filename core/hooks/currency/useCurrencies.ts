"use client";

import { useQuery } from "@tanstack/react-query";

import { currencyService } from "@/core/services/currency.service";

export const currencyQueryKeys = {
    all: ["currencies"] as const,
    contractList: () => [...currencyQueryKeys.all, "contracts"] as const,
};

/** Devises du fichier `core/utils/currencies.json` (mise en cache React Query locale). */
export function useContractCurrencies() {
    return useQuery({
        queryKey: currencyQueryKeys.contractList(),
        queryFn: async () => currencyService.list(),
        staleTime: Infinity,
        gcTime: Infinity,
    });
}
