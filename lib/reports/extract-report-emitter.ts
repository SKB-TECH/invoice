type ProfileLike = Record<string, unknown> | null | undefined;

function pickString(source: ProfileLike, keys: string[]): string {
    if (!source) return "—";

    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "—";
}

export function extractReportEmitter(
    profile: ProfileLike,
    user?: ProfileLike,
): {
    companyName: string;
    nif: string;
    isf: string;
} {
    return {
        companyName: pickString(profile, [
            "company_name",
            "legal_name",
            "name",
        ]) !== "—"
            ? pickString(profile, ["company_name", "legal_name", "name"])
            : pickString(user, ["company_name", "legal_name", "name"]),
        nif:
            pickString(profile, ["nif", "vat_num"]) !== "—"
                ? pickString(profile, ["nif", "vat_num"])
                : pickString(user, ["nif", "vat_num"]),
        isf:
            pickString(profile, ["isf", "fiscal_id", "fiscal_system_id"]) !==
            "—"
                ? pickString(profile, ["isf", "fiscal_id", "fiscal_system_id"])
                : pickString(user, ["isf", "fiscal_id", "fiscal_system_id"]),
    };
}
