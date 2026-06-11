"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    clientService,
    type ListClientsParams,
} from "@/core/services/client.service";
import type { CreateClientInput } from "@/core/schemas/client.schema";
import type { ClientTypeOption } from "@/core/schemas/type-client.schema";
import { getAxiosErrorMessage } from "@/core/utils/apiResponse";

export type ClientMutationInput = {
    payload: CreateClientInput;
    typeOption?: ClientTypeOption;
    referenceDocumentFile?: File | null;
};

export const clientQueryKeys = {
    all: ["clients"] as const,
    lists: () => [...clientQueryKeys.all, "list"] as const,
    list: (params: ListClientsParams | undefined) =>
        [...clientQueryKeys.lists(), params ?? {}] as const,
    details: () => [...clientQueryKeys.all, "detail"] as const,
    detail: (id: string) => [...clientQueryKeys.details(), id] as const,
};

export function useClients(params?: ListClientsParams) {
    return useQuery({
        queryKey: clientQueryKeys.list(params),
        queryFn: () => clientService.list(params),
    });
}

export function useClient(id: string | undefined) {
    return useQuery({
        queryKey: clientQueryKeys.detail(id ?? ""),
        queryFn: () => clientService.getById(id as string),
        enabled: Boolean(id),
    });
}

export function useCreateClient() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ payload, typeOption, referenceDocumentFile }: ClientMutationInput) =>
            clientService.create(payload, typeOption, referenceDocumentFile),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: clientQueryKeys.all });
        },
    });
}

export function useUpdateClient() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
            typeOption,
            referenceDocumentFile,
        }: {
            id: string;
            payload: CreateClientInput;
            typeOption?: ClientTypeOption;
            referenceDocumentFile?: File | null;
        }) =>
            clientService.update(
                id,
                payload,
                typeOption,
                referenceDocumentFile
            ),
        onSuccess: async (_data, variables) => {
            await qc.invalidateQueries({ queryKey: clientQueryKeys.all });
            await qc.invalidateQueries({
                queryKey: clientQueryKeys.detail(variables.id),
            });
        },
    });
}

export function useDeleteClient() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => clientService.delete(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: clientQueryKeys.all });
        },
    });
}

export function clientMutationErrorMessage(
    error: unknown,
    fallback = "Une erreur est survenue."
): string {
    return getAxiosErrorMessage(error, fallback);
}
