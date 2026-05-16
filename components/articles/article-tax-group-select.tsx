"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type ChangeEvent } from "react";
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
  value?: string;
  onValueChange?: (next: string) => void;
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
  value,
  onValueChange,
  includeInactiveIds,
}: Props) {
  const t = useTranslations("articles.create");
  const [groups, setGroups] = useState<TaxGroup[]>([]);
  const controlled = value !== undefined;

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
      {...(controlled
        ? {
            value,
            onChange: (e: ChangeEvent<HTMLSelectElement>) =>
              onValueChange?.(e.target.value),
          }
        : { defaultValue })}
      className={className}
      aria-label={t("taxGroupSelectAria")}
    >
      <option value="" disabled>
        {t("selectPlaceholder")}
      </option>
      {options.map((g) => (
        <option key={g.id} value={g.id}>
          {formatTaxGroupOptionLabel(g, { showInactive: true })}
        </option>
      ))}
    </select>
  );
}
