
import type {
    CreateInvoiceCommentPayload,
    InvoiceComment,
} from "@/core/types/invoice-comment";
import {api} from "@/core/services/api";

export const invoiceCommentService = {
    getInvoiceComments: async (
        invoiceId: number | string
    ): Promise<InvoiceComment[]> => {
        const response = await api.get<InvoiceComment[]>(
            `/invoices/${invoiceId}/comments`
        );

        return response.data;
    },

    createInvoiceComment: async (
        invoiceId: number | string,
        payload: CreateInvoiceCommentPayload
    ): Promise<unknown> => {
        const response = await api.post(
            `/invoices/${invoiceId}/comments`,
            payload
        );

        return response.data;
    },
};
