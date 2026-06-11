import { z } from "zod";

import { api } from "@/core/services/api";
import {
    countrySchema,
    sortCountriesByName,
    type Country,
} from "@/core/schemas/country.schema";
import { unwrapApiData } from "@/core/utils/apiResponse";

const COUNTRIES_PATH = "/main/countries";

function extractCountryRows(raw: unknown): unknown[] | null {
    if (Array.isArray(raw)) {
        return raw;
    }

    if (!raw || typeof raw !== "object") {
        return null;
    }

    const o = raw as Record<string, unknown>;

    for (const key of ["data", "items", "countries"] as const) {
        const value = o[key];
        if (Array.isArray(value)) {
            return value;
        }
    }

    const inner = o.data;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
        const nested = inner as Record<string, unknown>;
        if (Array.isArray(nested.data)) {
            return nested.data;
        }
    }

    return null;
}

function parseCountriesPayload(raw: unknown): Country[] {
    const direct = extractCountryRows(raw);
    if (direct) {
        return sortCountriesByName(
            direct.map((row) => countrySchema.parse(row))
        );
    }

    const parsedArray = z.array(z.unknown()).safeParse(raw);
    if (parsedArray.success) {
        return sortCountriesByName(
            parsedArray.data.map((row) => countrySchema.parse(row))
        );
    }

    const inner = unwrapApiData<unknown>(raw);
    if (inner !== raw) {
        return parseCountriesPayload(inner);
    }

    throw new Error("Format de liste des pays inconnu.");
}

export const countryService = {
    async list(): Promise<Country[]> {
        const res = await api.get(COUNTRIES_PATH);
        return parseCountriesPayload(res.data);
    },
};

export type { Country };
