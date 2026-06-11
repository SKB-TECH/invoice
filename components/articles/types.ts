export type ArticleRowStatus = "suspendu" | "actif" | "complet";

export type ArticleTableRow = {
    id: number;
    navigationId: string;
    code: string;
    title: string;
    referential: string;
    taxGroup: string;
    priceHt: string;
    priceTtc: string;
    status: ArticleRowStatus;
    period: string;
};
