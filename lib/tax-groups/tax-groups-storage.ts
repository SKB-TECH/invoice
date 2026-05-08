/** Groupes de taxation (démo : persistance `localStorage`, à remplacer par l’API). */

export type TaxGroup = {
  id: string;
  name: string;
  /** Taux en pourcentage (ex. 16 pour 16 %). */
  ratePercent: number;
  active: boolean;
};

export const TAX_GROUPS_STORAGE_KEY = "ikwook.taxGroups.v1";
export const TAX_GROUPS_CHANGED_EVENT = "ikwook-tax-groups-changed";

/** Identifiants réservés (démo) — non supprimables. */
export const BUILTIN_TAX_GROUP_IDS = new Set([
  "tva-standard",
  "tva-reduit",
  "exo",
]);

export const DEFAULT_TAX_GROUPS: readonly TaxGroup[] = [
  { id: "tva-standard", name: "TVA standard", ratePercent: 16, active: true },
  { id: "tva-reduit", name: "TVA réduite", ratePercent: 8, active: true },
  { id: "exo", name: "Exonéré", ratePercent: 0, active: true },
];

function cloneDefaults(): TaxGroup[] {
  return DEFAULT_TAX_GROUPS.map((g) => ({ ...g }));
}

export function readTaxGroups(): TaxGroup[] {
  if (typeof window === "undefined") return cloneDefaults();

  try {
    const raw = window.localStorage.getItem(TAX_GROUPS_STORAGE_KEY);
    if (!raw) {
      const initial = cloneDefaults();
      window.localStorage.setItem(TAX_GROUPS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = cloneDefaults();
      window.localStorage.setItem(TAX_GROUPS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed as TaxGroup[];
  } catch {
    return cloneDefaults();
  }
}

export function writeTaxGroups(groups: TaxGroup[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TAX_GROUPS_STORAGE_KEY, JSON.stringify(groups));
  window.dispatchEvent(new CustomEvent(TAX_GROUPS_CHANGED_EVENT));
}

/** Libellé hors navigateur (SSR) ou si le groupe est inconnu dans le stockage. */
export function taxGroupLabelFallback(id: string): string {
  const def = DEFAULT_TAX_GROUPS.find((g) => g.id === id);
  if (def) return `${def.name} (${def.ratePercent}\u202f%)`;
  return id;
}

export function getTaxGroupDisplayLabel(id: string): string {
  if (typeof window !== "undefined") {
    const g = readTaxGroups().find((x) => x.id === id);
    if (g) {
      const suffix = g.active ? "" : " — inactif";
      return `${g.name} (${g.ratePercent}\u202f%)${suffix}`;
    }
  }
  return taxGroupLabelFallback(id);
}

export function formatTaxGroupOptionLabel(g: TaxGroup, opts?: { showInactive?: boolean }): string {
  const showInactive = opts?.showInactive ?? false;
  const suffix = !g.active && showInactive ? " (inactif)" : "";
  return `${g.name} (${g.ratePercent}\u202f%)${suffix}`;
}

export function generateNewTaxGroupId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const slug = base || "groupe";
  return `${slug}-${Math.random().toString(36).slice(2, 8)}`;
}
