"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/core/services/auth.service";
import type {
    AuthChangePasswordPayload,
    LoginPayload,
} from "@/core/types/auth";

export function useAuthSession() {
    return useQuery({
        queryKey: ["auth", "session"],
        queryFn: () => authService.restoreSession(),
        staleTime: Infinity,
        retry: false,
    });
}

export function useLogin() {
    return useMutation({
        mutationFn: ({ identifier, password }: LoginPayload) =>
            authService.login(identifier, password),
    });
}

export function useLogout() {
    return useMutation({
        mutationFn: () => authService.logout(),
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (payload: AuthChangePasswordPayload) =>
            authService.changePassword(payload),
    });
}
