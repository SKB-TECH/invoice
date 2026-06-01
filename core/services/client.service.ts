import { api } from "@/core/services/api";
import {
    clientResponseSchema,
    paginatedClientsSchema,
    type CreateClientInput,
} from "@/core/schemas/client.schema";
import { unwrapApiData } from "@/core/utils/apiResponse";
import { z } from "zod";

const CLIENTS_PATH = "/invoices/clients";

export type ListClientsParams = {
    page?: number;
    per_page?: number;
    business_sector?: string;
};

export type ClientsListResult = {
    items: z.infer<typeof clientResponseSchema>[];
    meta?: z.infer<typeof paginatedClientsSchema>["meta"];
};

/** Corps POST/PUT selon le contrat API par type de client. */
export function clientPayloadForApi(input: CreateClientInput): Record<string, unknown> {
    const idnat = input.reference.trim();
    const phone = (input.phone ?? "").trim();
    const email = (input.email ?? "").trim();
    const client_name =
        input.company_name?.trim() ||
        `${input.first_name ?? ""} ${input.last_name ?? ""}`.trim();

    const payload: Record<string, unknown> = {
        client_name,
        client_type: input.client_type.trim(),
        idnat,
        phone,
        email,
    };

    const nif = (input.nif ?? "").trim();
    if (nif) payload.nif = nif;

    const rccm = (input.rccm ?? "").trim();
    if (rccm) payload.rccm = rccm;

    return payload;
}

function extractListItemsAndMeta(
    raw: unknown
): { items: unknown[]; meta: unknown } | null {
    if (Array.isArray(raw)) {
        return { items: raw, meta: undefined };
    }
    if (!raw || typeof raw !== "object") {
        return null;
    }

    const o = raw as Record<string, unknown>;

    if (Array.isArray(o.data)) {
        return { items: o.data, meta: o.meta };
    }
    if (Array.isArray(o.items)) {
        return { items: o.items, meta: o.meta };
    }
    if (Array.isArray(o.clients)) {
        return { items: o.clients, meta: o.meta };
    }

    const inner = o.data;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
        const d = inner as Record<string, unknown>;
        if (Array.isArray(d.data)) {
            return {
                items: d.data,
                meta: d.meta ?? {
                    current_page: d.current_page,
                    last_page: d.last_page,
                    per_page: d.per_page,
                    total: d.total,
                },
            };
        }
    }

    return null;
}

function parseClientsListPayload(raw: unknown): ClientsListResult {
    const direct = extractListItemsAndMeta(raw);
    if (direct) {
        const items = direct.items.map((row) => clientResponseSchema.parse(row));
        const metaParsed = z
            .object({
                current_page: z.number().optional(),
                last_page: z.number().optional(),
                per_page: z.number().optional(),
                total: z.number().optional(),
            })
            .passthrough()
            .safeParse(direct.meta);
        return {
            items,
            meta: metaParsed.success ? metaParsed.data : undefined,
        };
    }

    const pageParsed = paginatedClientsSchema.safeParse(raw);
    if (pageParsed.success) {
        return {
            items: pageParsed.data.data,
            meta: pageParsed.data.meta,
        };
    }

    const arr = z.array(z.unknown()).safeParse(raw);
    if (arr.success) {
        return {
            items: arr.data.map((row) => clientResponseSchema.parse(row)),
        };
    }

    const inner = unwrapApiData<unknown>(raw);
    if (inner !== raw) {
        return parseClientsListPayload(inner);
    }

    throw new Error("Format de liste clients inconnu.");
}

export const clientService = {
    async list(params?: ListClientsParams): Promise<ClientsListResult> {
        const res = await api.get(CLIENTS_PATH, {
            params: {
                page: params?.page,
                per_page: params?.per_page,
                business_sector: params?.business_sector,
            },
        });
        return parseClientsListPayload(res.data);
    },

    async getById(id: string): Promise<z.infer<typeof clientResponseSchema>> {
        const res = await api.get(`${CLIENTS_PATH}/${encodeURIComponent(id)}`);
        const raw = unwrapApiData<unknown>(res.data);
        return clientResponseSchema.parse(raw);
    },

    async create(input: CreateClientInput): Promise<z.infer<typeof clientResponseSchema>> {
        const res = await api.post(CLIENTS_PATH, clientPayloadForApi(input));
        const raw = unwrapApiData<unknown>(res.data);
        return clientResponseSchema.parse(raw);
    },

    async update(
        id: string,
        input: CreateClientInput
    ): Promise<z.infer<typeof clientResponseSchema>> {
        const res = await api.put(
            `${CLIENTS_PATH}/${encodeURIComponent(id)}`,
            clientPayloadForApi(input)
        );
        const raw = unwrapApiData<unknown>(res.data);
        return clientResponseSchema.parse(raw);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${CLIENTS_PATH}/${encodeURIComponent(id)}`);
    },
};
