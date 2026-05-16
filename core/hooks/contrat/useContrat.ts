"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    contratService,
    type ListContractsParams,
} from "@/core/services/contrat.service";
import type { CreateContractInput } from "@/core/schemas/contrat.schema";
import { clientQueryKeys } from "@/core/hooks/client/useClient";
import { getAxiosErrorMessage } from "@/core/utils/apiResponse";

export const contratQueryKeys = {
    all: ["contracts"] as const,
    lists: () => [...contratQueryKeys.all, "list"] as const,
    list: (params: ListContractsParams | undefined) =>
        [...contratQueryKeys.lists(), params ?? {}] as const,
    details: () => [...contratQueryKeys.all, "detail"] as const,
    detail: (id: string) => [...contratQueryKeys.details(), id] as const,
};

export function useContracts(params?: ListContractsParams) {
    return useQuery({
        queryKey: contratQueryKeys.list(params),
        queryFn: () => contratService.list(params),
    });
}

export function useContract(id: string | undefined) {
    return useQuery({
        queryKey: contratQueryKeys.detail(id ?? ""),
        queryFn: () => contratService.getById(id as string),
        enabled: Boolean(id),
    });
}

export type CreateContractPayload = {
    data: CreateContractInput;
    file?: File | null;
};

export type UpdateContractPayload = {
    id: string;
    data: CreateContractInput;
    file?: File | null;
};

export function useCreateContract() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ data, file }: CreateContractPayload) =>
            contratService.create(data, file),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: contratQueryKeys.all });
            await qc.invalidateQueries({ queryKey: clientQueryKeys.all });
        },
    });
}

export function useUpdateContract() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, file }: UpdateContractPayload) =>
            contratService.update(id, data, file),
        onSuccess: async (_data, variables) => {
            await qc.invalidateQueries({ queryKey: contratQueryKeys.all });
            await qc.invalidateQueries({
                queryKey: contratQueryKeys.detail(variables.id),
            });
        },
    });
}

export function useDeleteContract() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => contratService.delete(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: contratQueryKeys.all });
        },
    });
}

export function contratMutationErrorMessage(
    error: unknown,
    fallback = "Une erreur est survenue."
): string {
    return getAxiosErrorMessage(error, fallback);
}
