"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchInvoiceTaxGroups } from "@/core/services/invoice-tax-groups.service";

export const invoiceTaxGroupsKeys = {
    all: ["invoices", "tax-groups"] as const,
};

export function useInvoiceTaxGroups() {
    return useQuery({
        queryKey: invoiceTaxGroupsKeys.all,
        queryFn: fetchInvoiceTaxGroups,
        staleTime: 5 * 60 * 1000,
    });
}
