"use client";

import type { ReferentielPostPayload } from "@/core/schemas/referentiel.schema";

export type ReferentialCatalogRow = {
    id: number;
    referentiel: string;
    title: string;
    description: string;
    code: string;
    parent_id: number;
};

export const REFERENTIAL_REGISTRY_SLUGS = [
    "clients",
    "fournitures",
    "contrats",
] as const;

export type ReferentialRegistrySlug =
    (typeof REFERENTIAL_REGISTRY_SLUGS)[number];

export const REFERENTIAL_CATALOG_STORAGE_KEY = "ikwook.referentialCatalog.v1";
export const REFERENTIAL_CATALOG_CHANGED_EVENT =
    "ikwook-referential-catalog-changed";

function nextAvailableId(rows: ReferentialCatalogRow[]): number {
    const maxId = rows.reduce((m, r) => Math.max(m, r.id), 0);
    return maxId + 1;
}

export function readReferentialCatalog(): ReferentialCatalogRow[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(REFERENTIAL_CATALOG_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        const out: ReferentialCatalogRow[] = [];
        parsed.forEach((item) => {
            if (
                item &&
                typeof item === "object" &&
                typeof (item as ReferentialCatalogRow).id === "number" &&
                typeof (item as ReferentialCatalogRow).referentiel ===
                    "string" &&
                typeof (item as ReferentialCatalogRow).title === "string" &&
                typeof (item as ReferentialCatalogRow).description ===
                    "string" &&
                typeof (item as ReferentialCatalogRow).code === "string" &&
                typeof (item as ReferentialCatalogRow).parent_id === "number"
            ) {
                out.push(item as ReferentialCatalogRow);
            }
        });
        return out;
    } catch {
        return [];
    }
}

export function writeReferentialCatalog(rows: ReferentialCatalogRow[]): void {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
        REFERENTIAL_CATALOG_STORAGE_KEY,
        JSON.stringify(rows)
    );
    window.dispatchEvent(new CustomEvent(REFERENTIAL_CATALOG_CHANGED_EVENT));
}

export function upsertReferentialCatalogRows(
    mutator: (prev: ReferentialCatalogRow[]) => ReferentialCatalogRow[]
): void {
    writeReferentialCatalog(mutator(readReferentialCatalog()));
}

export function insertReferentialRow(
    draft: Omit<ReferentialCatalogRow, "id">
): ReferentialCatalogRow | null {
    const codeTrim = draft.code.trim();
    const titleTrim = draft.title.trim();
    if (!codeTrim || !titleTrim || !draft.referentiel.trim()) {
        return null;
    }

    let created: ReferentialCatalogRow | null = null;

    upsertReferentialCatalogRows((prev) => {
        const id = nextAvailableId(prev);
        const row: ReferentialCatalogRow = {
            id,
            referentiel: draft.referentiel.trim(),
            title: titleTrim,
            description: draft.description.trim(),
            code: codeTrim,
            parent_id:
                typeof draft.parent_id === "number" &&
                Number.isFinite(draft.parent_id)
                    ? Math.max(0, Math.floor(draft.parent_id))
                    : 0,
        };

        const parentOk =
            row.parent_id === 0 ||
            prev.some(
                (x) =>
                    x.id === row.parent_id &&
                    x.referentiel === row.referentiel
            );
        if (!parentOk) {
            row.parent_id = 0;
        }

        created = row;
        return [...prev, row];
    });

    return created;
}

export function updateReferentialRow(
    id: number,
    patch: Partial<Omit<ReferentialCatalogRow, "id">>
): boolean {
    let ok = false;

    upsertReferentialCatalogRows((prev) => {
        const idx = prev.findIndex((r) => r.id === id);
        if (idx === -1) return prev;

        const current = prev[idx]!;
        const ref = (patch.referentiel ?? current.referentiel).trim();
        const title = (patch.title ?? current.title).trim();
        const description = (patch.description ?? current.description).trim();
        const code = (patch.code ?? current.code).trim();
        let parent_id =
            patch.parent_id !== undefined
                ? Math.max(0, Math.floor(patch.parent_id))
                : current.parent_id;

        if (parent_id === id) parent_id = 0;
        if (parent_id !== 0) {
            const parentRow = prev.find((x) => x.id === parent_id);
            if (!parentRow || parentRow.referentiel !== ref) {
                parent_id = 0;
            }
        }

        if (!code || !title || !ref) {
            return prev;
        }

        ok = true;
        const copy = [...prev];
        copy[idx] = {
            id,
            referentiel: ref,
            title,
            description,
            code,
            parent_id,
        };
        return copy;
    });

    return ok;
}

export function deleteReferentialRow(id: number): void {
    upsertReferentialCatalogRows((prev) =>
        prev
            .filter((r) => r.id !== id)
            .map((r) => (r.parent_id === id ? { ...r, parent_id: 0 } : r))
    );
}

export function rowsForReferential(
    referentiel: string,
    rows?: ReferentialCatalogRow[]
): ReferentialCatalogRow[] {
    const all = rows ?? readReferentialCatalog();
    const key = referentiel.trim();
    return all.filter((r) => r.referentiel === key);
}

export function replaceReferentialSlice(
    referential: string,
    incoming: ReferentialCatalogRow[]
): void {
    const key = referential.trim();

    upsertReferentialCatalogRows((prev) => [
        ...prev.filter((r) => r.referentiel !== key),
        ...incoming.map((r) => ({
            ...r,
            referentiel: key,
        })),
    ]);
}

export function overwriteRegistryCatalogFromFullSync(
    rows: ReferentialCatalogRow[]
): void {
    const registry = new Set<string>(
        REFERENTIAL_REGISTRY_SLUGS as unknown as string[]
    );
    upsertReferentialCatalogRows((prev) => [
        ...prev.filter((r) => !registry.has(r.referentiel.trim())),
        ...rows.filter((r) => registry.has(r.referentiel.trim())),
    ]);
}

export function upsertCatalogRow(row: ReferentialCatalogRow): void {
    upsertReferentialCatalogRows((prev) => {
        const i = prev.findIndex((r) => r.id === row.id);
        if (i === -1) return [...prev, row];

        const next = [...prev];
        next[i] = row;
        return next;
    });
}

export function referentialPayloadFromRow(
    row: ReferentialCatalogRow
): ReferentielPostPayload {
    const { referentiel, title, description, code, parent_id } = row;
    return {
        referentiel,
        title,
        description,
        code,
        parent_id,
    };
}
