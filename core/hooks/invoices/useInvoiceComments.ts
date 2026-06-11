"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceCommentService } from "@/core/services/invoice-comment.service";
import type {
    CreateInvoiceCommentPayload,
    InvoiceComment,
} from "@/core/types/invoice-comment";

export const invoiceCommentQueryKeys = {
    all: ["invoice-comments"] as const,
    list: (invoiceId: number | string) =>
        [...invoiceCommentQueryKeys.all, invoiceId] as const,
};

type UseGetInvoiceCommentsOptions = {
    enabled?: boolean;
};

export function useGetInvoiceComments(
    invoiceId: number | string,
    options?: UseGetInvoiceCommentsOptions
) {
    return useQuery<InvoiceComment[]>({
        queryKey: invoiceCommentQueryKeys.list(invoiceId),
        queryFn: () => invoiceCommentService.getInvoiceComments(invoiceId),
        enabled:
            (options?.enabled ?? true) &&
            invoiceId !== undefined &&
            invoiceId !== null &&
            String(invoiceId).trim() !== "",
        retry: false,
    });
}

type CreateInvoiceCommentVariables = {
    invoiceId: number | string;
    payload: CreateInvoiceCommentPayload;
};

type UseCreateInvoiceCommentOptions = {
    onSuccess?: (data: unknown, variables: CreateInvoiceCommentVariables) => void;
    onError?: (error: unknown) => void;
};

export function useCreateInvoiceComment(
    options?: UseCreateInvoiceCommentOptions
) {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, CreateInvoiceCommentVariables>({
        mutationFn: ({ invoiceId, payload }) =>
            invoiceCommentService.createInvoiceComment(invoiceId, payload),

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: invoiceCommentQueryKeys.list(variables.invoiceId),
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}
