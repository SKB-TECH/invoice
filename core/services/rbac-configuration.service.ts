import { api } from "@/core/services/api";
import { unwrapApiData } from "@/core/utils/apiResponse";
import type { PermissionItem } from "@/core/types/permission";
import type { RoleItem } from "@/core/types/role";

const ROLES_PATH = "/invoices/roles";
const PERMISSIONS_PATH = "/invoices/permissions";

type UnknownRecord = Record<string, unknown>;

export type ListRolesParams = {
    page?: number;
    limit?: number;
    search?: string;
};

export type ListRolesResult = {
    data: RoleItem[];
    total: number;
};

export type ListPermissionsParams = {
    page?: number;
    limit?: number;
};

export type ListPermissionsResult = {
    data: PermissionItem[];
};

function readTotal(meta: unknown, fallback: number): number {
    if (!meta || typeof meta !== "object") return fallback;
    const m = meta as UnknownRecord;
    const keys = ["total", "Total", "count", "Count"] as const;
    for (const k of keys) {
        const t = m[k];
        if (typeof t === "number" && Number.isFinite(t)) return t;
        if (typeof t === "string" && t.trim() !== "") {
            const n = Number(t);
            if (Number.isFinite(n)) return n;
        }
    }
    return fallback;
}

function extractListRows(rawInput: unknown): { rows: unknown[]; total: number } | null {
    const tryParse = (raw: unknown): { rows: unknown[]; total: number } | null => {
        if (Array.isArray(raw))
            return { rows: raw, total: raw.length };

        if (!raw || typeof raw !== "object") return null;

        const o = raw as UnknownRecord;
        let items: unknown[] | undefined;
        let metaSource: UnknownRecord | unknown = o.meta ?? o.Meta;

        if (Array.isArray(o.data)) {
            items = o.data;
        } else if (Array.isArray(o.items)) {
            items = o.items;
            metaSource = o.meta ?? o.Meta ?? raw;
        } else if (
            o.data &&
            typeof o.data === "object" &&
            !Array.isArray(o.data)
        ) {
            const d = o.data as UnknownRecord;
            if (Array.isArray(d.items)) items = d.items;
            else if (Array.isArray(d.data)) items = d.data;
            if (items) metaSource = d.meta ?? o.meta ?? o.Meta;
        }

        if (items === undefined) return null;

        const total = readTotal(metaSource, items.length);
        return {
            rows: items,
            total: Number.isFinite(total) ? total : items.length,
        };
    };

    const direct = tryParse(rawInput);
    if (direct) return direct;

    const unwrapped = unwrapApiData<unknown>(rawInput);
    if (unwrapped !== rawInput) {
        return tryParse(unwrapped);
    }

    return null;
}

function parseRolesPayload(rawInput: unknown): ListRolesResult {
    const extracted = extractListRows(rawInput);
    if (!extracted) return { data: [], total: 0 };
    return {
        data: extracted.rows.map(normalizeRole),
        total: extracted.total,
    };
}

function normalizeRole(row: unknown): RoleItem {
    const o = row as UnknownRecord;
    const idRaw = o.Id_0 ?? o.id;
    return {
        Id_0: typeof idRaw === "number" ? idRaw : Number(idRaw ?? 0),
        Name_7: String(o.Name_7 ?? o.name ?? ""),
        Description_8: String(o.Description_8 ?? o.description ?? ""),
    };
}

function normalizePermission(row: unknown): PermissionItem {
    const o = row as UnknownRecord;
    const idRaw = o.Id_0 ?? o.id;
    const descRaw = o.Description_12 ?? o.description;
    return {
        Id_0: typeof idRaw === "number" ? idRaw : Number(idRaw ?? 0),
        Module_7: String(o.Module_7 ?? o.module ?? ""),
        Resource_8: String(o.Resource_8 ?? o.resource ?? ""),
        Action_9: String(o.Action_9 ?? o.action ?? ""),
        LongCode_10: String(o.LongCode_10 ?? o.longCode ?? ""),
        ...(descRaw !== undefined && descRaw !== null && String(descRaw) !== ""
            ? { Description_12: String(descRaw) }
            : {}),
    };
}

function parsePermissionsPayload(rawInput: unknown): ListPermissionsResult {
    const extracted = extractListRows(rawInput);
    if (!extracted) return { data: [] };
    return {
        data: extracted.rows.map(normalizePermission),
    };
}

export const rbacConfigurationService = {
    async fetchRoles(params: ListRolesParams = {}): Promise<ListRolesResult> {
        const res = await api.get(ROLES_PATH, {
            params: {
                page: params.page ?? 1,
                limit: params.limit,
                per_page: params.limit,
                search: params.search?.trim() || undefined,
            },
        });
        return parseRolesPayload(res.data);
    },

    async createRole(payload: { name: string; description: string }): Promise<void> {
        await api.post(ROLES_PATH, {
            name: payload.name,
            description: payload.description,
        });
    },

    async updateRole(payload: {
        id: number;
        name: string;
        description: string;
    }): Promise<void> {
        await api.put(
            `${ROLES_PATH}/${encodeURIComponent(String(payload.id))}`,
            {
                name: payload.name,
                description: payload.description,
            }
        );
    },

    async deleteRole(id: number): Promise<void> {
        await api.delete(`${ROLES_PATH}/${encodeURIComponent(String(id))}`);
    },

    async fetchPermissions(
        params: ListPermissionsParams = {}
    ): Promise<ListPermissionsResult> {
        const res = await api.get(PERMISSIONS_PATH, {
            params: {
                page: params.page ?? 1,
                limit: params.limit,
                per_page: params.limit,
            },
        });
        return parsePermissionsPayload(res.data);
    },

    async syncRolePermissions(payload: {
        roleId: number;
        permission_ids: number[];
    }): Promise<void> {
        await api.put(
            `${ROLES_PATH}/${encodeURIComponent(String(payload.roleId))}/permissions`,
            { permission_ids: payload.permission_ids }
        );
    },
};
