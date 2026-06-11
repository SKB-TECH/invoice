"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFournitureById } from "@/core/services/fournitures.service";

export function useFournitureDetail(rawId: string) {
    const id = decodeURIComponent(rawId);
    const numericId = Number(id);
    const enabled = Number.isFinite(numericId) && numericId > 0;

    return useQuery({
        queryKey: ["fournitures", "detail", id],
        queryFn: () => fetchFournitureById(numericId),
        enabled,
    });
}
