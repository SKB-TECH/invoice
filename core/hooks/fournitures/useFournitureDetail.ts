"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFournitureByKey } from "@/core/services/fournitures.service";

export function useFournitureDetail(rawKey: string) {
    const key = decodeURIComponent(rawKey).trim();
    const enabled = key.length > 0;

    return useQuery({
        queryKey: ["fournitures", "detail", key],
        queryFn: () => fetchFournitureByKey(key),
        enabled,
    });
}
