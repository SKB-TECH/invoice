import type { ContractResponse } from "@/core/schemas/contrat.schema";
import type {
    ContratDetailRecord,
    ContratListRow,
    ContratStatutForm,
} from "@/lib/contrats/contrats-data";
import { detailToContratListRow } from "@/lib/contrats/contrats-data";

export function apiStatusToContratStatut(status?: string): ContratStatutForm {
    if (!status) return "actif";
    const v = status.toLowerCase();
    if (v === "suspendu" || v === "suspended") return "suspendu";
    if (v === "complet" || v === "completed" || v === "complete") {
        return "complet";
    }
    return "actif";
}

function isoDateOnly(iso: string): string {
    return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

export function contractResponseToListRow(
    row: ContractResponse
): ContratListRow {
    return detailToContratListRow(contractResponseToDetail(row));
}

export function contractResponseToDetail(
    row: ContractResponse
): ContratDetailRecord {
    let itemsJson = "[]";
    try {
        itemsJson = JSON.stringify(row.items_template ?? [], null, 2);
    } catch {
        itemsJson = String(row.items_template ?? "");
    }

    return {
        id: row.id,
        reference: row.reference,
        nomContrat: row.title,
        clientNom: row.client_name ?? "—",
        client_id: row.client_id,
        autoRenew: Boolean(row.auto_renew),
        telephone: row.phone ?? "",
        dateDebut: isoDateOnly(row.starting),
        dateFin: isoDateOnly(row.ending),
        valeur: Number(row.total),
        monthly: Number(row.monthly),
        paid: Number(row.paid),
        currency: row.currency,
        billing_cycle: row.billing_cycle,
        items_template_json: itemsJson,
        statut: apiStatusToContratStatut(row.status),
        description: row.description ?? "",
        file_url: row.file_url ?? row.file_path ?? undefined,
    };
}
