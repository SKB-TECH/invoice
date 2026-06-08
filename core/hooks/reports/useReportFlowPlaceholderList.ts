"use client";

import { useQuery } from "@tanstack/react-query";

export type ReportFlowHistoryRow = {
    id: number;
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    isf: string;
    pointOfSale: string;
};

export type ReportFlowHistoryListResult = {
    items: ReportFlowHistoryRow[];
    meta: { total: number };
};

const EMPTY_RESULT: ReportFlowHistoryListResult = {
    items: [],
    meta: { total: 0 },
};

export function useReportFlowPlaceholderList(scope: string) {
    return useQuery({
        queryKey: ["reports", scope, "list", "placeholder"],
        queryFn: async () => EMPTY_RESULT,
    });
}
