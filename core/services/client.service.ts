import { api } from "@/core/services/api";
import {
    clientResponseSchema,
    paginatedClientsSchema,
    parseCountryForApi,
    statusFormToApi,
    type CreateClientInput,
} from "@/core/schemas/client.schema";
import {
    clientTypeRequiresField,
    getEffectiveRequiredFields,
    type ClientTypeOption,
} from "@/core/schemas/type-client.schema";
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

function appendIfPresent(
    payload: Record<string, unknown>,
    key: string,
    value: string | undefined
) {
    const trimmed = (value ?? "").trim();
    if (trimmed) {
        payload[key] = trimmed;
    }
}

/** Corps POST/PUT selon le contrat API (`client_type_id`, champs dynamiques). */
export function clientPayloadForApi(
    input: CreateClientInput,
    typeOption?: ClientTypeOption
): Record<string, unknown> {
    const client_type_id = Number(input.client_type_id);
    const required = getEffectiveRequiredFields(typeOption);

    const payload: Record<string, unknown> = {
        client_type_id,
        status: statusFormToApi(input.status ?? "actif"),
        client_name: input.client_name.trim(),
    };

    appendIfPresent(payload, "phone", input.phone ?? undefined);
    appendIfPresent(payload, "email", input.email ?? undefined);
    appendIfPresent(payload, "address", input.address ?? undefined);

    const country = parseCountryForApi(input.country);
    if (country !== undefined) {
        payload.country = country;
    }

    if (
        clientTypeRequiresField(required, "nif") ||
        (input.nif ?? "").trim()
    ) {
        appendIfPresent(payload, "nif", input.nif ?? undefined);
    }

    if (
        clientTypeRequiresField(required, "rccm") ||
        (input.rccm ?? "").trim()
    ) {
        appendIfPresent(payload, "rccm", input.rccm ?? undefined);
    }

    if (
        clientTypeRequiresField(required, "idnat", "reference") ||
        (input.reference ?? "").trim()
    ) {
        appendIfPresent(payload, "idnat", input.reference ?? undefined);
    }

    if (
        clientTypeRequiresField(required, "reference_document") ||
        (input.reference_document ?? "").trim()
    ) {
        appendIfPresent(
            payload,
            "reference_document",
            input.reference_document ?? undefined
        );
    }

    if (
        clientTypeRequiresField(
            required,
            "business_sector",
            "secteur",
            "secteur_activite"
        ) ||
        (input.business_sector ?? "").trim()
    ) {
        appendIfPresent(
            payload,
            "business_sector",
            input.business_sector ?? undefined
        );
    }

    if (
        clientTypeRequiresField(
            required,
            "legal_representative",
            "representant_legal"
        ) ||
        (input.legal_representative ?? "").trim()
    ) {
        appendIfPresent(
            payload,
            "legal_representative",
            input.legal_representative ?? undefined
        );
    }

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

    async create(
        input: CreateClientInput,
        typeOption?: ClientTypeOption
    ): Promise<z.infer<typeof clientResponseSchema>> {
        const res = await api.post(
            CLIENTS_PATH,
            clientPayloadForApi(input, typeOption)
        );
        const raw = unwrapApiData<unknown>(res.data);
        return clientResponseSchema.parse(raw);
    },

    async update(
        id: string,
        input: CreateClientInput,
        typeOption?: ClientTypeOption
    ): Promise<z.infer<typeof clientResponseSchema>> {
        const res = await api.put(
            `${CLIENTS_PATH}/${encodeURIComponent(id)}`,
            clientPayloadForApi(input, typeOption)
        );
        const raw = unwrapApiData<unknown>(res.data);
        return clientResponseSchema.parse(raw);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${CLIENTS_PATH}/${encodeURIComponent(id)}`);
    },
};
