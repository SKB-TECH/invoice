import { api } from "@/core/services/api";
import type {
    CreateInvoiceResponse,
    GetInvoiceContractsParams,
    GetInvoiceContractsResponse, GetInvoiceFournituresParams, GetInvoiceFournituresResponse,
    GetInvoicesParams,
    GetInvoicesResponse,
    InvoiceCreateRequest,
} from "@/core/types/invoice";

export const invoiceService = {
    getInvoices: async (
        params?: GetInvoicesParams
    ): Promise<GetInvoicesResponse> => {
        const response = await api.get<GetInvoicesResponse>("/invoices", {
            params: {
                page: params?.page,
                perPage: params?.perPage,
                status: params?.status || undefined,
            },
        });

        return response.data;
    },

    getInvoiceContracts: async (
        params?: GetInvoiceContractsParams
    ): Promise<GetInvoiceContractsResponse> => {
        const response = await api.get<GetInvoiceContractsResponse>(
            "/invoices/contracts",
            {
                params: {
                    page: params?.page,
                    perPage: params?.perPage,
                },
            }
        );

        return response.data;
    },

    createInvoice: async (
        payload: InvoiceCreateRequest
    ): Promise<CreateInvoiceResponse> => {
        const response = await api.post<CreateInvoiceResponse>(
            "/invoices",
            payload
        );

        return response.data;
    },
    getInvoiceFournitures: async (
        params?: GetInvoiceFournituresParams
    ): Promise<GetInvoiceFournituresResponse> => {
        const response = await api.get<GetInvoiceFournituresResponse>(
            "/invoices/fournitures",
            {
                params: {
                    page: params?.page,
                    perPage: params?.perPage,
                },
            }
        );

        return response.data;
    },
};
