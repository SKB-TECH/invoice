import { api } from "@/core/services/api";
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
    GetRolesResponse,
    RemovePermissionFromRolePayload,
    RemovePermissionFromRoleResponse,
    SyncRolePermissionsPayload,
    SyncRolePermissionsResponse,
    UpdateRolePayload,
    UpdateRoleResponse,
} from "@/core/types/role";

export const roleService = {
    getRoles: async (
        params?: GetRolesParams
    ): Promise<GetRolesResponse> => {
        const response = await api.get<GetRolesResponse>("/main/roles", {
            params: {
                page: params?.page ?? 1,
                limit: params?.limit ?? 20,
                search: params?.search || undefined,
            },
        });

        return response.data;
    },

    createRole: async (
        payload: CreateRolePayload
    ): Promise<CreateRoleResponse> => {
        const response = await api.post<CreateRoleResponse>(
            "/main/roles",
            payload
        );

        return response.data;
    },

    updateRole: async ({
                           id,
                           ...payload
                       }: UpdateRolePayload): Promise<UpdateRoleResponse> => {
        const response = await api.put<UpdateRoleResponse>(
            `/main/roles/${id}`,
            payload
        );

        return response.data;
    },

    deleteRole: async ({
                           id,
                       }: DeleteRolePayload): Promise<DeleteRoleResponse> => {
        const response = await api.delete<DeleteRoleResponse>(
            `/main/roles/${id}`
        );

        return response.data;
    },

    assignPermissionToRole: async ({
                                       roleId,
                                       permission_id,
                                   }: AssignPermissionToRolePayload): Promise<AssignPermissionToRoleResponse> => {
        const response = await api.post<AssignPermissionToRoleResponse>(
            `/main/roles/${roleId}/permissions`,
            {
                permission_id,
            }
        );

        return response.data;
    },

    addPermissionsToRole: async ({
                                     roleId,
                                     permission_ids,
                                 }: AddPermissionsToRolePayload): Promise<AddPermissionsToRoleResponse> => {
        const response = await api.post<AddPermissionsToRoleResponse>(
            `/main/roles/${roleId}/permissions/batch`,
            {
                permission_ids,
            }
        );

        return response.data;
    },

    syncRolePermissions: async ({
                                    roleId,
                                    permission_ids,
                                }: SyncRolePermissionsPayload): Promise<SyncRolePermissionsResponse> => {
        const response = await api.put<SyncRolePermissionsResponse>(
            `/main/roles/${roleId}/permissions/sync`,
            {
                permission_ids,
            }
        );

        return response.data;
    },

    removePermissionFromRole: async ({
                                         roleId,
                                         permissionId,
                                     }: RemovePermissionFromRolePayload): Promise<RemovePermissionFromRoleResponse> => {
        const response = await api.delete<RemovePermissionFromRoleResponse>(
            `/main/roles/${roleId}/permissions/${permissionId}`
        );

        return response.data;
    },
};
