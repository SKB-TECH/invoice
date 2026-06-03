import { api } from "@/core/services/api";
import {
    clientResponseSchema,
    paginatedClientsSchema,
    parseCountryForApi,
    statusFormToApi,
    type CreateClientInput,
} from "@/core/schemas/client.schema";
import {
    type ClientTypeOption,
} from "@/core/schemas/type-client.schema";
import { unwrapApiData } from "@/core/utils/apiResponse";
import { z } from "zod";

const CLIENTS_PATH = "/invoices/clients";

export type ListClientsParams = {
    page?: number;
    per_page?: number;
    name?: string;
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

function appendClientFields(fd: FormData, payload: Record<string, unknown>) {
    for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || value === null) continue;
        if (value instanceof File) {
            fd.append(key, value);
            continue;
        }
        fd.append(key, String(value));
    }
}

function clientPayloadToFormData(
    payload: Record<string, unknown>
): FormData {
    const fd = new FormData();
    appendClientFields(fd, payload);
    return fd;
}

/** Corps POST/PUT selon le contrat API (`client_type_id`, champs dynamiques). */
export function clientPayloadForApi(
    input: CreateClientInput,
    _typeOption?: ClientTypeOption,
    referenceDocumentFile?: File | null
): Record<string, unknown> {
    const client_type_id = Number(input.client_type_id);
    const clientName = input.client_name.trim();

    const payload: Record<string, unknown> = {
        client_type_id,
        status: statusFormToApi(input.status ?? "actif"),
        client_name: clientName,
    };

    appendIfPresent(payload, "phone", input.phone ?? undefined);
    appendIfPresent(payload, "email", input.email ?? undefined);
    appendIfPresent(payload, "address", input.address ?? undefined);

    const country = parseCountryForApi(input.country);
    if (country !== undefined) {
        payload.country = country;
    }

    // Payload strict par type (demande métier)
    if (client_type_id === 1) {
        return payload;
    }

    if (client_type_id === 2) {
        appendIfPresent(payload, "nif", input.nif ?? undefined);
        appendIfPresent(payload, "rccm", input.rccm ?? undefined);
        appendIfPresent(payload, "idnat", input.idnat ?? undefined);
        appendIfPresent(
            payload,
            "business_sector",
            input.business_sector ?? undefined
        );
        appendIfPresent(
            payload,
            "legal_representative",
            input.legal_representative ?? undefined
        );
        return payload;
    }

    if (client_type_id === 3) {
        appendIfPresent(payload, "nif", input.nif ?? undefined);
        appendIfPresent(payload, "rccm", input.rccm ?? undefined);
        appendIfPresent(payload, "idnat", input.idnat ?? undefined);
        appendIfPresent(
            payload,
            "business_sector",
            input.business_sector ?? undefined
        );
        return payload;
    }

    if (client_type_id === 4) {
        appendIfPresent(payload, "nif", input.nif ?? undefined);
        appendIfPresent(payload, "idnat", input.idnat ?? undefined);
        appendIfPresent(
            payload,
            "business_sector",
            input.business_sector ?? undefined
        );
        appendIfPresent(
            payload,
            "legal_representative",
            input.legal_representative ?? undefined
        );
        return payload;
    }

    if (client_type_id === 5) {
        if (referenceDocumentFile instanceof File) {
            payload.reference_document = referenceDocumentFile;
        } else {
            appendIfPresent(
                payload,
                "reference_document",
                input.reference_document ?? undefined
            );
        }
        return payload;
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
                name: params?.name,
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
        typeOption?: ClientTypeOption,
        referenceDocumentFile?: File | null
    ): Promise<z.infer<typeof clientResponseSchema>> {
        const payload = clientPayloadForApi(
            input,
            typeOption,
            referenceDocumentFile
        );
        const res = await api.post(
            CLIENTS_PATH,
            clientPayloadToFormData(payload)
        );
        const raw = unwrapApiData<unknown>(res.data);
        return clientResponseSchema.parse(raw);
    },

    async update(
        id: string,
        input: CreateClientInput,
        typeOption?: ClientTypeOption,
        referenceDocumentFile?: File | null
    ): Promise<z.infer<typeof clientResponseSchema>> {
        const payload = clientPayloadForApi(
            input,
            typeOption,
            referenceDocumentFile
        );
        const endpoint = `${CLIENTS_PATH}/${encodeURIComponent(id)}`;
        const hasFile = referenceDocumentFile instanceof File;
        const res = hasFile
            ? await api.put(endpoint, clientPayloadToFormData(payload))
            : await api.put(endpoint, payload);
        const raw = unwrapApiData<unknown>(res.data);
        return clientResponseSchema.parse(raw);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${CLIENTS_PATH}/${encodeURIComponent(id)}`);
    },
};
