"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    PAYMENT_CHANNEL_REFERENTIAL_AXIS,
    PAYMENT_METHOD_REFERENTIAL_AXIS,
} from "@/core/constants/paymentReferentials";
import type {
    CreatePaymentPayload,
    GetPaymentsParams,
} from "@/core/schemas/payment.schema";
import { paymentService } from "@/core/services/payment.service";
import { fetchAllReferentiels } from "@/core/services/referentiels.service";

export function usePayments(params?: GetPaymentsParams) {
    return useQuery({
        queryKey: ["payments", params],
        queryFn: () => paymentService.getPayments(params),
        retry: false,
    });
}

export function usePaymentChannelReferentials() {
    return useQuery({
        queryKey: [
            "referentiels",
            "payment-channel",
            PAYMENT_CHANNEL_REFERENTIAL_AXIS,
        ],
        queryFn: () =>
            fetchAllReferentiels({
                axe: PAYMENT_CHANNEL_REFERENTIAL_AXIS,
                perPage: 200,
            }),
        staleTime: 60_000,
        retry: false,
    });
}

export function usePaymentMethodReferentials() {
    return useQuery({
        queryKey: [
            "referentiels",
            "payment-method",
            PAYMENT_METHOD_REFERENTIAL_AXIS,
        ],
        queryFn: () =>
            fetchAllReferentiels({
                axe: PAYMENT_METHOD_REFERENTIAL_AXIS,
                perPage: 200,
            }),
        staleTime: 60_000,
        retry: false,
    });
}

type UseCreatePaymentOptions = {
    onSuccess?: (data: unknown, variables: CreatePaymentPayload) => void;
    onError?: (error: unknown) => void;
};

export function useCreatePayment(options?: UseCreatePaymentOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePaymentPayload) =>
            paymentService.createPayment(payload),

        onSuccess: (data, variables) => {
            void queryClient.invalidateQueries({ queryKey: ["payments"] });
            void queryClient.invalidateQueries({ queryKey: ["invoices"] });
            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}
