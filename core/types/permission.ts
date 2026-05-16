export type PermissionItem = {
    Id_0: number;
    Module_7: string;
    Resource_8: string;
    Action_9: string;
    LongCode_10: string;
    Description_12?:string
};

export type GetPermissionsParams = {
    page?: number;
    limit?: number;
    module?: string;
};

export type GetPermissionsResponse = {
    status: "success" | string;
    data: PermissionItem[];
    total: number;
    page?: number;
    limit?: number;
};

export type CreatePermissionPayload = {
    module: string;
    resource: string;
    action: string;
    description: string;
};

export type CreatePermissionResponse = {
    status: "success" | string;
    message?: string;
    data?: PermissionItem;
};
