"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { VisualiserContratActions } from "@/components/contrats/visualiser-contrat-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    contratStatutToUi,
    type ContratStatutUi,
} from "@/lib/contrats/contrats-data";
import { contractResponseToDetail } from "@/lib/contrats/contrat-api-mapper";
import { useContract } from "@/core/hooks/contrat/useContrat";
import { billingCycleFromApi, billingCycleLabelFr } from "@/core/schemas/contrat.schema";
import { ENV } from "@/core/constants/env";

function StatutBadge({ statut }: { statut: ContratStatutUi }) {
    const styles: Record<ContratStatutUi, string> = {
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

function formatMontant(n: number): string {
    return n.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDateFr(iso: string): string {
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
}

function resolvePublicFileUrl(path?: string): string | undefined {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const base = ENV.FILES_BASE_URL.replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return base ? `${base}${p}` : p;
}

export default function VisualiserContratPage() {
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
                <p className="text-destructive">
                    Contrat introuvable ou erreur de chargement.
                </p>
                <Link href="/home/contrats" className="mt-4 inline-block text-[#0073C5]">
                    Retour à la liste
                </Link>
            </main>
        );
    }

    const contrat = contractResponseToDetail(data);
    const basePath = `/home/contrats/${encodeURIComponent(contrat.id)}`;
    const statutUi = contratStatutToUi(contrat.statut);
    const fichierUrl = resolvePublicFileUrl(contrat.file_url);

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
                <span className="max-w-[12rem] truncate text-slate-600 sm:max-w-md">
                    {contrat.nomContrat}
                </span>
            </span>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                        Détail du contrat
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Réf.&nbsp;
                        <span className="font-medium text-slate-800">
                            {contrat.reference}
                        </span>
                    </p>
                </div>
            </div>

            <section className="rounded border border-slate-200/80 bg-white p-6 sm:p-8">
                <dl className="grid gap-8 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Nom du contrat
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {contrat.nomContrat}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Client
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {contrat.clientNom}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Statut
                        </dt>
                        <dd className="mt-2">
                            <StatutBadge statut={statutUi} />
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Rénouvellement automatique
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {contrat.autoRenew ? "Oui" : "Non"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Téléphone
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {contrat.telephone || "—"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Devise
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {contrat.currency}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Montant total
                        </dt>
                        <dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">
                            {formatMontant(contrat.valeur)} {contrat.currency}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Mensuel / Payé
                        </dt>
                        <dd className="mt-1 text-base font-medium tabular-nums text-slate-900">
                            {formatMontant(contrat.monthly)} /{" "}
                            {formatMontant(contrat.paid)} {contrat.currency}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Cycle de facturation
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {billingCycleLabelFr(
                                billingCycleFromApi(contrat.billing_cycle)
                            )}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Date de début
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {formatDateFr(contrat.dateDebut)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Date de fin
                        </dt>
                        <dd className="mt-1 text-base font-medium text-slate-900">
                            {formatDateFr(contrat.dateFin)}
                        </dd>
                    </div>

                    {fichierUrl ? (
                        <div className="sm:col-span-2">
                            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Document
                            </dt>
                            <dd className="mt-2">
                                <a
                                    href={fichierUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#0073C5] underline hover:text-[#066aa8]"
                                >
                                    Ouvrir le fichier
                                </a>
                            </dd>
                        </div>
                    ) : null}

                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Description
                        </dt>
                        <dd className="mt-2 rounded border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-800">
                            {contrat.description || "—"}
                        </dd>
                    </div>
                </dl>

                <VisualiserContratActions
                    contractId={contrat.id}
                    modifierPath={`${basePath}/modifier`}
                />
            </section>
        </main>
    );
}
