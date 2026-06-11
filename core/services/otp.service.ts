import { publicApi } from "@/core/services/api";
import type {
    GenerateOtpPayload,
    GenerateOtpResponse,
    VerifyOtpPayload,
    VerifyOtpResponse,
} from "@/core/types/auth";

export const otpService = {
    async generateOtp(
        payload: GenerateOtpPayload
    ): Promise<GenerateOtpResponse> {
        const { data } = await publicApi.post<GenerateOtpResponse>(
            "/auth/otp/generate",
            payload
        );

        if (Number(data?.status) >= 400) {
            throw new Error(data?.message || "Impossible de générer l'OTP.");
        }

        return data;
    },

    async verifyOtp(
        payload: VerifyOtpPayload
    ): Promise<VerifyOtpResponse> {
        const { data } = await publicApi.post<VerifyOtpResponse>(
            "/auth/otp/verify",
            payload
        );

        if (Number(data?.status) >= 400) {
            throw new Error(data?.message || "Code OTP invalide.");
        }

        return data;
    },
};
