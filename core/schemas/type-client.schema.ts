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

/** Harmonise les libellés API (« Nom », « Reference document ») avec nos clés internes. */
export function normalizeRequiredFieldKey(field: string): string {
    const key = field.trim().toLowerCase().replace(/[\s-]+/g, "_");

    switch (key) {
        case "nom":
        case "name":
        case "client_name":
        case "denomination":
        case "raison_sociale":
            return "client_name";
        case "reference_document":
        case "document_de_reference":
        case "document_reference":
            return "reference_document";
        case "telephone":
        case "tel":
            return "phone";
        case "adresse":
            return "address";
        case "pays":
            return "country";
        case "idnat":
            return "idnat";
        default:
            return key;
    }
}

export function resolveClientTypeOption(
    clientTypeId: string,
    options: readonly ClientTypeOption[] = []
): ClientTypeOption | undefined {
    const id = clientTypeId.trim();
    if (!id) return undefined;

    const found = options.find((item) => item.id === id);
    if (found) return found;

    const fields = FALLBACK_REQUIRED_FIELDS_BY_ID[id];
    if (!fields) return undefined;

    return {
        id,
        code: id,
        title: id,
        required_fields: [...fields],
        is_default: false,
    };
}

export function getEffectiveRequiredFields(
    typeOption: ClientTypeOption | undefined
): readonly string[] {
    if (!typeOption) return [];
    const fallback = FALLBACK_REQUIRED_FIELDS_BY_ID[typeOption.id] ?? [];
    const fromApi = typeOption.required_fields ?? [];
    const merged = [...fallback, ...fromApi].map(normalizeRequiredFieldKey);
    return Array.from(new Set(merged));
}

export function clientTypeRequiresField(
    requiredFields: readonly string[] | undefined,
    ...aliases: string[]
): boolean {
    if (!requiredFields?.length) return false;

    const normalized = new Set(requiredFields.map(normalizeRequiredFieldKey));
    return aliases.some((alias) =>
        normalized.has(normalizeRequiredFieldKey(alias))
    );
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
