"use client";

import { useQuery } from "@tanstack/react-query";

import { reportsService } from "@/core/services/reports.service";

export const reportAListKeys = {
    all: ["reports", "a", "list"] as const,
};

export function useReportAList() {
    return useQuery({
        queryKey: reportAListKeys.all,
        queryFn: () => reportsService.listReportA(),
    });
}
