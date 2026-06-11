import { api } from "@/core/services/api";
import {
    clientTypeOptionSchema,
    type ClientTypeOption,
} from "@/core/schemas/type-client.schema";
import { unwrapApiData } from "@/core/utils/apiResponse";

const CLIENT_TYPES_PATH = "/invoices/client-types";

function extractClientTypeRows(raw: unknown): unknown[] | null {
    if (Array.isArray(raw)) {
        return raw;
    }

    if (!raw || typeof raw !== "object") {
        return null;
    }

    const o = raw as Record<string, unknown>;

    for (const key of ["data", "items", "client_types", "types"] as const) {
        const value = o[key];
        if (Array.isArray(value)) {
            return value;
        }
    }

    const inner = o.data;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
        const nested = inner as Record<string, unknown>;
        if (Array.isArray(nested.data)) {
            return nested.data;
        }
    }

    return null;
}

function parseClientTypesPayload(raw: unknown): ClientTypeOption[] {
    const shells = [raw, unwrapApiData<unknown>(raw)];

    for (const shell of shells) {
        const rows = extractClientTypeRows(shell);
        if (!rows) continue;

        return rows
            .map((row) => clientTypeOptionSchema.parse(row))
            .sort((a, b) => {
                const sortA = a.sort ?? Number.MAX_SAFE_INTEGER;
                const sortB = b.sort ?? Number.MAX_SAFE_INTEGER;
                if (sortA !== sortB) return sortA - sortB;
                return a.title.localeCompare(b.title, "fr", {
                    sensitivity: "base",
                });
            });
    }

    const inner = unwrapApiData<unknown>(raw);
    if (inner !== raw) {
        return parseClientTypesPayload(inner);
    }

    throw new Error("Format de liste des types client inconnu.");
}

export const typeClientService = {
    async list(): Promise<ClientTypeOption[]> {
        const res = await api.get(CLIENT_TYPES_PATH);
        const items = parseClientTypesPayload(res.data);
        return items;
    },
};

export type { ClientTypeOption };
