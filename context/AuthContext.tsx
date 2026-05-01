'use client';

import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { authEvents } from '@/core/utils/authEvents';
import { authService } from '@/core/services/auth.service';
import { mfaStore } from '@/core/utils/mfaStore';
import {
    useAuthSession,
    useLogin,
    useLogout,
} from '@/core/hooks/auth/useAuthQuery';

import type { AuthUser } from '@/core/types/rbac';

interface MfaResponse {
    code: 'MFA_REQUIRED';
    challenge_id: string;
    resend_in: number;
    expires_in: number;
}

interface LoginSuccessResponse {
    token: string;
    user: AuthUser;
}

type LoginResponse = LoginSuccessResponse | MfaResponse;

function isMfaResponse(response: LoginResponse): response is MfaResponse {
    return 'code' in response && response.code === 'MFA_REQUIRED';
}

function isSuccessResponse(
    response: LoginResponse
): response is LoginSuccessResponse {
    return 'token' in response && typeof response.token === 'string';
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (login: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const sessionQuery = useAuthSession();
    const loginMutation = useLogin();
    const logoutMutation = useLogout();

    const session = sessionQuery.data;

    const user = session?.user ?? null;
    const token = session?.token ?? null;

    useEffect(() => {
        return authEvents.onLogout(() => {
            authService.clearSession();
            queryClient.setQueryData(['auth', 'session'], null);
        });
    }, [queryClient]);

    const login = async (login: string, password: string) => {
        const response = (await loginMutation.mutateAsync({
            login,
            password,
        })) as LoginResponse;

        if (isMfaResponse(response) && response.challenge_id) {
            mfaStore.set(
                response.challenge_id,
                response.resend_in,
                response.expires_in
            );

            queryClient.setQueryData(['auth', 'session'], null);
            return;
        }

        if (isSuccessResponse(response) && response.token) {
            authService.saveSession(response.token, response.user);

            queryClient.setQueryData(['auth', 'session'], {
                token: response.token,
                user: response.user,
            });
        }
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading: sessionQuery.isLoading,
                isAuthenticated: Boolean(user && token),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth doit être utilisé dans AuthProvider');
    }

    return context;
}
