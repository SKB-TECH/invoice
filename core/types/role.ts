export type RoleItem = {
    Id_0: number;
    Name_7: string;
    Description_8: string;
};

export type GetRolesParams = {
    page?: number;
    limit?: number;
    search?: string;
};

export type GetRolesResponse = {
    status: "success" | string;
    data: RoleItem[];
    total: number;
    page: number;
    limit: number;
};

export type CreateRolePayload = {
    name: string;
    description: string;
};

export type CreateRoleResponse = {
    status: "success" | string;
    message?: string;
    data?: RoleItem;
};

export type UpdateRolePayload = {
    id: number;
    name: string;
    description: string;
};

export type UpdateRoleResponse = {
    status: "success" | string;
    message?: string;
    data?: RoleItem;
};

export type DeleteRolePayload = {
    id: number;
};

export type DeleteRoleResponse = {
    status: "success" | string;
    message: string;
};

/* ==========================================
   Permissions liées à un rôle
========================================== */

export type AssignPermissionToRolePayload = {
    roleId: number;
    permission_id: number;
};

export type AssignPermissionToRoleResponse = {
    status: "success" | string;
    message?: string;
};

export type AddPermissionsToRolePayload = {
    roleId: number;
    permission_ids: number[];
};

export type AddPermissionsToRoleResponse = {
    status: "success" | string;
    message?: string;
};

export type SyncRolePermissionsPayload = {
    roleId: number;
    permission_ids: number[];
};

export type SyncRolePermissionsResponse = {
    status: "success" | string;
    message?: string;
};

export type RemovePermissionFromRolePayload = {
    roleId: number;
    permissionId: number;
};

export type RemovePermissionFromRoleResponse = {
    status: "success" | string;
    message?: string;
};
