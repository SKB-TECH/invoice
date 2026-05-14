"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/core/services/auth.service";
import type {
    RegisterPayload,
    RegisterResponse,
} from "@/core/types/auth";

type UseRegisterOptions = {
    onSuccess?: (
        data: RegisterResponse,
        variables: RegisterPayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useRegister(options?: UseRegisterOptions) {
    return useMutation<RegisterResponse, unknown, RegisterPayload>({
        mutationFn: authService.register,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });
}
