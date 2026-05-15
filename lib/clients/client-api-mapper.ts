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

export function clientResponseToListRow(row: ClientResponse): ClientListRow {
    const nom =
        row.company_name?.trim() ||
        [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
        row.reference;

    return {
        id: row.id,
        reference: row.reference,
        titre: nom,
        type: clientTypeLibelle(row.client_type),
        nif: row.nif ?? "",
        statut: clientStatutToUi(apiStatusToClientStatut(row.status)),
        telephone: row.phone ?? "",
    };
}

export function clientResponseToDetail(row: ClientResponse): ClientDetailRecord {
    const nom =
        row.company_name?.trim() ||
        [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
        row.reference;

    return {
        id: row.id,
        reference: row.reference,
        nomClient: nom,
        sousTitre: row.subtitle ?? "",
        nif: row.nif ?? "",
        rccm: row.rccm ?? "",
        telephone: row.phone ?? "",
        email: row.email ?? "",
        adresse: row.address ?? "",
        pays: row.country ?? "",
        statut: apiStatusToClientStatut(row.status),
        client_type: row.client_type,
        business_sector: row.business_sector ?? "",
        first_name: row.first_name ?? "",
        last_name: row.last_name ?? "",
        legal_representative: row.legal_representative ?? "",
    };
}
