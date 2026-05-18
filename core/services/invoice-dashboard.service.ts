import type { InvoiceDashboardOverviewResponse } from "@/core/types/invoice-dashboard";
import {api} from "@/core/services/api";

export const invoiceDashboardService = {
    getOverview: async (): Promise<InvoiceDashboardOverviewResponse> => {
        const response = await api.get<InvoiceDashboardOverviewResponse>(
            "/invoices/dashboard/overview"
        );

        return response.data;
    },
};
