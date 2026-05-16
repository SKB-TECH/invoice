import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { invoiceService } from "@/core/services/invoice.service";
import type {
    CreateInvoiceResponse,
    GetInvoiceContractsParams, GetInvoiceFournituresParams,
    GetInvoicesParams,
    InvoiceCreateRequest,
} from "@/core/types/invoice";

export function useInvoices(params?: GetInvoicesParams) {
    return useQuery({
        queryKey: ["invoices", params],
        queryFn: () => invoiceService.getInvoices(params),
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

type UseCreateInvoiceOptions = {
    onSuccess?: (
        data: CreateInvoiceResponse,
        variables: InvoiceCreateRequest
    ) => void;
    onError?: (error: unknown) => void;
};

export function useCreateInvoice(options?: UseCreateInvoiceOptions) {
    const queryClient = useQueryClient();

    return useMutation<
        CreateInvoiceResponse,
        unknown,
        InvoiceCreateRequest
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

export function useInvoiceFournitures(
    params?: GetInvoiceFournituresParams
) {
    return useQuery({
        queryKey: ["invoice-fournitures", params],
        queryFn: () => invoiceService.getInvoiceFournitures(params),
        retry: false,
    });
}
