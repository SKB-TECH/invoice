import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

import { ClientForm } from "@/components/clients/client-form";
import { getClientDetailById } from "@/lib/clients/clients-data";

type PageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function ModifierClientPage({ params }: PageProps) {
  const { clientId } = await params;
  const decoded = decodeURIComponent(clientId);
  const client = getClientDetailById(decoded);
  if (!client) {
    notFound();
  }

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
