import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { VisualiserContratActions } from "@/components/contrats/visualiser-contrat-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  contratStatutToUi,
  getContratDetailById,
  type ContratStatutUi,
} from "@/lib/contrats/contrats-data";

type PageProps = {
  params: Promise<{ contratId: string }>;
};

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

export default async function VisualiserContratPage({ params }: PageProps) {
  const { contratId } = await params;
  const decoded = decodeURIComponent(contratId);
  const contrat = getContratDetailById(decoded);
  if (!contrat) {
    notFound();
  }

  const basePath = `/home/contrats/${encodeURIComponent(contrat.id)}`;
  const statutUi = contratStatutToUi(contrat.statut);

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
              Valeur du contrat
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">
              {formatMontant(contrat.valeur)} $
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

          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </dt>
            <dd className="mt-2 rounded border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-800">
              {contrat.description || "—"}
            </dd>
          </div>
        </dl>

        <VisualiserContratActions modifierPath={`${basePath}/modifier`} />
      </section>
    </main>
  );
}
