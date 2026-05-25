"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { VisualiserClientActions } from "@/components/clients/visualiser-client-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FieldLabel,
    ReadOnlyField,
} from "@/components/invoices/create/Fields";
import { cn } from "@/lib/utils";
import {
    clientStatutToUi,
    clientTypeLibelle,
    type ClientStatutUi,
} from "@/lib/clients/clients-data";
import { clientResponseToDetail } from "@/lib/clients/client-api-mapper";
import { useClient } from "@/core/hooks/client/useClient";

function StatutBadge({ statut }: { statut: ClientStatutUi }) {
    const styles: Record<ClientStatutUi, string> = {
        Suspendu:
            "border-transparent bg-[#FCF5E5] text-[#E8BC52] hover:bg-[#FCF5E5]",
        Actif: "border-transparent bg-[#E8EFFB] text-[#6691E7] hover:bg-[#E8EFFB]",
        Complet:
            "border-transparent bg-[#DCF6E9] text-[#13C56B] hover:bg-[#DCF6E9]",
    };

    return (
        <Badge
            variant="outline"
            className={cn("rounded px-2.5 font-medium", styles[statut])}
        >
            {statut}
        </Badge>
    );
}

export default function VisualiserClientPage() {
    const params = useParams();
    const clientId = decodeURIComponent(String(params.clientId ?? ""));
    const t = useTranslations("clients.view");
    const tList = useTranslations("clients.listClients");
    const tNavbar = useTranslations("navbar");
    const { data, isPending, isError, refetch } = useClient(clientId);

    if (isPending) {
        return (
            <main className="w-full text-slate-700">
                <p className="text-sm font-medium text-slate-500">
                    {t("loading")}
                </p>
            </main>
        );
    }

    if (isError || !data) {
        return (
            <main className="w-full text-slate-700">
                <p className="text-sm font-medium text-red-500">
                    {t("loadError")}
                </p>
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-3"
                    onClick={() => refetch()}
                >
                    {t("retry")}
                </Button>
                <Link
                    href="/home/clients"
                    className="mt-4 block text-[#0879bd]"
                >
                    {t("backToList")}
                </Link>
            </main>
        );
    }

    const client = clientResponseToDetail(data);
    const basePath = `/home/clients/${encodeURIComponent(client.id)}`;
    const statutUi = clientStatutToUi(client.statut);
    const isPersonal = client.client_type === "personal";
    const isCompany =
        client.client_type === "pme" || client.client_type === "corporate";

    return (
        <main className="relative w-full text-slate-700">
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                <span>/</span>
                <Link href="/home/clients" className="hover:text-slate-600">
                    {tList("title")}
                </Link>
                <span>/</span>
                <span className="max-w-48 truncate text-slate-600 sm:max-w-md">
                    {client.nomClient}
                </span>
                <span>/</span>
                <span className="font-semibold text-slate-600">
                    {tNavbar("Visualiser")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {client.nomClient}
            </h1>
            <p className="mt-2 text-[17px] font-medium text-slate-500">
                {t("fields.idnat")}
                {"\u00a0"}
                <span className="text-slate-700">{client.reference || "—"}</span>
            </p>

            <div className="mt-4 bg-white p-8">
                <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                    <div className="min-w-0">
                        <FieldLabel>{t("fields.clientType")}</FieldLabel>
                        <ReadOnlyField>
                            {clientTypeLibelle(client.client_type)}
                        </ReadOnlyField>
                    </div>

                    <div className="min-w-0">
                        <FieldLabel>{t("fields.idnat")}</FieldLabel>
                        <ReadOnlyField>{client.reference || "—"}</ReadOnlyField>
                    </div>

                    {isPersonal ? (
                        <>
                            <div className="min-w-0">
                                <FieldLabel>{t("fields.firstName")}</FieldLabel>
                                <ReadOnlyField>
                                    {client.first_name || "—"}
                                </ReadOnlyField>
                            </div>
                            <div className="min-w-0">
                                <FieldLabel>{t("fields.lastName")}</FieldLabel>
                                <ReadOnlyField>
                                    {client.last_name || "—"}
                                </ReadOnlyField>
                            </div>
                        </>
                    ) : null}

                    {isCompany ? (
                        <div className="min-w-0 lg:col-span-2">
                            <FieldLabel>{t("fields.displayName")}</FieldLabel>
                            <ReadOnlyField>{client.nomClient}</ReadOnlyField>
                        </div>
                    ) : null}

                    {isCompany ? (
                        <>
                            <div className="min-w-0">
                                <FieldLabel>{t("fields.nif")}</FieldLabel>
                                <ReadOnlyField>
                                    {client.nif || "—"}
                                </ReadOnlyField>
                            </div>
                            <div className="min-w-0">
                                <FieldLabel>{t("fields.rccm")}</FieldLabel>
                                <ReadOnlyField>
                                    {client.rccm || "—"}
                                </ReadOnlyField>
                            </div>
                        </>
                    ) : null}

                    <div className="min-w-0">
                        <FieldLabel>{t("fields.phone")}</FieldLabel>
                        <ReadOnlyField>
                            {client.telephone || "—"}
                        </ReadOnlyField>
                    </div>

                    <div className="min-w-0">
                        <FieldLabel>{t("fields.email")}</FieldLabel>
                        <ReadOnlyField>{client.email || "—"}</ReadOnlyField>
                    </div>

                    <div className="min-w-0">
                        <FieldLabel>{t("fields.status")}</FieldLabel>
                        <ReadOnlyField className="border-0 bg-transparent px-0">
                            <StatutBadge statut={statutUi} />
                        </ReadOnlyField>
                    </div>
                </div>

                <VisualiserClientActions
                    clientId={client.id}
                    modifierPath={`${basePath}/modifier`}
                />
            </div>
        </main>
    );
}
