import { z } from "zod";

export const clientTypeEnum = z.enum(["personal", "pme", "corporate"]);

export const clientStatusEnum = z.enum(["actif", "suspendu", "complet"]);

const trimmedString = z.string().trim();

const baseFields = {
    reference: trimmedString.min(1, "La référence est requise"),
    status: clientStatusEnum.optional().default("actif"),
    phone: trimmedString.optional().nullable(),
    email: z
        .union([z.literal(""), z.string().trim().email("Email invalide")])
        .optional()
        .nullable(),
    address: trimmedString.optional().nullable(),
    country: trimmedString.optional().nullable(),
    nif: trimmedString.optional().nullable(),
};

export const personalClientFieldsSchema = z.object({
    client_type: z.literal("personal"),
    ...baseFields,
    first_name: trimmedString.min(1, "Le prénom est requis"),
    last_name: trimmedString.min(1, "Le nom est requis"),
    /** Les personnes physiques n’ont pas de RCCM métier */
    rccm: trimmedString.optional().nullable(),
    company_name: trimmedString.optional().nullable(),
    subtitle: trimmedString.optional().nullable(),
    business_sector: trimmedString.optional().nullable(),
});

export const pmeClientFieldsSchema = z.object({
    client_type: z.literal("pme"),
    ...baseFields,
    company_name: trimmedString.min(1, "La dénomination est requise"),
    subtitle: trimmedString.optional().nullable(),
    rccm: trimmedString.min(1, "Le RCCM est requis pour une PME"),
    business_sector: trimmedString.min(1, "Le secteur d’activité est requis"),
    first_name: trimmedString.optional().nullable(),
    last_name: trimmedString.optional().nullable(),
});

export const corporateClientFieldsSchema = z.object({
    client_type: z.literal("corporate"),
    ...baseFields,
    company_name: trimmedString.min(1, "La dénomination sociale est requise"),
    subtitle: trimmedString.optional().nullable(),
    rccm: trimmedString.min(1, "Le RCCM est requis"),
    business_sector: trimmedString.min(1, "Le secteur d’activité est requis"),
    legal_representative: trimmedString.optional().nullable(),
    first_name: trimmedString.optional().nullable(),
    last_name: trimmedString.optional().nullable(),
});

export const createClientSchema = z.discriminatedUnion("client_type", [
    personalClientFieldsSchema,
    pmeClientFieldsSchema,
    corporateClientFieldsSchema,
]);

export const updateClientSchema = createClientSchema;

const idLike = z.union([z.string(), z.number()]).transform(String);

/** Aligne les payloads Laravel / API sur le schéma attendu par l’UI. */
export function normalizeClientResponseInput(raw: unknown): unknown {
    if (raw === null || typeof raw !== "object") {
        return raw;
    }

    const r = { ...(raw as Record<string, unknown>) };

    if (r.id === undefined || r.id === null || r.id === "") {
        const alt =
            (r as { navigation_id?: unknown }).navigation_id ??
            (r as { client_id?: unknown }).client_id;
        if (alt !== undefined && alt !== null && alt !== "") {
            r.id = alt;
        }
    }

    const pickStr = (v: unknown): string | undefined =>
        v === null || v === undefined ? undefined : String(v).trim() || undefined;

    const clientName = pickStr(r.client_name) ?? pickStr(r.legal_name);
    if (clientName && !pickStr(r.company_name)) {
        r.company_name = clientName;
    }

    const typeRaw = pickStr(r.client_type)?.toLowerCase();
    const typeAliases: Record<string, z.infer<typeof clientTypeEnum>> = {
        personal: "personal",
        pme: "pme",
        corporate: "corporate",
        individual: "personal",
        particulier: "personal",
        person: "personal",
        company: "corporate",
        enterprise: "corporate",
        sas: "corporate",
    };
    if (typeRaw) {
        const mapped = typeAliases[typeRaw] ?? (typeRaw as z.infer<typeof clientTypeEnum>);
        const allowed: z.infer<typeof clientTypeEnum>[] = ["personal", "pme", "corporate"];
        r.client_type = allowed.includes(mapped) ? mapped : "pme";
    } else {
        r.client_type = "personal";
    }

    if (!pickStr(r.reference)) {
        const alt =
            pickStr(r.code) ??
            pickStr(r.client_code) ??
            pickStr((r as { numero?: unknown }).numero);
        if (alt) {
            r.reference = alt;
        } else if (r.id !== undefined && r.id !== null) {
            r.reference = String(r.id);
        } else {
            r.reference = "";
        }
    }

    const st = r.status ?? r.statut ?? (r as { state?: unknown }).state;
    r.status =
        st === null || st === undefined || st === ""
            ? "actif"
            : String(st).toLowerCase();

    if (r.client_type === "personal" && clientName) {
        if (!pickStr(r.first_name) && !pickStr(r.last_name)) {
            const parts = clientName.split(/\s+/).filter(Boolean);
            if (parts.length >= 2) {
                r.first_name = parts[0];
                r.last_name = parts.slice(1).join(" ");
            } else {
                r.first_name = clientName;
                r.last_name = "";
            }
        }
    }

    const tel =
        r.phone ??
        r.telephone ??
        (r as { phone_number?: unknown; mobile?: unknown }).phone_number ??
        (r as { mobile?: unknown }).mobile;
    if (tel !== undefined && r.phone === undefined) {
        r.phone = tel === null ? null : String(tel);
    }

    const addr =
        r.address ?? (r as { adresse?: unknown }).adresse ?? r.location;
    if (addr !== undefined && r.address === undefined) {
        r.address = addr === null ? null : String(addr);
    }

    if ((r.id === undefined || r.id === null || r.id === "") && pickStr(r.reference)) {
        r.id = r.reference as string;
    }

    return r;
}

const clientResponseShape = z
    .object({
        id: idLike,
        client_type: clientTypeEnum,
        reference: z.string(),
        status: z.string(),
        first_name: z.string().nullable().optional(),
        last_name: z.string().nullable().optional(),
        company_name: z.string().nullable().optional(),
        subtitle: z.string().nullable().optional(),
        nif: z.string().nullable().optional(),
        rccm: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
        business_sector: z.string().nullable().optional(),
        legal_representative: z.string().nullable().optional(),
    })
    .passthrough();

export const clientResponseSchema = z.preprocess(
    normalizeClientResponseInput,
    clientResponseShape
);

export const paginatedClientsSchema = z
    .object({
        data: z.array(clientResponseSchema),
        meta: z
            .object({
                current_page: z.number().optional(),
                last_page: z.number().optional(),
                per_page: z.number().optional(),
                total: z.number().optional(),
            })
            .passthrough()
            .optional(),
    })
    .passthrough();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type ClientResponse = z.infer<typeof clientResponseSchema>;
export type ClientType = z.infer<typeof clientTypeEnum>;
