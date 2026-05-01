export type Permission = string;

export interface RolePermission {
    id: string;
    module: string;
    resource: string;
    action: string;
    longCode: string;
    shortCode: string;
    description?: string;
}

export interface Role {
    id: string;
    name: string;
    desc?: string;
    permissions: RolePermission[];
}


export interface AuthUserBranch {
    id: string;
    code: string;
    name: string;
    address?: string | null;
    city?: string | null;
}

export interface AuthUser {
    id: string;
    username: string;
    name: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    roleId?: string;
    role: Role;
    permissions: Permission[];
    photo?: string | null;
    branch?: AuthUserBranch | null;
}
