"use client";

import { useEffect, useState } from "react";
import {
  getTaxGroupDisplayLabel,
  TAX_GROUPS_CHANGED_EVENT,
} from "@/lib/tax-groups/tax-groups-storage";

type Props = {
  taxGroupId: string;
  includeCode?: boolean;
};

export function ArticleTaxGroupLabel({
  taxGroupId,
  includeCode = true,
}: Props) {
  const [label, setLabel] = useState(() =>
    getTaxGroupDisplayLabel(taxGroupId, { includeCode }),
  );

  useEffect(() => {
    const sync = () =>
      setLabel(getTaxGroupDisplayLabel(taxGroupId, { includeCode }));
    sync();
    window.addEventListener(TAX_GROUPS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(TAX_GROUPS_CHANGED_EVENT, sync);
  }, [taxGroupId, includeCode]);

  return <>{label}</>;
}
