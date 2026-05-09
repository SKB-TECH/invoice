import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { ContratForm } from "@/components/contrats/contrat-form";
import { getContratDetailById } from "@/lib/contrats/contrats-data";

type PageProps = {
  params: Promise<{ contratId: string }>;
};

export default async function ModifierContratPage({ params }: PageProps) {
  const { contratId } = await params;
  const decoded = decodeURIComponent(contratId);
  const contrat = getContratDetailById(decoded);
  if (!contrat) {
    notFound();
  }

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
        variant="edit"
        initial={contrat}
        cancelHref={basePath}
      />
    </main>
  );
}
