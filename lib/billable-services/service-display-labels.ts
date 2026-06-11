import type {
    BillableServiceReferentialInfo,
    BillableServiceTaxGroupInfo,
} from "@/core/types/billable-service";
import { formatInvoiceTaxGroupSelectLabel } from "@/lib/tax-groups/invoice-tax-group-label";
import { formatReferentielAxisCodeLabel } from "@/lib/referentials/referential-option-label";

export function formatBillableServiceTaxGroupLabel(
    info: BillableServiceTaxGroupInfo | null | undefined,
): string {
    if (!info?.title?.trim()) return "—";

    if (typeof info.rate === "number" && Number.isFinite(info.rate)) {
        return formatInvoiceTaxGroupSelectLabel({
            title: info.title,
            rate: info.rate,
        });
    }

    return info.title.trim();
}

export function formatBillableServiceReferentialLabel(
    info: BillableServiceReferentialInfo | null | undefined,
): string {
    if (!info?.referentiel?.trim() || !info.code?.trim()) return "—";

    return formatReferentielAxisCodeLabel({
        id: info.id ?? 0,
        referentiel: info.referentiel,
        title: info.title ?? "",
        description: "",
        code: info.code,
        parent_id: info.parent_id ?? 0,
    });
}
