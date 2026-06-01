import { z } from "zod";

const idLike = z.union([z.string(), z.number()]).transform(String);

const telLike = z.union([z.string(), z.number()]).transform(String);

export function normalizeCountryInput(raw: unknown): unknown {
    if (raw === null || typeof raw !== "object") {
        return raw;
    }

    const r = { ...(raw as Record<string, unknown>) };

    if (r.id !== undefined && r.id !== null) {
        r.id = String(r.id);
    }

    if (r.tel !== undefined && r.tel !== null) {
        r.tel = String(r.tel);
    }

    if (typeof r.code === "string") {
        r.code = r.code.trim().toUpperCase();
    }

    return r;
}

export const countrySchema = z.preprocess(
    normalizeCountryInput,
    z
        .object({
            id: idLike,
            code: z.string().min(1),
            name: z.string().min(1),
            fullname: z.string().optional().nullable(),
            tel: telLike,
        })
        .passthrough()
);

export type Country = z.infer<typeof countrySchema>;

export const countriesListSchema = z.array(countrySchema);

/** Valeur stockée dans le formulaire client et envoyée à l’API (`country`). */
export function countryFormValue(country: Country): string {
    return country.id;
}

export function findCountryByValue(
    countries: readonly Country[],
    value: string | null | undefined
): Country | undefined {
    const normalized = (value ?? "").trim();
    if (!normalized) return undefined;

    return countries.find(
        (country) =>
            country.id === normalized ||
            country.tel === normalized ||
            country.code.toUpperCase() === normalized.toUpperCase()
    );
}

export function formatCountryLabel(country: Country): string {
    return country.name;
}

export function resolveCountryDisplay(
    countries: readonly Country[],
    value: string | null | undefined
): string {
    const trimmed = (value ?? "").trim();
    if (!trimmed) return "";

    const match = findCountryByValue(countries, trimmed);
    return match ? formatCountryLabel(match) : trimmed;
}

export function sortCountriesByName(
    countries: readonly Country[]
): Country[] {
    return [...countries].sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
    );
}
