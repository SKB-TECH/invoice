export type ClientStatutForm = "actif" | "suspendu" | "complet";

export type ClientTypeForm = "ponctuel" | "recurrent";

export type ClientStatutUi = "Suspendu" | "Actif" | "Complet";

export type ClientDetailRecord = {
  id: string;
  reference: string;
  nomClient: string;
  sousTitre: string;
  nif: string;
  rccm: string;
  telephone: string;
  email: string;
  adresse: string;
  pays: string;
  statut: ClientStatutForm;
  typeClient: ClientTypeForm;
};

const DETAILS: ClientDetailRecord[] = [
  {
    id: "1",
    reference: "1234567890",
    nomClient: "Rawbank",
    sousTitre: " siège social Kinshasa",
    nif: "1234567890",
    rccm: "RCCM/CD/KIN/RCCM/789",
    telephone: "078 000 0001",
    email: "contact@rawbank.cd",
    adresse: "Avenue Colonel Mondjiba",
    pays: "RDC",
    statut: "actif",
    typeClient: "recurrent",
  },
  {
    id: "2",
    reference: "2345678901",
    nomClient: "Rawbank",
    sousTitre: " agence Lukunga",
    nif: "2345678901",
    rccm: "RCCM/CD/KIN/RCCM/790",
    telephone: "078 000 0002",
    email: "lukunga@rawbank.cd",
    adresse: "Boulevard du 30 juin",
    pays: "RDC",
    statut: "suspendu",
    typeClient: "ponctuel",
  },
  {
    id: "3",
    reference: "3456789012",
    nomClient: "Rawbank",
    sousTitre: " périmètre Gombe",
    nif: "3456789012",
    rccm: "RCCM/CD/KIN/RCCM/791",
    telephone: "078 000 0003",
    email: "gombe@rawbank.cd",
    adresse: "Gombe, Kinshasa",
    pays: "RDC",
    statut: "complet",
    typeClient: "recurrent",
  },
];

export type ClientListRow = {
  id: string;
  reference: string;
  titre: string;
  type: string;
  nif: string;
  statut: ClientStatutUi;
  telephone: string;
};

function typeFormToUi(t: ClientTypeForm): string {
  return t === "recurrent" ? "Entreprise" : "Ponctuel";
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
    titre: row.nomClient,
    type: typeFormToUi(row.typeClient),
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
