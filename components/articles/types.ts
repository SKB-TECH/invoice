export type ArticleRowStatus = "suspendu" | "actif" | "complet";

export type ArticleTableRow = {
    navigationId: string;
    code: string;
    title: string;
    referential: string;
    taxGroup: string;
    priceTtc: string;
    status: ArticleRowStatus;
    period: string;
};
