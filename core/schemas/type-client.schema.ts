import { z } from "zod";

const idLike = z.union([z.string(), z.number()]).transform(String);

function pickTruthyString(...vals: unknown[]): string | undefined {
    for (const v of vals) {
        if (typeof v === "string" && v.trim() !== "") {
            return v.trim();
        }
    }
    return undefined;
}

/** Champs attendus par type si l’API ne renvoie pas `required_fields`. */
const FALLBACK_REQUIRED_FIELDS_BY_ID: Record<string, readonly string[]> = {
    "1": ["client_name", "phone", "email", "country", "address"],
    "2": [
        "client_name",
        "nif",
        "rccm",
        "idnat",
        "business_sector",
        "legal_representative",
        "phone",
        "email",
        "country",
        "address",
    ],
    "3": [
        "client_name",
        "nif",
        "rccm",
        "idnat",
        "business_sector",
        "phone",
        "email",
        "country",
        "address",
    ],
    "4": [
        "client_name",
        "nif",
        "idnat",
        "business_sector",
        "legal_representative",
        "phone",
        "email",
        "country",
        "address",
    ],
    "5": [
        "client_name",
        "reference_document",
        "phone",
        "email",
        "country",
        "address",
    ],
};

export function normalizeClientTypeInput(raw: unknown): unknown {
    if (raw === null || typeof raw !== "object") {
        return raw;
    }

    const r = { ...(raw as Record<string, unknown>) };

    const code = pickTruthyString(r.code, r.client_type, r.slug, r.key);
    if (code) {
        r.code = code;
    }

    const title = pickTruthyString(r.title, r.label, r.name, r.libelle);
    if (title) {
        r.title = title;
    } else if (code) {
        r.title = code;
    }

    if (Array.isArray(r.required_fields)) {
        r.required_fields = r.required_fields
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
    } else {
        r.required_fields = [];
    }

    if (typeof r.is_default === "string") {
        r.is_default = r.is_default === "true" || r.is_default === "1";
    }

    if (typeof r.sort === "string" && r.sort.trim() !== "") {
        const n = Number(r.sort);
        if (!Number.isNaN(n)) {
            r.sort = n;
        }
    }

    return r;
}

export const clientTypeOptionSchema = z.preprocess(
    normalizeClientTypeInput,
    z
        .object({
            id: idLike,
            account_id: z.number().optional(),
            code: z.string().min(1),
            title: z.string().min(1),
            description: z.string().optional().nullable(),
            mention: z.string().optional().nullable(),
            value: z.string().optional().nullable(),
            sort: z.number().optional().nullable(),
            is_default: z.boolean().optional().default(false),
            required_fields: z.array(z.string()).default([]),
            mandatory_label: z.string().optional().nullable(),
        })
        .passthrough()
);

export type ClientTypeOption = z.infer<typeof clientTypeOptionSchema>;

export const clientTypesListSchema = z.array(clientTypeOptionSchema);

export function getEffectiveRequiredFields(
    typeOption: ClientTypeOption | undefined
): readonly string[] {
    if (!typeOption) return [];
    if (typeOption.required_fields.length > 0) {
        return typeOption.required_fields;
    }
    return FALLBACK_REQUIRED_FIELDS_BY_ID[typeOption.id] ?? [];
}

export function clientTypeRequiresField(
    requiredFields: readonly string[] | undefined,
    ...aliases: string[]
): boolean {
    if (!requiredFields?.length) return false;
    const normalized = new Set(
        requiredFields.map((field) => field.trim().toLowerCase())
    );
    return aliases.some((alias) => normalized.has(alias.trim().toLowerCase()));
}

export function clientTypeShowsField(
    typeOption: ClientTypeOption | undefined,
    ...aliases: string[]
): boolean {
    return clientTypeRequiresField(getEffectiveRequiredFields(typeOption), ...aliases);
}

export function clientTypeFieldIsRequired(
    typeOption: ClientTypeOption | undefined,
    ...aliases: string[]
): boolean {
    return clientTypeShowsField(typeOption, ...aliases);
}
