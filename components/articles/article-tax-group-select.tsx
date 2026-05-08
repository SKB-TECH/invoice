"use client";

import { useEffect, useState } from "react";
import {
  formatTaxGroupOptionLabel,
  readTaxGroups,
  TAX_GROUPS_CHANGED_EVENT,
  type TaxGroup,
} from "@/lib/tax-groups/tax-groups-storage";

const selectClass =
  "h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

type Props = {
  id: string;
  name: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
  /** Pour l’édition : inclure le groupe actuel même s’il est inactif. */
  includeInactiveIds?: string[];
};

function optionList(
  groups: TaxGroup[],
  includeInactiveIds: string[] | undefined
): TaxGroup[] {
  const allow = new Set(includeInactiveIds ?? []);
  return groups.filter((g) => g.active || allow.has(g.id));
}

export function ArticleTaxGroupSelect({
  id,
  name,
  required,
  className = selectClass,
  defaultValue = "",
  includeInactiveIds,
}: Props) {
  const [groups, setGroups] = useState<TaxGroup[]>([]);

  useEffect(() => {
    const refresh = () => setGroups(readTaxGroups());
    refresh();
    window.addEventListener(TAX_GROUPS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(TAX_GROUPS_CHANGED_EVENT, refresh);
  }, []);

  const options = optionList(groups, includeInactiveIds);

  return (
    <select
      id={id}
      name={name}
      required={required}
      defaultValue={defaultValue}
      className={className}
      aria-label="Sélectionner un groupe"
    >
      <option value="" disabled>
        Sélectionner
      </option>
      {options.map((g) => (
        <option key={g.id} value={g.id}>
          {formatTaxGroupOptionLabel(g, { showInactive: true })}
        </option>
      ))}
    </select>
  );
}
