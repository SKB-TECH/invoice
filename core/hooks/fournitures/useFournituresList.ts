"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFournituresList } from "@/core/services/fournitures.service";

export function useFournituresList(page = 1, perPage = 20) {
    return useQuery({
        queryKey: ["fournitures", "list", page, perPage],
        queryFn: () => fetchFournituresList({ page, perPage }),
    });
}
