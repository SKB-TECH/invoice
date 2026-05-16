import { z } from "zod";

const isoDateString = z.string().refine(
    (v) => !Number.isNaN(Date.parse(v)),
    "Date invalide"
);

const amount = z.coerce.number().finite().nonnegative();

export const billingCycleEnum = z.enum([
    "monthly",
    "quarterly",
    "yearly",
    "one_shot",
    "custom",
]);

export const contractStatusEnum = z.enum(["actif", "suspendu", "complet"]);

/** Objet ou tableau JSON pour le template de lignes */
export const itemsTemplateSchema = z.union([
    z.array(z.record(z.string(), z.unknown())),
    z.record(z.string(), z.unknown()),
]);

const itemsTemplateFromForm = z.preprocess((val) => {
    if (typeof val === "string") {
        const t = val.trim();
        if (t === "") return [];
        try {
            return JSON.parse(t) as unknown;
        } catch {
            return val;
        }
    }
    return val;
}, itemsTemplateSchema);

export const createContractSchema = z
    .object({
        client_id: z.string().min(1, "Le client est requis"),
        title: z.string().trim().min(1, "Le titre est requis"),
        reference: z.string().trim().min(1, "La référence est requise"),
        starting: isoDateString,
        ending: isoDateString,
        currency: z
            .string()
            .trim()
            .length(3, "La devise doit faire 3 lettres (ex. USD)")
            .transform((c) => c.toUpperCase()),
        total: amount,
        monthly: amount,
        paid: amount,
        description: z.string().trim().optional().nullable(),
        billing_cycle: billingCycleEnum,
        items_template: itemsTemplateFromForm,
        /** Champs UI additionnels — ignorés côté API s’ils ne sont pas supportés */
        status: contractStatusEnum.optional().default("actif"),
        phone: z.string().trim().optional().nullable(),
        auto_renew: z.boolean().optional().default(false),
    })
    .superRefine((data, ctx) => {
        const start = Date.parse(data.starting);
        const end = Date.parse(data.ending);
        if (start >= end) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La date de fin doit être postérieure à la date de début",
                path: ["ending"],
            });
        }
    });

export const updateContractSchema = createContractSchema.partial().extend({
    client_id: z.string().min(1).optional(),
});

const idLike = z.union([z.string(), z.number()]).transform(String);

export const contractResponseSchema = z
    .object({
        id: idLike,
        client_id: idLike,
        title: z.string(),
        reference: z.string(),
        starting: z.string(),
        ending: z.string(),
        currency: z.string(),
        total: z.union([z.number(), z.string()]).transform(Number),
        monthly: z.union([z.number(), z.string()]).transform(Number),
        paid: z.union([z.number(), z.string()]).transform(Number),
        description: z.string().nullable().optional(),
        billing_cycle: z.string(),
        items_template: z.unknown(),
        file_path: z.string().nullable().optional(),
        file_url: z.string().nullable().optional(),
        status: z.string().optional(),
        phone: z.string().nullable().optional(),
        auto_renew: z.boolean().optional(),
        client_name: z.string().nullable().optional(),
    })
    .passthrough();

export const paginatedContractsSchema = z
    .object({
        data: z.array(contractResponseSchema),
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

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type ContractResponse = z.infer<typeof contractResponseSchema>;
