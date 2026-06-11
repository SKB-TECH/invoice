"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    billableServicesService,
    type ListBillableServicesParams,
} from "@/core/services/billable-services.service";
import type {
    BillableServiceItem,
    CreateBillableServicePayload,
    UpdateBillableServicePayload,
} from "@/core/types/billable-service";

export const billableServicesKeys = {
    all: ["billable-services"] as const,
    lists: () => [...billableServicesKeys.all, "list"] as const,
    list: (params: ListBillableServicesParams) =>
        [...billableServicesKeys.lists(), params] as const,
    details: () => [...billableServicesKeys.all, "detail"] as const,
    detail: (id: string) => [...billableServicesKeys.details(), id] as const,
};

export function useBillableServicesList(params: ListBillableServicesParams) {
    return useQuery({
        queryKey: billableServicesKeys.list(params),
        queryFn: () => billableServicesService.list(params),
    });
}

export function useBillableServiceDetail(rawId: string) {
    const id = decodeURIComponent(rawId);
    const numericId = Number(id);
    const enabled = Number.isFinite(numericId) && numericId > 0;

    return useQuery({
        queryKey: billableServicesKeys.detail(id),
        queryFn: () => billableServicesService.getById(numericId),
        enabled,
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

export function useUpdateBillableService(
    serviceId: number,
    options?: {
        onSuccess?: (data: BillableServiceItem) => void;
        onError?: (error: unknown) => void;
    },
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateBillableServicePayload) =>
            billableServicesService.update(serviceId, payload),
        onSuccess: async (data) => {
            await qc.invalidateQueries({
                queryKey: billableServicesKeys.all,
            });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}

export function useDeleteBillableService(options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => billableServicesService.delete(id),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: billableServicesKeys.all,
            });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
}
