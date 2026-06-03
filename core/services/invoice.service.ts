import { api } from "@/core/services/api";
import type {
    AttachInvoicePdfPayload, AttachInvoicePdfResponse,
    CreateInvoiceResponse, CreateInvoiceSubmission,
    GetInvoiceContractsParams,
    GetInvoiceContractsResponse, GetInvoiceFournituresParams, GetInvoiceFournituresResponse,
    GetInvoicesParams,
    GetInvoicesResponse, GetInvoiceTypesResponse, GetOutstandingInvoicesParams,
    InvoiceCreateRequest, InvoiceDetailResponse, NormalizeInvoicePayload, NormalizeInvoiceResponse,
    UpdateInvoiceSubmission,
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

    getOutstandingInvoices: async (
        params?: GetOutstandingInvoicesParams
    ): Promise<GetInvoicesResponse> => {
        const response = await api.get<GetInvoicesResponse>("/invoices/outstanding", {
            params: {
                page: params?.page,
                perPage: params?.perPage,
                client_id: params?.client_id ?? undefined,
                workflow_status: params?.workflow_status?.trim() || undefined,
                type: params?.type ?? undefined,
            },
        });

        return response.data;
    },

    createInvoice: async ({
                              payload,
                              pdfFile,
                          }: CreateInvoiceSubmission): Promise<CreateInvoiceResponse> => {
        const formData = new FormData();

        formData.append("currency", payload.currency);
        formData.append("client_id", String(payload.client_id));
        formData.append(
            "payment_info",
            JSON.stringify(payload.payment_info)
        );
        formData.append("items", JSON.stringify(payload.items));

        if (payload.due_date) {
            formData.append("due_date", payload.due_date);
        }

        if (payload.contract_id) {
            formData.append("contract_id", String(payload.contract_id));
        }

        if (payload.type) {
            formData.append("type", String(payload.type));
        }

        if (payload.template_id) {
            formData.append("template_id", String(payload.template_id));
        }

        if (payload.normalization) {
            formData.append(
                "normalization",
                JSON.stringify(payload.normalization)
            );
        }

        if (payload.workflow_status) {
            formData.append("workflow_status", payload.workflow_status);
        }

        formData.append("pdf_file", pdfFile, pdfFile.name);

        const response = await api.post<CreateInvoiceResponse>(
            "/invoices",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
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
    getInvoiceTypes: async (): Promise<GetInvoiceTypesResponse> => {
        const response = await api.get<GetInvoiceTypesResponse>(
            "/invoices/invoice-types"
        );

        return response.data;
    },
    getInvoiceContracts: async (
        params?: GetInvoiceContractsParams
    ): Promise<GetInvoiceContractsResponse> => {
        const response = await api.get<GetInvoiceContractsResponse>(
            "/invoices/contracts",
            {
                params: {
                    page: params?.page ?? 1,
                    perPage: params?.perPage ?? 20,
                    status: params?.status ?? undefined,
                    client_id: params?.client_id ?? undefined,
                    contract_id: params?.contract_id ?? undefined,
                    type: params?.type ?? undefined,
                    billing_cycle: params?.billing_cycle ?? undefined,
                },
            }
        );

        return response.data;
    },
    getInvoiceById: async (
        id: number | string
    ): Promise<InvoiceDetailResponse> => {
        const response = await api.get<InvoiceDetailResponse>(
            `/invoices/${id}`
        );

        return response.data;
    },
    normalizeInvoice: async ({
                                 id,
                                 invoice_sub_category,
                             }: NormalizeInvoicePayload): Promise<NormalizeInvoiceResponse> => {
        const response = await api.post<NormalizeInvoiceResponse>(
            `/invoices/${id}/normalize`,
            invoice_sub_category
                ? {
                    invoice_sub_category,
                }
                : {}
        );

        return response.data;
    },
    updateInvoice: async ({
                              id,
                              payload,
                              pdfFile,
                          }: UpdateInvoiceSubmission) => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }

            if (typeof value === "object") {
                formData.append(key, JSON.stringify(value));
                return;
            }

            formData.append(key, String(value));
        });

        if (pdfFile) {
            formData.append("pdf_file", pdfFile);
        }

        const response = await api.put(`/invoices/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },
    attachInvoicePdf: async ({
                                 id,
                                 pdfFile,
                             }: AttachInvoicePdfPayload): Promise<AttachInvoicePdfResponse> => {
        const formData = new FormData();

        formData.append("pdf_file", pdfFile);

        const response = await api.post<AttachInvoicePdfResponse>(
            `/invoices/${id}/pdf`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },
};

