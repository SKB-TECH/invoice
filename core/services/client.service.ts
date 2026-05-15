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

function parseClientsListPayload(raw: unknown): ClientsListResult {
    const pageParsed = paginatedClientsSchema.safeParse(raw);
    if (pageParsed.success) {
        return {
            items: pageParsed.data.data,
            meta: pageParsed.data.meta,
        };
    }

    const arr = z.array(clientResponseSchema).safeParse(raw);
    if (arr.success) {
        return { items: arr.data };
    }

    const inner = unwrapApiData<unknown>(raw);
    const retryPage = paginatedClientsSchema.safeParse(inner);
    if (retryPage.success) {
        return { items: retryPage.data.data, meta: retryPage.data.meta };
    }

    const retryArr = z.array(clientResponseSchema).safeParse(inner);
    if (retryArr.success) {
        return { items: retryArr.data };
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
