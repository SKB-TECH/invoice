import type { ClientType } from "@/core/schemas/client.schema";

export type ClientStatutForm = "actif" | "suspendu" | "complet";

/** @deprecated Ancien modèle UI — conservé pour compatibilité lecture */
export type ClientTypeForm = "ponctuel" | "recurrent";

export type ClientStatutUi = "Suspendu" | "Actif" | "Complet";

export type ClientDetailRecord = {
    id: string;
    client_type_id: string;
    code: string;
    reference: string;
    reference_document: string;
    nomClient: string;
    sousTitre: string;
    nif: string;
    rccm: string;
    telephone: string;
    email: string;
    adresse: string;
    pays: string;
    statut: ClientStatutForm;
    client_type: ClientType;
    business_sector: string;
    first_name: string;
    last_name: string;
    legal_representative: string;
};

const DETAILS: ClientDetailRecord[] = [
    {
        id: "1",
        client_type_id: "2",
        code: "1234567890",
        reference: "1234567890",
        reference_document: "",
        nomClient: "Rawbank",
        sousTitre: " siège social Kinshasa",
        nif: "1234567890",
        rccm: "RCCM/CD/KIN/RCCM/789",
        telephone: "078 000 0001",
        email: "contact@rawbank.cd",
        adresse: "Avenue Colonel Mondjiba",
        pays: "RDC",
        statut: "actif",
        client_type: "corporate",
        business_sector: "Banque",
        first_name: "",
        last_name: "",
        legal_representative: "",
    },
    {
        id: "2",
        client_type_id: "2",
        code: "2345678901",
        reference: "2345678901",
        reference_document: "",
        nomClient: "Rawbank",
        sousTitre: " agence Lukunga",
        nif: "2345678901",
        rccm: "RCCM/CD/KIN/RCCM/790",
        telephone: "078 000 0002",
        email: "lukunga@rawbank.cd",
        adresse: "Boulevard du 30 juin",
        pays: "RDC",
        statut: "suspendu",
        client_type: "pme",
        business_sector: "Services financiers",
        first_name: "",
        last_name: "",
        legal_representative: "",
    },
    {
        id: "3",
        client_type_id: "1",
        code: "3456789012",
        reference: "",
        reference_document: "",
        nomClient: "Jean Dupont",
        sousTitre: "",
        nif: "",
        rccm: "",
        telephone: "078 000 0003",
        email: "jean.dupont@example.cd",
        adresse: "Gombe, Kinshasa",
        pays: "RDC",
        statut: "complet",
        client_type: "personal",
        business_sector: "",
        first_name: "Jean",
        last_name: "Dupont",
        legal_representative: "",
    },
];

export type ClientListRow = {
    id: string;
    reference: string;
    code: string;
    titre: string;
    type: string;
    nif: string;
    statut: ClientStatutUi;
    telephone: string;
};

export function clientTypeLibelle(t: ClientType): string {
    const key = t.trim().toLowerCase();
    if (key === "personal" || key === "pp") return "Personne physique";
    if (key === "pme") return "PME";
    if (key === "corporate" || key === "pm") return "Personne morale";
    return t.trim() || "—";
}

export function clientStatutToUi(s: ClientStatutForm): ClientStatutUi {
    if (s === "suspendu") return "Suspendu";
    if (s === "complet") return "Complet";
    return "Actif";
}

export function detailToClientListRow(row: ClientDetailRecord): ClientListRow {
    return {
        id: row.id,
        reference: row.reference,
        code: row.code,
        titre: row.nomClient,
        type: clientTypeLibelle(row.client_type),
        nif: row.nif,
        statut: clientStatutToUi(row.statut),
        telephone: row.telephone,
    };
}

export const demoClients: ClientListRow[] = DETAILS.map(detailToClientListRow);

export function getClientDetailById(
    id: string
): ClientDetailRecord | undefined {
    const key = decodeURIComponent(id);
    return DETAILS.find((d) => d.id === key);
}
