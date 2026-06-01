export type ClientCountry = {
    /** Indicatif téléphonique / code attendu par l’API (ex. 243). */
    code: string;
    name: string;
    iso: string;
};

/** Liste des pays (indicatif numérique + libellé FR). */
export const CLIENT_COUNTRIES: readonly ClientCountry[] = [
    { code: "213", name: "Algérie", iso: "DZ" },
    { code: "244", name: "Angola", iso: "AO" },
    { code: "966", name: "Arabie saoudite", iso: "SA" },
    { code: "54", name: "Argentine", iso: "AR" },
    { code: "61", name: "Australie", iso: "AU" },
    { code: "43", name: "Autriche", iso: "AT" },
    { code: "32", name: "Belgique", iso: "BE" },
    { code: "229", name: "Bénin", iso: "BJ" },
    { code: "267", name: "Botswana", iso: "BW" },
    { code: "55", name: "Brésil", iso: "BR" },
    { code: "257", name: "Burundi", iso: "BI" },
    { code: "237", name: "Cameroun", iso: "CM" },
    { code: "1", name: "Canada", iso: "CA" },
    { code: "238", name: "Cap-Vert", iso: "CV" },
    { code: "236", name: "Centrafrique", iso: "CF" },
    { code: "86", name: "Chine", iso: "CN" },
    { code: "57", name: "Colombie", iso: "CO" },
    { code: "242", name: "Congo", iso: "CG" },
    { code: "243", name: "République démocratique du Congo", iso: "CD" },
    { code: "225", name: "Côte d'Ivoire", iso: "CI" },
    { code: "45", name: "Danemark", iso: "DK" },
    { code: "971", name: "Émirats arabes unis", iso: "AE" },
    { code: "20", name: "Égypte", iso: "EG" },
    { code: "34", name: "Espagne", iso: "ES" },
    { code: "1", name: "États-Unis", iso: "US" },
    { code: "251", name: "Éthiopie", iso: "ET" },
    { code: "358", name: "Finlande", iso: "FI" },
    { code: "33", name: "France", iso: "FR" },
    { code: "241", name: "Gabon", iso: "GA" },
    { code: "220", name: "Gambie", iso: "GM" },
    { code: "233", name: "Ghana", iso: "GH" },
    { code: "30", name: "Grèce", iso: "GR" },
    { code: "224", name: "Guinée", iso: "GN" },
    { code: "245", name: "Guinée-Bissau", iso: "GW" },
    { code: "91", name: "Inde", iso: "IN" },
    { code: "353", name: "Irlande", iso: "IE" },
    { code: "39", name: "Italie", iso: "IT" },
    { code: "81", name: "Japon", iso: "JP" },
    { code: "254", name: "Kenya", iso: "KE" },
    { code: "266", name: "Lesotho", iso: "LS" },
    { code: "231", name: "Libéria", iso: "LR" },
    { code: "218", name: "Libye", iso: "LY" },
    { code: "261", name: "Madagascar", iso: "MG" },
    { code: "265", name: "Malawi", iso: "MW" },
    { code: "60", name: "Malaisie", iso: "MY" },
    { code: "223", name: "Mali", iso: "ML" },
    { code: "212", name: "Maroc", iso: "MA" },
    { code: "230", name: "Maurice", iso: "MU" },
    { code: "222", name: "Mauritanie", iso: "MR" },
    { code: "52", name: "Mexique", iso: "MX" },
    { code: "258", name: "Mozambique", iso: "MZ" },
    { code: "264", name: "Namibie", iso: "NA" },
    { code: "227", name: "Niger", iso: "NE" },
    { code: "234", name: "Nigeria", iso: "NG" },
    { code: "47", name: "Norvège", iso: "NO" },
    { code: "64", name: "Nouvelle-Zélande", iso: "NZ" },
    { code: "31", name: "Pays-Bas", iso: "NL" },
    { code: "351", name: "Portugal", iso: "PT" },
    { code: "974", name: "Qatar", iso: "QA" },
    { code: "44", name: "Royaume-Uni", iso: "GB" },
    { code: "250", name: "Rwanda", iso: "RW" },
    { code: "221", name: "Sénégal", iso: "SN" },
    { code: "27", name: "Afrique du Sud", iso: "ZA" },
    { code: "41", name: "Suisse", iso: "CH" },
    { code: "249", name: "Soudan", iso: "SD" },
    { code: "211", name: "Soudan du Sud", iso: "SS" },
    { code: "46", name: "Suède", iso: "SE" },
    { code: "268", name: "Eswatini", iso: "SZ" },
    { code: "255", name: "Tanzanie", iso: "TZ" },
    { code: "235", name: "Tchad", iso: "TD" },
    { code: "228", name: "Togo", iso: "TG" },
    { code: "216", name: "Tunisie", iso: "TN" },
    { code: "90", name: "Turquie", iso: "TR" },
    { code: "256", name: "Ouganda", iso: "UG" },
    { code: "260", name: "Zambie", iso: "ZM" },
    { code: "263", name: "Zimbabwe", iso: "ZW" },
].sort((a, b) => a.name.localeCompare(b.name, "fr"));

export function findCountryByCode(code: string): ClientCountry | undefined {
    const normalized = code.trim();
    if (!normalized) return undefined;
    return CLIENT_COUNTRIES.find((country) => country.code === normalized);
}

export function formatCountryLabel(country: ClientCountry): string {
    return `${country.name}`;
}

export function resolveCountryDisplay(code: string | null | undefined): string {
    const trimmed = (code ?? "").trim();
    if (!trimmed) return "";
    const match = findCountryByCode(trimmed);
    return match ? formatCountryLabel(match) : trimmed;
}
