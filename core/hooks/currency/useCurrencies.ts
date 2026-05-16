"use client";

import { useQuery } from "@tanstack/react-query";

import { currencyService } from "@/core/services/currency.service";

export const currencyQueryKeys = {
    all: ["currencies"] as const,
    contractList: () => [...currencyQueryKeys.all, "contracts"] as const,
};

/** Liste des devises pour formulaires contrat / filtres métier (GET JSON). */
export function useContractCurrencies() {
    return useQuery({
        queryKey: currencyQueryKeys.contractList(),
        queryFn: () => currencyService.list(),
        staleTime: 1000 * 60 * 30,
        retry: 1,
    });
}
