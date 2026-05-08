import { REFERENCE_TAX_GROUPS } from "@/lib/tax-groups/default-reference-tax-groups";
import { readTaxGroups } from "@/lib/tax-groups/tax-groups-storage";

/** Taux SSR / repli : référentiel A–P + anciennes clés démo. */
const REFERENCE_DECIMALS: Record<string, number> = Object.fromEntries(
  REFERENCE_TAX_GROUPS.map((g) => [g.id, g.ratePercent / 100])
);

const LEGACY_ARTICLE_TAX_RATES: Record<string, number> = {
  "tva-standard": 0.16,
  /** Ancienne étiquette démo ; le référentiel groupe C est à 5 %. */
  "tva-reduit": 0.05,
  exo: 0,
};

/** Taux connus */
export const ARTICLE_TAX_RATES = {
  ...REFERENCE_DECIMALS,
  ...LEGACY_ARTICLE_TAX_RATES,
} as const satisfies Record<string, number>;

export type ArticleGroupeTaxKey = keyof typeof ARTICLE_TAX_RATES;

/** Taux décimal (0.16 pour 16 %) selon le groupe configuré ou les constantes de repli. */
export function resolveTaxRateDecimal(taxGroupId: string): number {
  if (typeof window !== "undefined") {
    const g = readTaxGroups().find((x) => x.id === taxGroupId);
    if (g) return Math.max(0, g.ratePercent) / 100;
  }
  const fallback =
    REFERENCE_DECIMALS[taxGroupId] ?? LEGACY_ARTICLE_TAX_RATES[taxGroupId];
  if (fallback !== undefined) return fallback;
  return 0;
}
