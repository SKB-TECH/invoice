'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/core/services/auth.service';

export function useAuthSession() {
    return useQuery({
        queryKey: ['auth', 'session'],
        queryFn: async () => authService.restoreSession(),
        staleTime: Infinity,
        retry: false,
    });
}

export function useLogin() {
    return useMutation({
        mutationFn: (payload: { login: string; password: string }) =>
            authService.login(payload.login, payload.password),
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),

        onSuccess: () => {
            queryClient.setQueryData(['auth', 'session'], null);
            queryClient.invalidateQueries();
        },
    });
}
