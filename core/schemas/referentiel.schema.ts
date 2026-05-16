import { z } from "zod";

export const referentielPostPayloadSchema = z.object({
    referentiel: z.string(),
    title: z.string(),
    description: z.string(),
    code: z.string(),
    parent_id: z.number(),
});

export type ReferentielPostPayload = z.infer<
    typeof referentielPostPayloadSchema
>;

export const referentielRecordSchema = z.object({
    id: z.coerce.number(),
    referentiel: z.string(),
    title: z.string(),
    description: z
        .union([z.string(), z.null()])
        .transform((v) => v ?? ""),
    code: z.string(),
    parent_id: z.coerce.number().catch(0),
});

export type ReferentielRecord = z.infer<typeof referentielRecordSchema>;
