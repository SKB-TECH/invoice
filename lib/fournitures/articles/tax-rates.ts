import { readTaxGroups } from "@/lib/tax-groups/tax-groups-storage";

/** Taux historiques utilisés en repli si le stockage n’est pas encore lu (SSR / pas de groupe). */
export const ARTICLE_TAX_RATES = {
  "tva-standard": 0.16,
  "tva-reduit": 0.08,
  exo: 0,
} as const satisfies Record<string, number>;

export type ArticleGroupeTaxKey = keyof typeof ARTICLE_TAX_RATES;

/** Taux décimal (0.16 pour 16 %) selon le groupe configuré ou les constantes de repli. */
export function resolveTaxRateDecimal(taxGroupId: string): number {
  if (typeof window !== "undefined") {
    const g = readTaxGroups().find((x) => x.id === taxGroupId);
    if (g) return Math.max(0, g.ratePercent) / 100;
  }
  const legacy = ARTICLE_TAX_RATES[taxGroupId as keyof typeof ARTICLE_TAX_RATES];
  if (legacy !== undefined) return legacy;
  return 0;
}
