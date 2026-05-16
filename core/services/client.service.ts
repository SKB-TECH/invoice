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

/**
 * Corps attendu par l’API (ex. client_name, legal_name, …) — ne pas envoyer
 * company_name / reference si le backend valide strictement ce contrat.
 */
export function clientPayloadForApi(input: CreateClientInput): Record<string, unknown> {
    const phone = (input.phone ?? "").trim();
    const email = (input.email ?? "").trim();
    const nif = (input.nif ?? "").trim();

    let client_name: string;
    let legal_name: string;
    let rccm: string;
    let business_sector: string;

    switch (input.client_type) {
        case "personal": {
            client_name = `${input.first_name} ${input.last_name}`.trim();
            legal_name = client_name;
            rccm = (input.rccm ?? "").trim();
            business_sector = (input.business_sector ?? "").trim();
            break;
        }
        case "pme":
        case "corporate": {
            const denomination = input.company_name.trim();
            client_name = denomination;
            legal_name = denomination;
            rccm = input.rccm.trim();
            business_sector = input.business_sector.trim();
            break;
        }
        default: {
            const _exhaustive: never = input;
            return _exhaustive;
        }
    }

    return {
        client_name,
        legal_name,
        client_type: input.client_type,
        nif,
        rccm,
        business_sector,
        phone,
        email,
    };
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
