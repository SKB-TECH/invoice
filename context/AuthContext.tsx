"use client";

import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { AuthUser, Permission } from "@/core/types/rbac";
import { authEvents } from "@/core/utils/authEvents";
import { authService } from "@/core/services/auth.service";
import { mfaStore } from "@/core/utils/mfaStore";
import {
    useAuthSession,
    useLogin,
    useLogout,
} from "@/core/hooks/auth/useAuthQuery";

type ApiProfile = Record<string, unknown>;

type ApiPermission = {
    LongCode_10?: string;
    ShortCode_11?: string;
    longCode?: string;
    shortCode?: string;
};

type ApiRole = {
    id: string;
    name: string;
    desc?: string;
    permissions?: ApiPermission[];
};

type ApiBranch = {
    id: string;
    code: string;
    name: string;
    city?: string | null;
    address?: string | null;
};

export type AuthSession = {
    token: string;
    user: AuthUser;
    profile: ApiProfile | null;
    role: ApiRole | null;
    branch: ApiBranch | null;
    till: unknown | null;
    raw: unknown;
};

type LoginMfaResponse = {
    token: null;
    user: null;
    raw?: unknown;
    mfaRequired: true;
    challengeId: string;
    resendIn?: number;
    expiresIn?: number;
};

type LoginSuccessResponse = {
    token: string;
    user: AuthUser;
    profile?: ApiProfile | null;
    role?: ApiRole | null;
    branch?: ApiBranch | null;
    till?: unknown | null;
    raw?: unknown;
    expiresIn?: number;
    mfaRequired?: false;
};

type LoginResponse = LoginSuccessResponse | LoginMfaResponse;

function isMfaResponse(response: LoginResponse): response is LoginMfaResponse {
    return response.mfaRequired === true;
}

function isSuccessResponse(
    response: LoginResponse
): response is LoginSuccessResponse {
    return typeof response.token === "string" && !!response.user;
}

function normalizePermission(value?: string | null): string[] {
    if (!value) return [];

    return [value, value.replaceAll(".", ":"), value.replaceAll(":", ".")];
}

interface AuthContextType {
    user: AuthUser | null;
    profile: ApiProfile | null;
    role: ApiRole | null;
    branch: ApiBranch | null;
    till: unknown | null;
    token: string | null;
    raw: unknown;
    loading: boolean;
    isAuthenticated: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasAllPermissions: (permissions: Permission[]) => boolean;
    isRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const sessionQuery = useAuthSession();
    const loginMutation = useLogin();
    const logoutMutation = useLogout();

    const session = sessionQuery.data as AuthSession | null | undefined;

    const user = session?.user ?? null;
    const token = session?.token ?? null;
    const profile = session?.profile ?? null;
    const role = session?.role ?? null;
    const branch = session?.branch ?? null;
    const till = session?.till ?? null;
    const raw = session?.raw ?? null;

    useEffect(() => {
        return authEvents.onLogout(() => {
            authService.clearSession();
            queryClient.setQueryData(["auth", "session"], null);
        });
    }, [queryClient]);

    const permissions = useMemo(() => {
        const authUser = user as
            | (AuthUser & {
            permissions?: string[];
            role?: {
                name?: string;
                permissions?: ApiPermission[];
            };
        })
            | null;

        const userPermissions = Array.isArray(authUser?.permissions)
            ? authUser.permissions.flatMap((permission) =>
                normalizePermission(permission)
            )
            : [];

        const userRolePermissions = Array.isArray(
            authUser?.role?.permissions
        )
            ? authUser.role.permissions.flatMap((item) => [
                ...normalizePermission(item.longCode),
                ...normalizePermission(item.shortCode),
                ...normalizePermission(item.LongCode_10),
                ...normalizePermission(item.ShortCode_11),
            ])
            : [];

        const sessionRolePermissions = Array.isArray(role?.permissions)
            ? role.permissions.flatMap((item) => [
                ...normalizePermission(item.longCode),
                ...normalizePermission(item.shortCode),
                ...normalizePermission(item.LongCode_10),
                ...normalizePermission(item.ShortCode_11),
            ])
            : [];

        return Array.from(
            new Set([
                ...userPermissions,
                ...userRolePermissions,
                ...sessionRolePermissions,
            ])
        ) as Permission[];
    }, [user, role]);

    const hasSuperPermission = useMemo(() => {
        return (
            permissions.includes("all.all.all" as Permission) ||
            permissions.includes("all:all" as Permission) ||
            permissions.includes("*" as Permission)
        );
    }, [permissions]);

    const hasPermission = (permission: Permission) => {
        if (hasSuperPermission) return true;

        return normalizePermission(permission as string).some((code) =>
            permissions.includes(code as Permission)
        );
    };

    const hasAnyPermission = (items: Permission[]) => {
        if (!items?.length) return true;
        if (hasSuperPermission) return true;

        return items.some((permission) => hasPermission(permission));
    };

    const hasAllPermissions = (items: Permission[]) => {
        if (!items?.length) return true;
        if (hasSuperPermission) return true;

        return items.every((permission) => hasPermission(permission));
    };

    const isRole = (roleName: string) => {
        const authUser = user as
            | (AuthUser & {
            role?: {
                name?: string;
            };
        })
            | null;

        return (
            authUser?.role?.name?.toLowerCase() === roleName.toLowerCase() ||
            role?.name?.toLowerCase() === roleName.toLowerCase()
        );
    };

    const login = async (identifier: string, password: string) => {
        const res = (await loginMutation.mutateAsync({
            identifier,
            password,
        })) as LoginResponse;

        if (isMfaResponse(res)) {
            if (res.challengeId) {
                mfaStore.set(
                    res.challengeId,
                    res.resendIn ?? 60,
                    res.expiresIn ?? 300
                );
            }

            queryClient.setQueryData(["auth", "session"], null);
            return;
        }

        if (isSuccessResponse(res)) {
            const nextSession: AuthSession = {
                token: res.token,
                user: res.user,
                profile: res.profile ?? null,
                role: res.role ?? null,
                branch: res.branch ?? null,
                till: res.till ?? null,
                raw: res.raw ?? res,
            };

            authService.saveSession(
                nextSession.token,
                nextSession.user,
                res.expiresIn
            );

            queryClient.setQueryData(["auth", "session"], nextSession);
        }
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();

        authService.clearSession();
        queryClient.setQueryData(["auth", "session"], null);

        if (typeof window !== "undefined") {
            window.location.replace("/sign-in");
        }
    };

    const value: AuthContextType = {
        user,
        profile,
        role,
        branch,
        till,
        token,
        raw,
        loading: sessionQuery.isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth doit être utilisé dans AuthProvider");
    }

    return context;
}
