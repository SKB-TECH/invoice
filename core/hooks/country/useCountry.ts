"use client";

import { useQuery } from "@tanstack/react-query";

import { countryService } from "@/core/services/country.service";

export const countryQueryKeys = {
    all: ["countries"] as const,
    list: () => [...countryQueryKeys.all, "list"] as const,
};

/** Pays depuis GET /main/countries */
export function useCountries() {
    return useQuery({
        queryKey: countryQueryKeys.list(),
        queryFn: () => countryService.list(),
        staleTime: 5 * 60_000,
        retry: false,
    });
}
