export type ArticleRowStatus = "suspendu" | "actif" | "complet";

export type ArticleTableRow = {
  idIkwook: string;
  title: string;
  group: string;
  priceTtc: string;
  status: ArticleRowStatus;
  period: string;
};
