"use client";

import { useEffect, useState } from "react";
import {
  getTaxGroupDisplayLabel,
  taxGroupLabelFallback,
  TAX_GROUPS_CHANGED_EVENT,
} from "@/lib/tax-groups/tax-groups-storage";

type Props = {
  taxGroupId: string;
};

/** Affiche le libellé du groupe fiscal (lecture du stockage côté client après hydratation). */
export function ArticleTaxGroupLabel({ taxGroupId }: Props) {
  const [label, setLabel] = useState(() => taxGroupLabelFallback(taxGroupId));

  useEffect(() => {
    const sync = () => setLabel(getTaxGroupDisplayLabel(taxGroupId));
    sync();
    window.addEventListener(TAX_GROUPS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(TAX_GROUPS_CHANGED_EVENT, sync);
  }, [taxGroupId]);

  return <>{label}</>;
}
