import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { roleService } from "@/core/services/role.service";
import type {
    AddPermissionsToRolePayload,
    AddPermissionsToRoleResponse,
    AssignPermissionToRolePayload,
    AssignPermissionToRoleResponse,
    CreateRolePayload,
    CreateRoleResponse,
    DeleteRolePayload,
    DeleteRoleResponse,
    GetRolesParams,
    RemovePermissionFromRolePayload,
    RemovePermissionFromRoleResponse,
    SyncRolePermissionsPayload,
    SyncRolePermissionsResponse,
    UpdateRolePayload,
    UpdateRoleResponse,
} from "@/core/types/role";

export function useRoles(params?: GetRolesParams) {
    return useQuery({
        queryKey: ["roles", params],
        queryFn: () => roleService.getRoles(params),
        retry: false,
    });
}

/* ==========================================
   Création rôle
========================================== */

type UseCreateRoleOptions = {
    onSuccess?: (
        data: CreateRoleResponse,
        variables: CreateRolePayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useCreateRole(options?: UseCreateRoleOptions) {
    const queryClient = useQueryClient();

    return useMutation<
        CreateRoleResponse,
        unknown,
        CreateRolePayload
    >({
        mutationFn: roleService.createRole,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}

/* ==========================================
   Modification rôle
========================================== */

type UseUpdateRoleOptions = {
    onSuccess?: (
        data: UpdateRoleResponse,
        variables: UpdateRolePayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useUpdateRole(options?: UseUpdateRoleOptions) {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateRoleResponse,
        unknown,
        UpdateRolePayload
    >({
        mutationFn: roleService.updateRole,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}

/* ==========================================
   Suppression rôle
========================================== */

type UseDeleteRoleOptions = {
    onSuccess?: (
        data: DeleteRoleResponse,
        variables: DeleteRolePayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useDeleteRole(options?: UseDeleteRoleOptions) {
    const queryClient = useQueryClient();

    return useMutation<
        DeleteRoleResponse,
        unknown,
        DeleteRolePayload
    >({
        mutationFn: roleService.deleteRole,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}

/* ==========================================
   Assigner une seule permission
========================================== */

type UseAssignPermissionToRoleOptions = {
    onSuccess?: (
        data: AssignPermissionToRoleResponse,
        variables: AssignPermissionToRolePayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useAssignPermissionToRole(
    options?: UseAssignPermissionToRoleOptions
) {
    const queryClient = useQueryClient();

    return useMutation<
        AssignPermissionToRoleResponse,
        unknown,
        AssignPermissionToRolePayload
    >({
        mutationFn: roleService.assignPermissionToRole,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });

            queryClient.invalidateQueries({
                queryKey: ["permissions"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}

/* ==========================================
   Ajouter plusieurs permissions
========================================== */

type UseAddPermissionsToRoleOptions = {
    onSuccess?: (
        data: AddPermissionsToRoleResponse,
        variables: AddPermissionsToRolePayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useAddPermissionsToRole(
    options?: UseAddPermissionsToRoleOptions
) {
    const queryClient = useQueryClient();

    return useMutation<
        AddPermissionsToRoleResponse,
        unknown,
        AddPermissionsToRolePayload
    >({
        mutationFn: roleService.addPermissionsToRole,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });

            queryClient.invalidateQueries({
                queryKey: ["permissions"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}

/* ==========================================
   Synchroniser toutes les permissions du rôle
========================================== */

type UseSyncRolePermissionsOptions = {
    onSuccess?: (
        data: SyncRolePermissionsResponse,
        variables: SyncRolePermissionsPayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useSyncRolePermissions(
    options?: UseSyncRolePermissionsOptions
) {
    const queryClient = useQueryClient();

    return useMutation<
        SyncRolePermissionsResponse,
        unknown,
        SyncRolePermissionsPayload
    >({
        mutationFn: roleService.syncRolePermissions,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });

            queryClient.invalidateQueries({
                queryKey: ["permissions"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}

type UseRemovePermissionFromRoleOptions = {
    onSuccess?: (
        data: RemovePermissionFromRoleResponse,
        variables: RemovePermissionFromRolePayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useRemovePermissionFromRole(
    options?: UseRemovePermissionFromRoleOptions
) {
    const queryClient = useQueryClient();

    return useMutation<
        RemovePermissionFromRoleResponse,
        unknown,
        RemovePermissionFromRolePayload
    >({
        mutationFn: roleService.removePermissionFromRole,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });

            queryClient.invalidateQueries({
                queryKey: ["permissions"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}
