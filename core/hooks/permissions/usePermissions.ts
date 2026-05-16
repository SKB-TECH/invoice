import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { permissionService } from "@/core/services/permission.service";
import type {
    CreatePermissionPayload,
    CreatePermissionResponse,
    GetPermissionsParams,
} from "@/core/types/permission";

export function usePermissions(params?: GetPermissionsParams) {
    return useQuery({
        queryKey: ["permissions", params],
        queryFn: () => permissionService.getPermissions(params),
        retry: false,
    });
}

type UseCreatePermissionOptions = {
    onSuccess?: (
        data: CreatePermissionResponse,
        variables: CreatePermissionPayload
    ) => void;
    onError?: (error: unknown) => void;
};

export function useCreatePermission(
    options?: UseCreatePermissionOptions
) {
    const queryClient = useQueryClient();

    return useMutation<
        CreatePermissionResponse,
        unknown,
        CreatePermissionPayload
    >({
        mutationFn: permissionService.createPermission,

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["permissions"],
            });

            options?.onSuccess?.(data, variables);
        },

        onError: options?.onError,
    });
}
