import { z } from "zod";

import { api } from "@/core/services/api";
import {
    referentielPostPayloadSchema,
    referentielRecordSchema,
    type ReferentielPostPayload,
    type ReferentielRecord,
} from "@/core/schemas/referentiel.schema";
import { unwrapApiData } from "@/core/utils/apiResponse";
import type { ReferentialCatalogRow } from "@/lib/referentials/referential-catalog-storage";

const REFERENTIELS_PATH = "/invoices/referentiels";

const MAX_PAGES = 500;

export type ReferentielsPageMeta = {
    page: number;
    perPage: number;
    lastPage?: number;
    total?: number;
};

export type ReferentielsPageResult = {
    items: ReferentielRecord[];
    meta?: ReferentielsPageMeta;
};

function coerceMeta(
    meta: Record<string, unknown> | undefined
): ReferentielsPageMeta | undefined {
    if (!meta || typeof meta !== "object") return undefined;

    const pickNum = (...keys: string[]): number | undefined => {
        for (const k of keys) {
            const v = meta[k];
            if (typeof v === "number" && Number.isFinite(v)) return v;
            if (typeof v === "string" && v.trim() !== "") {
                const n = Number(v);
                if (!Number.isNaN(n)) return n;
            }
        }
        return undefined;
    };

    const page = pickNum("page", "current_page") ?? 1;
    const perPage = pickNum("perPage", "per_page") ?? 20;
    const lastPage = pickNum("last_page", "lastPage");
    const total = pickNum("total");

    const out: ReferentielsPageMeta = { page, perPage };
    if (lastPage !== undefined) out.lastPage = lastPage;
    if (total !== undefined) out.total = total;
    return out;
}

export function parseReferentielPostPayload(input: ReferentielPostPayload): ReferentielPostPayload {
    return referentielPostPayloadSchema.parse({
        referentiel: input.referentiel.trim(),
        title: input.title.trim(),
        description: (input.description ?? "").trim(),
        code: input.code.trim(),
        parent_id: Number.isFinite(input.parent_id)
            ? Math.max(0, Math.floor(input.parent_id))
            : 0,
    });
}

export function parsePagedReferentiels(raw: unknown): ReferentielsPageResult {
    const shells = [raw, unwrapApiData<unknown>(raw)];

    for (const shell of shells) {
        if (shell === null || typeof shell !== "object") continue;

        const asArray = z.array(referentielRecordSchema).safeParse(shell);
        if (asArray.success) {
            return { items: asArray.data };
        }

        const o = shell as Record<string, unknown>;
        const meta = coerceMeta(
            o.meta as Record<string, unknown> | undefined
        );

        const itemsCandidate = o.items ?? o.data;
        if (Array.isArray(itemsCandidate)) {
            const parsed = z
                .array(referentielRecordSchema)
                .safeParse(itemsCandidate);
            if (parsed.success) {
                return { items: parsed.data, meta };
            }
        }
    }

    throw new Error("Référentiels : pagination / structure de liste inconnue.");
}

export async function fetchReferentielsPage(params?: {
    page?: number;
    perPage?: number;
    /** Filtre côté API (ex. axe Contrat pour les types de contrat). */
    axe?: string;
}): Promise<ReferentielsPageResult> {
    const res = await api.get(REFERENTIELS_PATH, {
        params: {
            page: params?.page ?? 1,
            perPage: params?.perPage ?? 20,
            ...(params?.axe != null && params.axe.trim() !== ""
                ? { axe: params.axe.trim() }
                : {}),
        },
    });
    return parsePagedReferentiels(res.data);
}

export async function fetchAllReferentiels(options?: {
    perPage?: number;
    axe?: string;
}): Promise<ReferentielRecord[]> {
    const perPage = options?.perPage ?? 50;
    let page = 1;
    const acc: ReferentielRecord[] = [];

    while (page <= MAX_PAGES) {
        const { items, meta } = await fetchReferentielsPage({
            page,
            perPage,
            axe: options?.axe,
        });

        acc.push(...items);

        if (items.length === 0) break;

        if (meta?.lastPage !== undefined && page >= meta.lastPage) break;

        if (meta?.total !== undefined && acc.length >= meta.total) break;

        if (items.length < perPage) break;

        page += 1;
    }

    return acc;
}

export async function fetchReferentielById(
    id: number | string
): Promise<ReferentielRecord> {
    const res = await api.get(
        `${REFERENTIELS_PATH}/${encodeURIComponent(String(id))}`
    );
    const raw = unwrapApiData<unknown>(res.data);
    return referentielRecordSchema.parse(raw);
}

export async function createReferentiel(
    payload: ReferentielPostPayload
): Promise<ReferentielRecord> {
    const body = parseReferentielPostPayload(payload);
    const res = await api.post(REFERENTIELS_PATH, body);
    const raw = unwrapApiData<unknown>(res.data);
    return referentielRecordSchema.parse(raw);
}

export function referentielRecordToCatalogRow(
    record: ReferentielRecord
): ReferentialCatalogRow {
    return {
        id: record.id,
        referentiel: record.referentiel.trim(),
        title: record.title.trim(),
        description: record.description.trim(),
        code: record.code.trim(),
        parent_id: Math.max(0, Math.floor(record.parent_id)),
    };
}
