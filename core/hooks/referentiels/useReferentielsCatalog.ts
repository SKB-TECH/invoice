"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAllReferentiels } from "@/core/services/referentiels.service";
import type { ReferentielRecord } from "@/core/schemas/referentiel.schema";

const REFERENTIELS_ALL_QUERY_KEY = ["referentiels", "catalog", "all"] as const;

export function useReferentielsCatalog(axis: string | null) {
    const query = useQuery({
        queryKey: [...REFERENTIELS_ALL_QUERY_KEY],
        queryFn: () => fetchAllReferentiels({ perPage: 100 }),
        staleTime: 60 * 1000,
    });

    const items = useMemo((): ReferentielRecord[] => {
        const raw = axis?.trim() ?? "";
        const key = raw.toLowerCase();
        const all = query.data ?? [];
        const filtered = key
            ? all.filter(
                  (r) => r.referentiel.trim().toLowerCase() === key,
              )
            : [...all];
        return [...filtered].sort((a, b) => {
            const cAxis = a.referentiel.localeCompare(b.referentiel, "fr", {
                sensitivity: "base",
            });
            if (cAxis !== 0) return cAxis;
            return a.code.localeCompare(b.code, "fr", {
                sensitivity: "base",
            });
        });
    }, [query.data, axis]);

    return { ...query, items };
}
