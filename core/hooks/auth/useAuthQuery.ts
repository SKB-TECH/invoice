"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/core/services/auth.service";
import type {
    AuthChangePasswordPayload,
    AuthUpdateProfilePayload,
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

export function useAuthProfile() {
    return useQuery({
        queryKey: ["auth", "profile"],
        queryFn: () => authService.getProfile(),
        staleTime: 60 * 1000,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AuthUpdateProfilePayload) =>
            authService.updateProfile(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ["auth", "profile"],
            });
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (payload: AuthChangePasswordPayload) =>
            authService.changePassword(payload),
    });
}
