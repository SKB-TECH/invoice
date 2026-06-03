"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFournituresList } from "@/core/services/fournitures.service";

export type FournituresListParams = {
    page?: number;
    perPage?: number;
};

export function useFournituresList(params?: FournituresListParams) {
    const page = params?.page ?? 1;
    const perPage = params?.perPage ?? 20;

    return useQuery({
        queryKey: ["fournitures", "list", page, perPage],
        queryFn: () => fetchFournituresList({ page, perPage }),
    });
}
