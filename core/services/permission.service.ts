import { api } from "@/core/services/api";
import type {
    CreatePermissionPayload,
    CreatePermissionResponse,
    GetPermissionsParams,
    GetPermissionsResponse,
} from "@/core/types/permission";

export const permissionService = {
    getPermissions: async (
        params?: GetPermissionsParams
    ): Promise<GetPermissionsResponse> => {
        const response = await api.get<GetPermissionsResponse>(
            "/main/permissions",
            {
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 50,
                    module: params?.module || undefined,
                },
            }
        );

        return response.data;
    },

    createPermission: async (
        payload: CreatePermissionPayload
    ): Promise<CreatePermissionResponse> => {
        const response = await api.post<CreatePermissionResponse>(
            "/main/permissions",
            payload
        );

        return response.data;
    },
};
