"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { ContratForm } from "@/components/contrats/contrat-form";
import { contractResponseToDetail } from "@/lib/contrats/contrat-api-mapper";
import { useContract } from "@/core/hooks/contrat/useContrat";

export default function ModifierContratPage() {
    const params = useParams();
    const contratId = decodeURIComponent(String(params.contratId ?? ""));
    const { data, isPending, isError } = useContract(contratId);

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
                <p className="text-destructive">Contrat introuvable.</p>
                <Link href="/home/contrats" className="mt-4 inline-block text-[#0073C5]">
                    Retour à la liste
                </Link>
            </main>
        );
    }

    const contrat = contractResponseToDetail(data);
    const basePath = `/home/contrats/${encodeURIComponent(contrat.id)}`;

    return (
        <main className="mx-auto w-full min-w-full text-foreground">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home">
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link href="/home/contrats" className="hover:text-slate-700">
                    Liste de contrats
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link
                    href={basePath}
                    className="max-w-[10rem] truncate text-slate-600 hover:text-slate-800 sm:max-w-xs"
                >
                    {contrat.nomContrat}
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                Modifier
            </span>

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Modifier le contrat
            </h1>
            <p className="mb-6 text-sm text-slate-600">
                Réf.&nbsp;:{" "}
                <span className="font-medium text-slate-800">{contrat.reference}</span>
            </p>

            <ContratForm
                key={contrat.id}
                variant="edit"
                initial={contrat}
                cancelHref={basePath}
            />
        </main>
    );
}
