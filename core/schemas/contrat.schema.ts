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

/** Valeurs entières attendues par l’API (à ajuster si le backend documente un autre mapping). */
const BILLING_CYCLE_TO_API: Record<
    z.infer<typeof billingCycleEnum>,
    number
> = {
    monthly: 1,
    quarterly: 2,
    yearly: 3,
    one_shot: 4,
    custom: 5,
};

const API_TO_BILLING_CYCLE = {
    1: "monthly",
    2: "quarterly",
    3: "yearly",
    4: "one_shot",
    5: "custom",
} as const satisfies Record<number, z.infer<typeof billingCycleEnum>>;

export function billingCycleToApi(
    cycle: z.infer<typeof billingCycleEnum>
): number {
    return BILLING_CYCLE_TO_API[cycle];
}

export function billingCycleFromApi(
    raw: string | number | null | undefined
): z.infer<typeof billingCycleEnum> {
    if (raw === null || raw === undefined) return "monthly";
    const n =
        typeof raw === "number" ? raw : Number.parseInt(String(raw).trim(), 10);
    if (
        Number.isFinite(n) &&
        (n === 1 || n === 2 || n === 3 || n === 4 || n === 5)
    ) {
        return API_TO_BILLING_CYCLE[n];
    }
    const s = String(raw).toLowerCase();
    if (
        s === "monthly" ||
        s === "quarterly" ||
        s === "yearly" ||
        s === "one_shot" ||
        s === "custom"
    ) {
        return s as z.infer<typeof billingCycleEnum>;
    }
    return "monthly";
}

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

const contractFieldsSchema = z.object({
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
    /** Affichage local / futur champ API ; non inclus dans les payloads multipart actuels. */
    phone: z.string().trim().optional().nullable(),
    auto_renew: z.boolean().optional().default(false),
});

function refineContractDateOrder(
    data: { starting?: string; ending?: string },
    ctx: z.RefinementCtx
) {
    if (data.starting === undefined || data.ending === undefined) {
        return;
    }
    const start = Date.parse(data.starting);
    const end = Date.parse(data.ending);
    if (start >= end) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La date de fin doit être postérieure à la date de début",
            path: ["ending"],
        });
    }
}

export const createContractSchema = contractFieldsSchema.superRefine(
    refineContractDateOrder
);

/** `partial()` ne s’applique qu’à l’objet sans `superRefine` ; le raffinement dates est réappliqué après. */
export const updateContractSchema = contractFieldsSchema
    .partial()
    .extend({
        client_id: z.string().min(1).optional(),
    })
    .superRefine(refineContractDateOrder);

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
        billing_cycle: z
            .union([z.number(), z.string()])
            .transform((v) => billingCycleFromApi(v)),
        items_template: z.unknown(),
        file_path: z.string().nullable().optional(),
        file_url: z.string().nullable().optional(),
        /** API : souvent entier (ex. 1 = actif) */
        status: z
            .union([z.string(), z.number()])
            .optional()
            .transform((v) =>
                v === undefined ? undefined : String(v)
            ),
        phone: z.string().nullable().optional(),
        /** API : 0 | 1 ou booléen */
        auto_renew: z
            .union([z.boolean(), z.number()])
            .optional()
            .transform((v) => {
                if (v === undefined) return undefined;
                if (typeof v === "boolean") return v;
                return v !== 0;
            }),
        client_name: z.string().nullable().optional(),
        /** Présent sur les listes / détails enrichis */
        client: z
            .object({
                id: idLike.optional(),
                name: z.string().optional(),
                phone: z.string().nullable().optional(),
                email: z.string().optional(),
            })
            .passthrough()
            .optional(),
    })
    .passthrough();

export const paginatedContractsSchema = z
    .object({
        /** Laravel / anciens payloads */
        data: z.array(contractResponseSchema).optional(),
        /** Réponses API actuelles */
        items: z.array(contractResponseSchema).optional(),
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
    .passthrough()
    .transform((raw) => ({
        data: raw.data ?? raw.items ?? [],
        meta: raw.meta,
    }));

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type ContractResponse = z.infer<typeof contractResponseSchema>;
