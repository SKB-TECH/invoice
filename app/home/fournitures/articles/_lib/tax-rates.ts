/** Taux utilisés pour synchroniser HT ⇄ TTC (démo hors API). */
export const ARTICLE_TAX_RATES = {
  "tva-standard": 0.16,
  "tva-reduit": 0.08,
  exo: 0,
} as const satisfies Record<string, number>;

export type ArticleGroupeTaxKey = keyof typeof ARTICLE_TAX_RATES;
