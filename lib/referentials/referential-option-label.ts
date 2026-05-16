import type { ReferentielRecord } from "@/core/schemas/referentiel.schema";

export function formatReferentielOptionLabel(r: ReferentielRecord): string {
    const desc = (r.description ?? "").trim();
    const axis = r.referentiel.trim();
    const head = `[${axis}] ${r.code} — ${r.title}`;
    return desc ? `${head} — ${desc}` : head;
}
