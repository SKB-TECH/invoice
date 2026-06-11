import type { ArticleRowStatus } from "@/components/articles/types";
import { getTaxGroupDisplayLabel } from "@/lib/tax-groups/tax-groups-storage";

export type ArticleDetailRecord = {
  idIkwook: string;
  title: string;
  description: string;
  groupe: "a" | "b" | "c";
  code: string;
  prixHt: number;
  prixTtc: number;
  devise: "usd" | "cdf" | "eur";
  groupeTax: string;
  prixSpecial: number | null;
  pieceUnite: "piece" | "kg" | "heure" | "forfait";
  unite: string;
  status: ArticleRowStatus;
  period: string;
};

export function formatGroupeTaxLibelle(key: string): string {
  return getTaxGroupDisplayLabel(key);
}

export function formatDeviseLibelle(code: ArticleDetailRecord["devise"]): string {
  return code.toUpperCase();
}
