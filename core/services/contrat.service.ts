import { api } from "@/core/services/api";
import {
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
        if (typeof value === "object" && !(value instanceof File)) {
            fd.append(key, JSON.stringify(value));
            continue;
        }
        fd.append(key, String(value));
    }
}

function contractPayloadForMultipart(
    payload: CreateContractInput
): Record<string, unknown> {
    const p = payload as Record<string, unknown>;
    const out: Record<string, unknown> = {
        client_id: p.client_id,
        title: p.title,
        reference: p.reference,
        starting: p.starting,
        ending: p.ending,
        currency: p.currency,
        total: p.total,
        monthly: p.monthly,
        paid: p.paid,
        description: p.description,
        billing_cycle: p.billing_cycle,
        items_template: p.items_template,
        status: p.status,
        phone: p.phone,
        auto_renew: p.auto_renew,
    };
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
        const fd = new FormData();
        appendContractFields(fd, contractPayloadForMultipart(payload));
        if (file) {
            fd.append("file", file);
        }

        const res = await api.post(CONTRACTS_PATH, fd);
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
