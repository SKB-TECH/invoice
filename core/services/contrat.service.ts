import { api } from "@/core/services/api";
import {
    billingCycleToApi,
    contractResponseSchema,
    paginatedContractsSchema,
    type CreateContractInput,
} from "@/core/schemas/contrat.schema";
import { unwrapApiData } from "@/core/utils/apiResponse";
import { z } from "zod";

const CONTRACTS_PATH = "/invoices/contracts";

export type ContractsListResult = {
    items: z.infer<typeof contractResponseSchema>[];
    meta?: z.infer<typeof paginatedContractsSchema>["meta"];
};

export type ListContractsParams = {
    page?: number;
    per_page?: number;
};

function appendContractFields(fd: FormData, payload: Record<string, unknown>) {
    for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || value === null) continue;
        if (typeof value === "boolean") {
            fd.append(key, value ? "1" : "0");
            continue;
        }
        if (typeof value === "object" && !(value instanceof File)) {
            fd.append(key, JSON.stringify(value));
            continue;
        }
        fd.append(key, String(value));
    }
}

/** IDs clients numériques (API OpenAPI) vs UUID conservés en chaîne. */
function coerceClientIdForApi(id: string): number | string {
    const t = id.trim();
    if (/^\d+$/.test(t)) return Number.parseInt(t, 10);
    return t;
}

/** Corps création aligné sur le schéma OpenAPI (JSON natif : tableaux/objets, entiers). */
export function minimalCreateContractPayload(
    payload: CreateContractInput
): Record<string, unknown> {
    const items = payload.items_template;
    const base: Record<string, unknown> = {
        client_id: coerceClientIdForApi(payload.client_id),
        title: payload.title,
        reference: payload.reference,
        starting: payload.starting,
        ending: payload.ending,
        auto_renew: payload.auto_renew,
        total: payload.total,
        currency: payload.currency,
        /** Souvent casté JSON côté backend : absence ou "" provoque « Failed to parse JSON string ». */
        items_template: Array.isArray(items) ? items : [],
        billing_cycle: billingCycleToApi(payload.billing_cycle),
        monthly: payload.monthly,
        paid: payload.paid,
        description: payload.description ?? "",
    };
    if (payload.type > 0) {
        base.type = payload.type;
    }
    return base;
}

function contractCreateJsonBody(
    payload: CreateContractInput
): Record<string, unknown> {
    const base = minimalCreateContractPayload(payload);
    return {
        ...base,
        /** OpenAPI : entier 0 | 1 */
        auto_renew: payload.auto_renew ? 1 : 0,
    };
}

function contractPayloadForMultipart(
    payload: CreateContractInput
): Record<string, unknown> {
    const out: Record<string, unknown> = {
        client_id: coerceClientIdForApi(payload.client_id),
        title: payload.title,
        reference: payload.reference,
        starting: payload.starting,
        ending: payload.ending,
        currency: payload.currency,
        total: payload.total,
        monthly: payload.monthly,
        paid: payload.paid,
        description: payload.description,
        billing_cycle: billingCycleToApi(payload.billing_cycle),
        items_template: payload.items_template,
        auto_renew: payload.auto_renew,
    };
    if (payload.type > 0) {
        out.type = payload.type;
    }
    return Object.fromEntries(
        Object.entries(out).filter(([, v]) => v !== undefined)
    );
}

function parseContractsListPayload(raw: unknown): ContractsListResult {
    const pageParsed = paginatedContractsSchema.safeParse(raw);
    if (pageParsed.success) {
        return {
            items: pageParsed.data.data,
            meta: pageParsed.data.meta,
        };
    }

    const arr = z.array(contractResponseSchema).safeParse(raw);
    if (arr.success) {
        return { items: arr.data };
    }

    const inner = unwrapApiData<unknown>(raw);
    const retryPage = paginatedContractsSchema.safeParse(inner);
    if (retryPage.success) {
        return { items: retryPage.data.data, meta: retryPage.data.meta };
    }

    const retryArr = z.array(contractResponseSchema).safeParse(inner);
    if (retryArr.success) {
        return { items: retryArr.data };
    }

    throw new Error("Format de liste contrats inconnu.");
}

export const contratService = {
    async list(params?: ListContractsParams): Promise<ContractsListResult> {
        const res = await api.get(CONTRACTS_PATH, {
            params: {
                page: params?.page,
                per_page: params?.per_page,
            },
        });
        return parseContractsListPayload(res.data);
    },

    async getById(id: string): Promise<z.infer<typeof contractResponseSchema>> {
        const res = await api.get(`${CONTRACTS_PATH}/${encodeURIComponent(id)}`);
        const raw = unwrapApiData<unknown>(res.data);
        return contractResponseSchema.parse(raw);
    },

    async create(
        payload: CreateContractInput,
        file?: File | null
    ): Promise<z.infer<typeof contractResponseSchema>> {
        if (file) {
            const fd = new FormData();
            appendContractFields(fd, minimalCreateContractPayload(payload));
            fd.append("file", file);
            const res = await api.post(CONTRACTS_PATH, fd);
            const raw = unwrapApiData<unknown>(res.data);
            return contractResponseSchema.parse(raw);
        }

        /* Pas de fichier : JSON pur (schéma OpenAPI) évite les écarts multipart / casts JSON backend. */
        const res = await api.post(CONTRACTS_PATH, contractCreateJsonBody(payload));
        const raw = unwrapApiData<unknown>(res.data);
        return contractResponseSchema.parse(raw);
    },

    async update(
        id: string,
        payload: CreateContractInput,
        file?: File | null
    ): Promise<z.infer<typeof contractResponseSchema>> {
        const fd = new FormData();
        appendContractFields(fd, contractPayloadForMultipart(payload));
        if (file) {
            fd.append("file", file);
        }

        const res = await api.put(
            `${CONTRACTS_PATH}/${encodeURIComponent(id)}`,
            fd
        );
        const raw = unwrapApiData<unknown>(res.data);
        return contractResponseSchema.parse(raw);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${CONTRACTS_PATH}/${encodeURIComponent(id)}`);
    },
};
