import { z } from "zod";

/** Identifiant renvoyé par GET /invoices/client-types. */
export type ClientType = string;

export const clientTypeEnum = z.enum(["personal", "pme", "corporate"]);

export const clientStatusEnum = z.enum(["actif", "suspendu", "complet"]);

const trimmedString = z.string().trim();

const sharedClientFields = {
    client_type_id: trimmedString.min(1, "Le type de client est requis"),
    client_name: trimmedString.min(1, "Le nom du client est requis"),
    status: clientStatusEnum.optional().default("actif"),
    phone: trimmedString.optional().nullable(),
    email: z
        .union([z.literal(""), z.string().trim().email("Email invalide")])
        .optional()
        .nullable(),
    address: trimmedString.optional().nullable(),
    country: trimmedString.optional().nullable(),
    reference: trimmedString.optional().nullable(),
    reference_document: trimmedString.optional().nullable(),
    nif: trimmedString.optional().nullable(),
    rccm: trimmedString.optional().nullable(),
    business_sector: trimmedString.optional().nullable(),
    legal_representative: trimmedString.optional().nullable(),
    /** Legacy — conservé pour l’édition */
    client_type: trimmedString.optional().nullable(),
    first_name: trimmedString.optional().nullable(),
    last_name: trimmedString.optional().nullable(),
    company_name: trimmedString.optional().nullable(),
    subtitle: trimmedString.optional().nullable(),
};

export const createClientSchema = z.object(sharedClientFields);

export const updateClientSchema = createClientSchema;

const idLike = z.union([z.string(), z.number()]).transform(String);

function statusApiToForm(status: unknown): string {
    if (status === 1 || status === "1") return "actif";
    if (status === 2 || status === "2") return "suspendu";
    if (status === 3 || status === "3") return "complet";
    if (typeof status === "string" && status.trim()) {
        return status.trim().toLowerCase();
    }
    return "actif";
}

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

    const clientName =
        pickStr(r.client_name) ??
        pickStr(r.legal_name) ??
        pickStr((r as { name?: unknown }).name);
    if (clientName) {
        if (!pickStr(r.company_name)) {
            r.company_name = clientName;
        }
        if (!pickStr(r.client_name)) {
            r.client_name = clientName;
        }
    }

    if (r.client_type_id !== undefined && r.client_type_id !== null) {
        r.client_type_id = String(r.client_type_id);
    }

    const typeRaw = pickStr(r.client_type);
    r.client_type = typeRaw ?? "";

    if (!pickStr(r.reference)) {
        const alt =
            pickStr(r.idnat) ??
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

    if (!pickStr(r.reference_document)) {
        const doc = pickStr(
            (r as { reference_document?: unknown }).reference_document
        );
        if (doc) {
            r.reference_document = doc;
        }
    }

    r.status = statusApiToForm(r.status ?? r.statut ?? (r as { state?: unknown }).state);

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

    const countryFallback =
        pickStr((r as { country_id?: unknown }).country_id) ??
        pickStr((r as { countryId?: unknown }).countryId);

    let countryFromObject: string | undefined;
    if (
        r.country &&
        typeof r.country === "object" &&
        !Array.isArray(r.country)
    ) {
        const countryObject = r.country as Record<string, unknown>;
        countryFromObject =
            pickStr(countryObject.id) ??
            pickStr(countryObject.code) ??
            pickStr(countryObject.name);
    }

    const normalizedCountry =
        countryFallback ?? countryFromObject ?? pickStr(r.country);
    if (normalizedCountry) {
        r.country = normalizedCountry;
    }

    if ((r.id === undefined || r.id === null || r.id === "") && pickStr(r.reference)) {
        r.id = r.reference as string;
    }

    return r;
}

const clientResponseShape = z
    .object({
        id: idLike,
        client_type_id: z.string().optional().nullable(),
        client_type: z.string().optional().nullable(),
        client_name: z.string().nullable().optional(),
        reference: z.string(),
        reference_document: z.string().nullable().optional(),
        idnat: z.string().nullable().optional(),
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

export function statusFormToApi(status: z.infer<typeof clientStatusEnum>): number {
    switch (status) {
        case "suspendu":
            return 2;
        case "complet":
            return 3;
        default:
            return 1;
    }
}

export function parseCountryForApi(value: string | null | undefined): number | undefined {
    const trimmed = (value ?? "").trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
}
