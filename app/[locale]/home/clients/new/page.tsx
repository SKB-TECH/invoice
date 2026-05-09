import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

import { ClientForm } from "@/components/clients/client-form";

export default function NouveauClientPage() {
  return (
    <main className="mx-auto w-full min-w-full text-foreground">
      <span className="mb-6 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/home">
          <House className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/home/clients" className="hover:text-slate-700">
          Clients
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-slate-800">Nouveau</span>
      </span>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
        Nouveau Client
      </h1>

      <ClientForm variant="create" cancelHref="/home/clients" />
    </main>
  );
}
