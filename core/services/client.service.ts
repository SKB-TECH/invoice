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
    resolveClientTypeOption,
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

function resolveTypeOptionForPayload(
    input: CreateClientInput,
    typeOption?: ClientTypeOption
): ClientTypeOption | undefined {
    return (
        typeOption ?? resolveClientTypeOption(input.client_type_id ?? "", [])
    );
}

/** Corps POST/PUT selon le contrat API (`client_type_id`, champs dynamiques). */
export function clientPayloadForApi(
    input: CreateClientInput,
    typeOption?: ClientTypeOption,
    referenceDocumentFile?: File | null
): Record<string, unknown> {
    const resolvedType = resolveTypeOptionForPayload(input, typeOption);
    const client_type_id = Number(input.client_type_id);
    const required = getEffectiveRequiredFields(resolvedType);
    const clientName = input.client_name.trim();

    const payload: Record<string, unknown> = {
        client_type_id,
        // API historique / Laravel
        status: statusFormToApi(input.status ?? "actif"),
        client_name: clientName,
        /** Alias Laravel éventuel pour le libellé « Nom ». */
        nom: clientName,
        // API "ikwook" (payload vu: name/status_id)
        name: clientName,
        status_id: statusFormToApi(input.status ?? "actif"),
    };

    appendIfPresent(payload, "phone", input.phone ?? undefined);
    appendIfPresent(payload, "email", input.email ?? undefined);
    appendIfPresent(payload, "address", input.address ?? undefined);

    const country = parseCountryForApi(input.country);
    if (country !== undefined) {
        payload.country = country;
        // API "ikwook" (payload vu: country_id)
        payload.country_id = country;
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

    if (referenceDocumentFile instanceof File) {
        payload.reference_document = referenceDocumentFile;
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
