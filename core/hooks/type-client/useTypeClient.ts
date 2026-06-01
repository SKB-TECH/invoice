"use client";

import { useQuery } from "@tanstack/react-query";

import { typeClientService } from "@/core/services/type-client.service";

export const clientTypeQueryKeys = {
    all: ["client-types"] as const,
    list: () => [...clientTypeQueryKeys.all, "list"] as const,
};

/** Types de client depuis GET /invoices/client-types */
export function useTypeClient() {
    return useQuery({
        queryKey: clientTypeQueryKeys.list(),
        queryFn: () => typeClientService.list(),
        staleTime: 60_000,
        retry: false,
    });
}

/** Alias explicite pour la liste des types. */
export const useClientTypes = useTypeClient;
