import {
    createPaymentPayloadSchema,
    parsePagedPayments,
    type CreatePaymentPayload,
    type GetPaymentsParams,
    type PaymentsPageResult,
} from "@/core/schemas/payment.schema";
import { api } from "@/core/services/api";

const PAYMENTS_PATH = "/invoices/payments";

export const paymentService = {
    async getPayments(
        params?: GetPaymentsParams
    ): Promise<PaymentsPageResult> {
        const res = await api.get(PAYMENTS_PATH, {
            params: {
                page: params?.page,
                perPage: params?.perPage,
            },
        });

        return parsePagedPayments(res.data);
    },

    async createPayment(payload: CreatePaymentPayload): Promise<unknown> {
        const body = createPaymentPayloadSchema.parse(payload);
        const formData = new FormData();

        formData.append("invoice_id", String(body.invoice_id));
        formData.append("client_id", String(body.client_id));
        formData.append("amount", String(body.amount));
        formData.append("currency", body.currency);
        formData.append("channel_id", String(body.channel_id));
        formData.append(
            "cash_info",
            JSON.stringify(body.cash_info)
        );
        formData.append("contract_id", String(body.contract_id));
        formData.append("method_id", String(body.method_id));
        formData.append("exchange_rate", String(body.exchange_rate));

        const res = await api.post(PAYMENTS_PATH, formData);
        return res.data;
    },
};
