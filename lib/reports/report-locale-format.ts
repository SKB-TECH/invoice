const DEFAULT_LOCALE = "fr-FR";

const LOCALE_MAP: Record<string, string> = {
    fr: "fr-FR",
    en: "en-GB",
    ln: "fr-FR",
};

export function resolveReportLocale(locale?: string): string {
    if (!locale?.trim()) return DEFAULT_LOCALE;
    return LOCALE_MAP[locale] ?? DEFAULT_LOCALE;
}

export function formatReportDateLabel(
    value: string | undefined,
    locale?: string,
): string {
    if (!value?.trim()) return "—";

    const parsed = new Date(`${value.trim()}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat(resolveReportLocale(locale), {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(parsed);
}

export function formatReportDateTime(
    value: string,
    locale?: string,
): string {
    if (value === "—") return value;

    const parsed = new Date(value.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat(resolveReportLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
}

export function formatReportAmount(
    amount: string,
    locale?: string,
): string {
    if (amount === "—") return amount;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return amount;

    return numericAmount.toLocaleString(resolveReportLocale(locale), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/** React-PDF affiche mal les espaces fines Unicode des montants localisés (ex. 3 480 → 3/480). */
export function sanitizePdfText(text: string): string {
    return text.replace(/[\u202f\u00a0]/g, " ");
}

export function formatReportAmountForPdf(
    amount: string,
    locale?: string,
): string {
    return sanitizePdfText(formatReportAmount(amount, locale));
}

export function formatReportGeneratedAt(
    date = new Date(),
    locale?: string,
): string {
    return new Intl.DateTimeFormat(resolveReportLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}
