"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    rbacConfigurationService,
    type ListRolesParams,
} from "@/core/services/rbac-configuration.service";

export const rolesQueryKeys = {
    all: ["roles"] as const,
    list: (params: ListRolesParams) =>
        [...rolesQueryKeys.all, "list", params] as const,
};

export function useRoles(params: ListRolesParams = {}) {
    return useQuery({
        queryKey: rolesQueryKeys.list(params),
        queryFn: () => rbacConfigurationService.fetchRoles(params),
    });
}

export function useCreateRole(options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: { name: string; description: string }) =>
            rbacConfigurationService.createRole(payload),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: rolesQueryKeys.all });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
}

export function useUpdateRole(options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            id: number;
            name: string;
            description: string;
        }) => rbacConfigurationService.updateRole(payload),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: rolesQueryKeys.all });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
}

export function useDeleteRole(options?: { onError?: (error: unknown) => void }) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: number }) =>
            rbacConfigurationService.deleteRole(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: rolesQueryKeys.all });
        },
        onError: options?.onError,
    });
}

export function useSyncRolePermissions(options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            roleId: number;
            permission_ids: number[];
        }) => rbacConfigurationService.syncRolePermissions(payload),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: rolesQueryKeys.all });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
}
