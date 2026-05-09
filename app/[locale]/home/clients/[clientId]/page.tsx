import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { VisualiserClientActions } from "@/components/clients/visualiser-client-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  clientStatutToUi,
  getClientDetailById,
  type ClientStatutUi,
} from "@/lib/clients/clients-data";

type PageProps = {
  params: Promise<{ clientId: string }>;
};

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

function typeLibelle(mode: string): string {
  return mode === "recurrent" ? "Récurrent" : "Ponctuel";
}

export default async function VisualiserClientPage({ params }: PageProps) {
  const { clientId } = await params;
  const decoded = decodeURIComponent(clientId);
  const client = getClientDetailById(decoded);
  if (!client) {
    notFound();
  }

  const basePath = `/home/clients/${encodeURIComponent(client.id)}`;
  const statutUi = clientStatutToUi(client.statut);

  return (
    <main className="mx-auto w-full min-w-full py-4 text-foreground">
      <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link href="/home">
          <House className="size-4" />
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <Link href="/home/clients" className="hover:text-slate-700">
          Clients
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <Link href="/home/clients" className="hover:text-slate-700">
          Visualiser
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <span className="max-w-[12rem] truncate text-slate-600 sm:max-w-md">
          {client.nomClient}
        </span>
      </span>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Détail du client
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Réf.&nbsp;
            <span className="font-medium text-slate-800">
              {client.reference}
            </span>
          </p>
        </div>
      </div>

      <section className="rounded border border-slate-200/80 bg-white p-6 sm:p-8">
        <dl className="grid gap-8 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nom client
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {client.nomClient}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sous-titre
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {client.sousTitre}
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
              Type de client
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {typeLibelle(client.typeClient)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              NIF
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {client.nif || "—"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              RCCM
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {client.rccm}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Téléphone
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {client.telephone || "—"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {client.email || "—"}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Adresse
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {client.adresse || "—"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pays
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {client.pays || "—"}
            </dd>
          </div>
        </dl>

        <VisualiserClientActions modifierPath={`${basePath}/modifier`} />
      </section>
    </main>
  );
}
