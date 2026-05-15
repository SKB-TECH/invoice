"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { ClientForm } from "@/components/clients/client-form";
import { clientResponseToDetail } from "@/lib/clients/client-api-mapper";
import { useClient } from "@/core/hooks/client/useClient";

export default function ModifierClientPage() {
    const params = useParams();
    const clientId = decodeURIComponent(String(params.clientId ?? ""));
    const { data, isPending, isError } = useClient(clientId);

    if (isPending) {
        return (
            <main className="mx-auto w-full min-w-full text-foreground">
                <p className="text-slate-600">Chargement…</p>
            </main>
        );
    }

    if (isError || !data) {
        return (
            <main className="mx-auto w-full min-w-full text-foreground">
                <p className="text-destructive">Client introuvable.</p>
                <Link href="/home/clients" className="mt-4 inline-block text-[#0879bd]">
                    Retour à la liste
                </Link>
            </main>
        );
    }

    const client = clientResponseToDetail(data);
    const basePath = `/home/clients/${encodeURIComponent(client.id)}`;

    return (
        <main className="mx-auto w-full min-w-full text-foreground">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home">
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link href="/home/clients" className="hover:text-slate-700">
                    Clients
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link
                    href={basePath}
                    className="max-w-[10rem] truncate text-slate-600 hover:text-slate-800 sm:max-w-xs"
                >
                    {client.nomClient}
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                Modifier
            </span>

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Modifier le client
            </h1>
            <p className="mb-6 text-sm text-slate-600">
                Réf.&nbsp;:{" "}
                <span className="font-medium text-slate-800">{client.reference}</span>
            </p>

            <ClientForm variant="edit" initial={client} cancelHref={basePath} />
        </main>
    );
}
