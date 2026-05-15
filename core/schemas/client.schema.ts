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

export const clientResponseSchema = z
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
