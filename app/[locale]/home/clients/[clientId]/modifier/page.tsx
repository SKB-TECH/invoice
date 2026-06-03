"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import { clientResponseToDetail } from "@/lib/clients/client-api-mapper";
import { useClient } from "@/core/hooks/client/useClient";

export default function ModifierClientPage() {
    const params = useParams();
    const clientId = decodeURIComponent(String(params.clientId ?? ""));
    const t = useTranslations("clients.editClient");
    const tList = useTranslations("clients.listClients");
    const tNavbar = useTranslations("navbar");
    const { data, isPending, isError, refetch } = useClient(clientId);

    if (isPending) {
        return (
            <main className="relative w-full text-slate-700">
                <p className="text-sm font-medium text-slate-500">
                    {t("loading")}
                </p>
            </main>
        );
    }

    if (isError || !data) {
        return (
            <main className="relative w-full text-slate-700">
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
                <Link
                    href={basePath}
                    className="max-w-48 truncate hover:text-slate-600 sm:max-w-md"
                >
                    {client.nomClient}
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-600">
                    {t("breadcrumbStep")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {t("title")}
            </h1>
            <p className="mt-2 text-[17px] font-medium text-slate-500">
                {t("idnatLabel")}
                {"\u00a0"}
                <span className="text-slate-700">{client.idnat || "—"}</span>
            </p>

            <ClientForm variant="edit" initial={client} cancelHref={basePath} />
        </main>
    );
}
