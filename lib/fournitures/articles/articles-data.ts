import type { ArticleRowStatus, ArticleTableRow } from "@/components/articles/types";
import { getTaxGroupDisplayLabel } from "@/lib/tax-groups/tax-groups-storage";

const groupLabel: Record<string, string> = {
  a: "A",
  b: "B",
  c: "C",
};

export type ArticleDetailRecord = {
  idIkwook: string;
  title: string;
  description: string;
  groupe: "a" | "b" | "c";
  code: string;
  prixHt: number;
  prixTtc: number;
  devise: "usd" | "cdf" | "eur";
  /** Identifiant du groupe (défauts : `tva-standard`, `tva-reduit`, `exo`, ou id créé en configuration). */
  groupeTax: string;
  prixSpecial: number | null;
  pieceUnite: "piece" | "kg" | "heure" | "forfait";
  unite: string;
  status: ArticleRowStatus;
  /** yyyy-MM-dd */
  period: string;
};

/** Libellés pour affichage (liste / fiche lecture). */
export function formatGroupeTaxLibelle(key: string): string {
  return getTaxGroupDisplayLabel(key);
}

export function formatDeviseLibelle(code: ArticleDetailRecord["devise"]): string {
  return code.toUpperCase();
}

const DETAILS: ArticleDetailRecord[] = [
  {
    idIkwook: "IK0215A",
    title: "Maintenance Applicative",
    description:
      "Maintenance corrective et évolutive de l’application métier, astreinte et mises à jour de sécurité incluses.",
    groupe: "a",
    code: "MA-IK0215",
    prixHt: 8620.69,
    prixTtc: 10000,
    devise: "usd",
    groupeTax: "tva-standard",
    prixSpecial: null,
    pieceUnite: "heure",
    unite: "h",
    status: "suspendu",
    period: "2026-05-12",
  },
  {
    idIkwook: "IK02162A",
    title: "Installation API",
    description:
      "Mise en place et configuration des points d’accès API, environnements de test et documentation d’intégration.",
    groupe: "a",
    code: "API-IK2162",
    prixHt: 9259.26,
    prixTtc: 10000,
    devise: "usd",
    groupeTax: "tva-reduit",
    prixSpecial: 9500,
    pieceUnite: "forfait",
    unite: "",
    status: "actif",
    period: "2026-05-12",
  },
  {
    idIkwook: "IK0234A",
    title: "Maintenance applicatif",
    description:
      "Support applicatif : diagnostic, correctifs mineurs et coordination avec l’équipe infrastructure.",
    groupe: "b",
    code: "MNT-IK0234",
    prixHt: 10000,
    prixTtc: 10000,
    devise: "eur",
    groupeTax: "exo",
    prixSpecial: null,
    pieceUnite: "piece",
    unite: "u",
    status: "complet",
    period: "2026-05-12",
  },
  {
    idIkwook: "IK0955A",
    title: "Maintenance applicatif",
    description:
      "Forfait mensuel de supervision et d’interventions planifiées sur le parc logiciel associé.",
    groupe: "a",
    code: "MNT-IK0955",
    prixHt: 8620.69,
    prixTtc: 10000,
    devise: "cdf",
    groupeTax: "tva-standard",
    prixSpecial: null,
    pieceUnite: "kg",
    unite: "kg",
    status: "complet",
    period: "2026-05-12",
  },
  {
    idIkwook: "IK0455A",
    title: "Maintenance applicatif",
    description:
      "Assistance technique niveau 2, revue de logs et rapports d’incident pour les applications internes.",
    groupe: "c",
    code: "MNT-IK0455",
    prixHt: 9259.26,
    prixTtc: 10000,
    devise: "usd",
    groupeTax: "tva-reduit",
    prixSpecial: null,
    pieceUnite: "piece",
    unite: "",
    status: "actif",
    period: "2026-05-12",
  },
];

export function detailToTableRow(row: ArticleDetailRecord): ArticleTableRow {
  return {
    idIkwook: row.idIkwook,
    title: row.title,
    group: groupLabel[row.groupe] ?? row.groupe,
    priceTtc: `${row.prixTtc.toLocaleString("fr-FR")} $`,
    status: row.status,
    period: row.period.split("-").reverse().join("-"),
  };
}

export const demoArticles: ArticleTableRow[] = DETAILS.map(detailToTableRow);

export function getArticleDetailById(id: string): ArticleDetailRecord | undefined {
  const key = decodeURIComponent(id);
  return DETAILS.find((d) => d.idIkwook === key);
}
