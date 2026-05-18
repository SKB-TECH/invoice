"use client";

import { useQuery } from "@tanstack/react-query";
import { invoiceDashboardService } from "@/core/services/invoice-dashboard.service";
import type { InvoiceDashboardOverviewResponse } from "@/core/types/invoice-dashboard";

export const invoiceDashboardQueryKeys = {
    all: ["invoice-dashboard"] as const,
    overview: () => [...invoiceDashboardQueryKeys.all, "overview"] as const,
};

type UseInvoiceDashboardOverviewOptions = {
    enabled?: boolean;
};

export function useInvoiceDashboardOverview(
    options?: UseInvoiceDashboardOverviewOptions
) {
    return useQuery<InvoiceDashboardOverviewResponse>({
        queryKey: invoiceDashboardQueryKeys.overview(),
        queryFn: invoiceDashboardService.getOverview,
        enabled: options?.enabled ?? true,
        retry: false,
    });
}
