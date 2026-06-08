"use client";

import { useQuery } from "@tanstack/react-query";

import type { ReportFlowHistoryListResult } from "@/core/types/reports";
import { MOCK_REPORT_FLOW_HISTORY } from "@/lib/reports/report-flow-mock-history";

export const invoiceEditionReportListKeys = {
    all: ["reports", "invoice-edition", "list"] as const,
};

export function useInvoiceEditionReportList() {
    return useQuery({
        queryKey: invoiceEditionReportListKeys.all,
        queryFn: async (): Promise<ReportFlowHistoryListResult> => ({
            items: MOCK_REPORT_FLOW_HISTORY,
            meta: { total: MOCK_REPORT_FLOW_HISTORY.length },
        }),
    });
}
