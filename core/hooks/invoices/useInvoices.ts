import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { invoiceService } from "@/core/services/invoice.service";

import type {
    AttachInvoicePdfPayload,
    AttachInvoicePdfResponse,
    CreateInvoiceResponse, CreateInvoiceSubmission,
    GetInvoiceContractsParams,
    GetInvoiceFournituresParams,
    GetInvoicesParams, GetOutstandingInvoicesParams,
    InvoiceCreateRequest, InvoiceDetailResponse, NormalizeInvoicePayload, NormalizeInvoiceResponse,
    UpdateInvoiceSubmission,
} from "@/core/types/invoice";

export function useInvoices(params?: GetInvoicesParams) {
    return useQuery({
        queryKey: ["invoices", params],
        queryFn: () => invoiceService.getInvoices(params),
        retry: false,
    });
}

export function useOutstandingInvoices(params?: GetOutstandingInvoicesParams) {
    return useQuery({
        queryKey: ["invoices-outstanding", params],
        queryFn: () => invoiceService.getOutstandingInvoices(params),
        retry: false,
    });
}

export function useInvoiceContracts(
    params?: GetInvoiceContractsParams
) {
    return useQuery({
        queryKey: ["invoice-contracts", params],
        queryFn: () => invoiceService.getInvoiceContracts(params),
        retry: false,
    });
}

export function useInvoiceFournitures(
    params?: GetInvoiceFournituresParams
) {
    return useQuery({
        queryKey: ["invoice-fournitures", params],
        queryFn: () => invoiceService.getInvoiceFournitures(params),
        retry: false,
    });
}

export function useInvoiceTypes() {
    return useQuery({
        queryKey: ["invoice-types"],
        queryFn: () => invoiceService.getInvoiceTypes(),
        retry: false,
    });
}


type UseCreateInvoiceOptions = {
    onSuccess?: (
        data: CreateInvoiceResponse,
        variables: CreateInvoiceSubmission
    ) => void;
    onError?: (error: unknown) => void;
};

export function useCreateInvoice(options?: UseCreateInvoiceOptions) {
    const queryClient = useQueryClient();

    return useMutation<
        CreateInvoiceResponse,
        unknown,
        CreateInvoiceSubmission
    >({
        mutationFn: invoiceService.createInvoice,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["invoices"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}

export function useInvoiceById(id?: number | string) {
    return useQuery<InvoiceDetailResponse>({
        queryKey: ["invoice", id],
        queryFn: () => invoiceService.getInvoiceById(id as number | string),
        enabled: Boolean(id),
        retry: false,
    });
}

type UseNormalizeInvoiceOptions = {
    onSuccess?: (
        data: NormalizeInvoiceResponse,
        variables: NormalizeInvoicePayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useNormalizeInvoice(
    options?: UseNormalizeInvoiceOptions
) {
    const queryClient = useQueryClient();

    return useMutation<
        NormalizeInvoiceResponse,
        unknown,
        NormalizeInvoicePayload
    >({
        mutationFn: invoiceService.normalizeInvoice,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["invoices"],
            });

            queryClient.invalidateQueries({
                queryKey: ["invoice", variables.id],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}

type UseUpdateInvoiceOptions = {
    onSuccess?: (
        data: unknown,
        variables: UpdateInvoiceSubmission
    ) => void;
    onError?: (error: unknown) => void;
};

export function useUpdateInvoice(options?: UseUpdateInvoiceOptions) {
    const queryClient = useQueryClient();
    return useMutation<unknown, unknown, UpdateInvoiceSubmission>({
        mutationFn: invoiceService.updateInvoice,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["invoices"],
            });
            queryClient.invalidateQueries({
                queryKey: ["invoice", variables.id],
            });
            options?.onSuccess?.(data, variables);
        },
        onError: options?.onError,
    });
}

type UseAttachInvoicePdfOptions = {
    onSuccess?: (
        data: AttachInvoicePdfResponse,
        variables: AttachInvoicePdfPayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useAttachInvoicePdf(
    options?: UseAttachInvoicePdfOptions
) {
    const queryClient = useQueryClient();

    return useMutation<
        AttachInvoicePdfResponse,
        unknown,
        AttachInvoicePdfPayload
    >({
        mutationFn: invoiceService.attachInvoicePdf,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["invoices"],
            });

            queryClient.invalidateQueries({
                queryKey: ["invoice", variables.id],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}
