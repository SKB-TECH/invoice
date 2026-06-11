export type InvoiceDashboardOverviewResponse = {
    status: "success" | "error";
    message: string;
    data: InvoiceDashboardOverviewData;
};

export type InvoiceDashboardOverviewData = {
    rappel: InvoiceDashboardReminder;
    cards: InvoiceDashboardCard[];
    suivi_tresorerie: InvoiceDashboardTreasuryTracking;
    mois_en_cours: InvoiceDashboardCurrentMonth;
    tables: InvoiceDashboardTables;
};

export type InvoiceDashboardReminder = {
    message: string;
    month: string;
    amount: number;
    currency: string;
};

export type InvoiceDashboardCardKey =
    | "annee_passee"
    | "mois_encours"
    | "normalisation_facture"
    | "statistique_facture";

export type InvoiceDashboardNormalizationCardValue = {
    normalisees: number;
    en_attente: number;
};

export type InvoiceDashboardCard = {
    key: InvoiceDashboardCardKey;
    label: string;
    value: number | InvoiceDashboardNormalizationCardValue;
    subtitle: string;
    period?: string;
};

export type InvoiceDashboardTreasuryTracking = {
    title: string;
    series: InvoiceDashboardTreasurySerie[];
};

export type InvoiceDashboardTreasurySerie = {
    month: string;
    total_facture_emise: number;
    total_revenu: number;
    total_dette: number;
};

export type InvoiceDashboardCurrentMonth = {
    title: string;
    total: number;
    items: InvoiceDashboardCurrentMonthItem[];
};

export type InvoiceDashboardCurrentMonthItem = {
    label: string;
    count: number;
    amount: number;
    currency: string;
};

export type InvoiceDashboardTables = {
    suivi_facture: InvoiceDashboardInvoiceTrackingRow[];
    normalisation_facture: InvoiceDashboardNormalizationRow[];
};

export type InvoiceDashboardInvoiceTrackingRow = {
    date: string;
    client: string;
    ref: string;
    montant: number;
    statut: string;
    creation: string;
};

export type InvoiceDashboardNormalizationRow = {
    date: string;
    client: string;
    montant: number;
    statut: string;
};
