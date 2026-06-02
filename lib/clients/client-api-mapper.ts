import type { ClientResponse } from "@/core/schemas/client.schema";
import type {
    ClientDetailRecord,
    ClientListRow,
    ClientStatutForm,
} from "@/lib/clients/clients-data";
import {
    clientStatutToUi,
    clientTypeLibelle,
} from "@/lib/clients/clients-data";

export function apiStatusToClientStatut(status: string): ClientStatutForm {
    const v = status.toLowerCase();
    if (v === "suspendu" || v === "suspended") return "suspendu";
    if (v === "complet" || v === "completed" || v === "complete") {
        return "complet";
    }
    return "actif";
}

function clientDisplayName(row: ClientResponse): string {
    return (
        row.client_name?.trim() ||
        row.company_name?.trim() ||
        [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
        row.idnat?.trim() ||
        row.reference
    );
}

function clientReference(row: ClientResponse): string {
    return row.idnat?.trim() || row.reference;
}

export function clientResponseToListRow(row: ClientResponse): ClientListRow {
    const code =
        row.client_type_code?.trim() || row.code?.trim() || "";

    return {
        id: row.id,
        reference: clientReference(row),
        code,
        titre: clientDisplayName(row),
        type: clientTypeLibelle(row.client_type ?? ""),
        nif: row.nif ?? "",
        statut: clientStatutToUi(apiStatusToClientStatut(row.status)),
        telephone: row.phone ?? "",
    };
}

export function clientResponseToDetail(row: ClientResponse): ClientDetailRecord {
    const nom = clientDisplayName(row);

    return {
        id: row.id,
        client_type_id: row.client_type_id ?? "",
        code: row.client_type_code?.trim() || row.code?.trim() || "",
        reference: clientReference(row),
        reference_document: row.reference_document ?? "",
        nomClient: nom,
        sousTitre: row.subtitle ?? "",
        nif: row.nif ?? "",
        rccm: row.rccm ?? "",
        telephone: row.phone ?? "",
        email: row.email ?? "",
        adresse: row.address ?? "",
        pays: row.country ?? "",
        statut: apiStatusToClientStatut(row.status),
        client_type: row.client_type ?? "",
        business_sector: row.business_sector ?? "",
        first_name: row.first_name ?? "",
        last_name: row.last_name ?? "",
        legal_representative: row.legal_representative ?? "",
    };
}
