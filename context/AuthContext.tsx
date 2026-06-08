"use client";

import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { AuthUser, Permission, RolePermission } from "@/core/types/rbac";
import { authEvents } from "@/core/utils/authEvents";
import { authService } from "@/core/services/auth.service";
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
    refreshToken: string | null;
    user: AuthUser;
    profile: ApiProfile | null;
    role: ApiRole | null;
    branch: ApiBranch | null;
    till: unknown | null;
    raw: unknown;
};

type LoginSuccessResponse = {
    mfaRequired: false;
    token: string;
    refreshToken: string | null;
    user: AuthUser;
    profile: ApiProfile | null;
    role: ApiRole | null;
    branch: ApiBranch | null;
    till: unknown | null;
    expiresIn?: number;
    raw: unknown;
};

function normalizePermission(value?: string | null): string[] {
    if (!value) return [];

    return [value, value.replaceAll(".", ":"), value.replaceAll(":", ".")];
}

function isLoginSuccessResponse(
    response: unknown
): response is LoginSuccessResponse {
    if (!response || typeof response !== "object") return false;

    const data = response as Record<string, unknown>;

    return (
        data.mfaRequired === false &&
        typeof data.token === "string" &&
        !!data.user &&
        typeof data.user === "object"
    );
}

interface AuthContextType {
    user: AuthUser | null;
    profile: ApiProfile | null;
    role: ApiRole | null;
    branch: ApiBranch | null;
    till: unknown | null;
    token: string | null;
    refreshToken: string | null;
    raw: unknown;
    loading: boolean;
    isAuthenticated: boolean;
    login: (identifier: string, password: string) => Promise<AuthSession>;
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
    const refreshToken = session?.refreshToken ?? null;
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
                permissions?: (ApiPermission | RolePermission)[];
            };
        })
            | null;

        const userPermissions = Array.isArray(authUser?.permissions)
            ? authUser.permissions.flatMap((permission) =>
                normalizePermission(permission)
            )
            : [];

        const userRolePermissions = Array.isArray(authUser?.role?.permissions)
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

    const login = async (
        identifier: string,
        password: string
    ): Promise<AuthSession> => {
        const result = await loginMutation.mutateAsync({
            identifier,
            password,
        });

        const response = result && typeof result === "object" && "data" in result
            ? (result as { data: unknown }).data
            : result;

        if (!isLoginSuccessResponse(response)) {
            console.log("LOGIN RESPONSE INVALID:", response);
            throw new Error("Réponse de connexion invalide.");
        }

        const nextSession: AuthSession = {
            token: response.token,
            refreshToken: response.refreshToken ?? null,
            user: response.user,
            profile: response.profile ?? null,
            role: response.role ?? null,
            branch: response.branch ?? null,
            till: response.till ?? null,
            raw: response,
        };

        authService.saveSession(
            nextSession.token,
            nextSession.user,
            response.expiresIn,
            nextSession.refreshToken
        );

        queryClient.setQueryData(["auth", "session"], nextSession);

        return nextSession;
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();

        authService.clearSession();
        queryClient.setQueryData(["auth", "session"], null);

        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_refresh_token");
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
        refreshToken,
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
