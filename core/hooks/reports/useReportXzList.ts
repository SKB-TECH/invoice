"use client";

import { useQuery } from "@tanstack/react-query";

import type { ReportFlowHistoryListResult } from "@/core/types/reports";
import { MOCK_REPORT_FLOW_HISTORY } from "@/lib/reports/report-flow-mock-history";

export const reportXzListKeys = {
    all: ["reports", "xz", "list"] as const,
};

export function useReportXzList() {
    return useQuery({
        queryKey: reportXzListKeys.all,
        queryFn: async (): Promise<ReportFlowHistoryListResult> => ({
            items: MOCK_REPORT_FLOW_HISTORY,
            meta: { total: MOCK_REPORT_FLOW_HISTORY.length },
        }),
    });
}
