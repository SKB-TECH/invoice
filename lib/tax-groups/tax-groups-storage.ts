/** Groupes de taxation (démo : persistance `localStorage`, à remplacer par l’API). */

import { REFERENCE_TAX_GROUPS } from "./default-reference-tax-groups";
import type { TaxGroup } from "./types";

export type { TaxGroup } from "./types";

export const TAX_GROUPS_STORAGE_KEY = "ikwook.taxGroups.v2";
export const TAX_GROUPS_CHANGED_EVENT = "ikwook-tax-groups-changed";

/** Groupes définition issus du référentiel réglementaire (A–P) — non supprimables dans l’UI. */
export const BUILTIN_TAX_GROUP_IDS = new Set(
  REFERENCE_TAX_GROUPS.map((g) => g.id)
);

export const DEFAULT_TAX_GROUPS: readonly TaxGroup[] = REFERENCE_TAX_GROUPS;

function cloneDefaults(): TaxGroup[] {
  return DEFAULT_TAX_GROUPS.map((g) => ({ ...g }));
}

/** Repli lecture-only (SSR) : même ordre que la référence. */
function groupById(id: string): TaxGroup | undefined {
  return REFERENCE_TAX_GROUPS.find((g) => g.id === id);
}

function normalizeGroup(raw: Record<string, unknown>): TaxGroup | null {
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!id) return null;
  const ref = groupById(id);
  const name = typeof raw.name === "string" ? raw.name : ref?.name ?? "";
  const code = typeof raw.code === "string" ? raw.code : ref?.code ?? "";
  const description =
    typeof raw.description === "string"
      ? raw.description
      : ref?.description ?? "";
  const comments =
    typeof raw.comments === "string" ? raw.comments : ref?.comments ?? "";
  const rateRaw = raw.ratePercent;
  const ratePercent =
    typeof rateRaw === "number" && Number.isFinite(rateRaw)
      ? rateRaw
      : (ref?.ratePercent ?? 0);
  const active =
    typeof raw.active === "boolean" ? raw.active : (ref?.active ?? true);

  return {
    id,
    name,
    code,
    description,
    comments,
    ratePercent,
    active,
  };
}

export function readTaxGroups(): TaxGroup[] {
  if (typeof window === "undefined") return cloneDefaults();

  try {
    const raw = window.localStorage.getItem(TAX_GROUPS_STORAGE_KEY);
    if (!raw) {
      const initial = cloneDefaults();
      window.localStorage.setItem(
        TAX_GROUPS_STORAGE_KEY,
        JSON.stringify(initial)
      );
      return initial;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = cloneDefaults();
      window.localStorage.setItem(
        TAX_GROUPS_STORAGE_KEY,
        JSON.stringify(initial)
      );
      return initial;
    }
    const normalized = parsed
      .map((row) => normalizeGroup(row as Record<string, unknown>))
      .filter((g): g is TaxGroup => g !== null);

    if (normalized.length === 0) {
      const initial = cloneDefaults();
      window.localStorage.setItem(
        TAX_GROUPS_STORAGE_KEY,
        JSON.stringify(initial)
      );
      return initial;
    }
    return normalized;
  } catch {
    return cloneDefaults();
  }
}

export function writeTaxGroups(groups: TaxGroup[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TAX_GROUPS_STORAGE_KEY, JSON.stringify(groups));
  window.dispatchEvent(new CustomEvent(TAX_GROUPS_CHANGED_EVENT));
}

export function taxGroupLabelFallback(id: string): string {
  const def = groupById(id);
  if (def) {
    return `${def.code} — ${def.name} (${def.ratePercent}\u202f%)`;
  }
  return id;
}

function formatTaxGroupNameAndRate(
  name: string,
  ratePercent: number,
  active: boolean,
): string {
  const suffix = active ? "" : " — inactif";
  return `${name} (${ratePercent}\u202f%)${suffix}`;
}

export function getTaxGroupReadableLabel(id: string): string {
  if (typeof window !== "undefined") {
    const g = readTaxGroups().find((x) => x.id === id);
    if (g) {
      return formatTaxGroupNameAndRate(g.name, g.ratePercent, g.active);
    }
  }
  const def = groupById(id);
  if (def) {
    return formatTaxGroupNameAndRate(def.name, def.ratePercent, true);
  }
  return id;
}

export function getTaxGroupDisplayLabel(
  id: string,
  opts?: { includeCode?: boolean },
): string {
  const includeCode = opts?.includeCode ?? true;
  if (typeof window !== "undefined") {
    const g = readTaxGroups().find((x) => x.id === id);
    if (g) {
      if (!includeCode) {
        return formatTaxGroupNameAndRate(g.name, g.ratePercent, g.active);
      }
      const suffix = g.active ? "" : " — inactif";
      return `${g.code} — ${g.name} (${g.ratePercent}\u202f%)${suffix}`;
    }
  }
  if (!includeCode) {
    return getTaxGroupReadableLabel(id);
  }
  return taxGroupLabelFallback(id);
}

export function formatTaxGroupOptionLabel(
  g: TaxGroup,
  opts?: { showInactive?: boolean }
): string {
  const showInactive = opts?.showInactive ?? false;
  const suffix = !g.active && showInactive ? " — inactif" : "";
  return `${g.name} - ${g.ratePercent}%${suffix}`;
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
