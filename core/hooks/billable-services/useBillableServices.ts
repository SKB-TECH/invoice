"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    billableServicesService,
    type ListBillableServicesParams,
} from "@/core/services/billable-services.service";
import type {
    BillableServiceItem,
    CreateBillableServicePayload,
} from "@/core/types/billable-service";

export const billableServicesKeys = {
    all: ["billable-services"] as const,
    lists: () => [...billableServicesKeys.all, "list"] as const,
    list: (params: ListBillableServicesParams) =>
        [...billableServicesKeys.lists(), params] as const,
};

export function useBillableServicesList(params: ListBillableServicesParams) {
    return useQuery({
        queryKey: billableServicesKeys.list(params),
        queryFn: () => billableServicesService.list(params),
    });
}

export function useCreateBillableService(options?: {
    onSuccess?: (data: BillableServiceItem) => void;
    onError?: (error: unknown) => void;
}) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateBillableServicePayload) =>
            billableServicesService.create(payload),
        onSuccess: async (data) => {
            await qc.invalidateQueries({
                queryKey: billableServicesKeys.all,
            });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}
