export type ContratStatutUi = "Suspendu" | "Actif" | "Complet";

export type ContratStatutForm = "actif" | "suspendu" | "complet";

export type ContratDetailRecord = {
    id: string;
    reference: string;
    nomContrat: string;
    clientNom: string;
    client_id: string;
    autoRenew: boolean;
    telephone: string;
    dateDebut: string;
    dateFin: string;
    valeur: number;
    monthly: number;
    paid: number;
    currency: string;
    billing_cycle: string;
    /** Identifiant référentiel (champ API `type`). */
    type?: number;
    items_template_json: string;
    statut: ContratStatutForm;
    description: string;
    file_url?: string;
};

const DETAILS: ContratDetailRecord[] = [
    {
        id: "CTR-001",
        reference: "REF-2026-101",
        nomContrat: "Maintenance Applicative",
        clientNom: "Rawbank",
        client_id: "1",
        autoRenew: false,
        telephone: "+243 000 000 001",
        dateDebut: "2026-01-15",
        dateFin: "2027-01-14",
        valeur: 10000,
        monthly: 800,
        paid: 2000,
        currency: "USD",
        billing_cycle: "monthly",
        items_template_json: "[]",
        statut: "suspendu",
        description:
            "Maintenance corrective et évolutive, astreinte et corrections prioritaires sur le périmètre convenu.",
    },
    {
        id: "CTR-002",
        reference: "REF-2026-102",
        nomContrat: "Installation API",
        clientNom: "Rawbank",
        client_id: "1",
        autoRenew: true,
        telephone: "+243 000 000 002",
        dateDebut: "2026-02-01",
        dateFin: "2028-02-01",
        valeur: 10000,
        monthly: 400,
        paid: 0,
        currency: "USD",
        billing_cycle: "quarterly",
        items_template_json: "[]",
        statut: "actif",
        description:
            "Mise en place des points d’accès API et documentation technique pour les intégrations partenaires.",
    },
    {
        id: "CTR-003",
        reference: "REF-2026-103",
        nomContrat: "Maintenance applicatif",
        clientNom: "EquityBCDC",
        client_id: "2",
        autoRenew: true,
        telephone: "+243 000 000 003",
        dateDebut: "2025-06-01",
        dateFin: "2026-05-31",
        valeur: 10000,
        monthly: 900,
        paid: 10000,
        currency: "USD",
        billing_cycle: "yearly",
        items_template_json: "[]",
        statut: "complet",
        description:
            "Contrat cloturé — bilan final et transfert documentation.",
    },
    {
        id: "CTR-004",
        reference: "REF-2026-104",
        nomContrat: "Support niveau 2",
        clientNom: "StandardBank",
        client_id: "2",
        autoRenew: true,
        telephone: "+243 000 000 004",
        dateDebut: "2026-03-01",
        dateFin: "2027-02-28",
        valeur: 10000,
        monthly: 500,
        paid: 1500,
        currency: "USD",
        billing_cycle: "monthly",
        items_template_json: "[]",
        statut: "actif",
        description:
            "Support technique approfondi, analyse de logs et escalade vers les équipes produit.",
    },
    {
        id: "CTR-005",
        reference: "REF-2026-105",
        nomContrat: "Audit sécurité",
        clientNom: "Castillo",
        client_id: "3",
        autoRenew: false,
        telephone: "+243 000 000 005",
        dateDebut: "2026-04-01",
        dateFin: "2027-03-31",
        valeur: 10000,
        monthly: 0,
        paid: 5000,
        currency: "USD",
        billing_cycle: "one_shot",
        items_template_json: "[]",
        statut: "suspendu",
        description:
            "Revue sécurité, tests d’intrusion légers et rapport de vulnérabilités avec plans de remediation.",
    },
];

export type ContratListRow = {
    id: string;
    titre: string;
    client: string;
    montant: string;
    statut: ContratStatutUi;
    periode: string;
};

export function contratStatutToUi(statut: ContratStatutForm): ContratStatutUi {
    if (statut === "suspendu") return "Suspendu";
    if (statut === "complet") return "Complet";
    return "Actif";
}

export function detailToContratListRow(row: ContratDetailRecord): ContratListRow {
    const parts = row.dateDebut.split("-");
    const [y1, m1, d1] = parts;
    const periode =
        parts.length >= 3 && y1 != null && m1 != null && d1 != null
            ? `${d1}-${m1}-${y1}`
            : row.dateDebut;
    return {
        id: row.id,
        titre: row.nomContrat,
        client: row.clientNom,
        montant: `${row.valeur.toLocaleString("fr-FR")} ${row.currency}`,
        statut: contratStatutToUi(row.statut),
        periode,
    };
}

export const demoContrats: ContratListRow[] =
    DETAILS.map(detailToContratListRow);

export function getContratDetailById(
    id: string
): ContratDetailRecord | undefined {
    const key = decodeURIComponent(id);
    return DETAILS.find((d) => d.id === key);
}
