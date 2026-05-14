"use client";

import { useMutation } from "@tanstack/react-query";
import { otpService } from "@/core/services/otp.service";
import type {
    GenerateOtpPayload,
    GenerateOtpResponse,
    VerifyOtpPayload,
    VerifyOtpResponse,
} from "@/core/types/auth";

type UseGenerateOtpOptions = {
    onSuccess?: (
        data: GenerateOtpResponse,
        variables: GenerateOtpPayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useGenerateOtp(options?: UseGenerateOtpOptions) {
    return useMutation<
        GenerateOtpResponse,
        unknown,
        GenerateOtpPayload
    >({
        mutationFn: otpService.generateOtp,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });
}

type UseVerifyOtpOptions = {
    onSuccess?: (
        data: VerifyOtpResponse,
        variables: VerifyOtpPayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useVerifyOtp(options?: UseVerifyOtpOptions) {
    return useMutation<VerifyOtpResponse, unknown, VerifyOtpPayload>({
        mutationFn: otpService.verifyOtp,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });
}
