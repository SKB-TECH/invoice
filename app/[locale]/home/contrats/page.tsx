import Link from "next/link";
import { ChevronRight, Eye, House } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  demoContrats,
  type ContratStatutUi,
} from "@/lib/contrats/contrats-data";

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

export default function ContratsPage() {
  return (
    <div className="min-h-screen text-foreground">
      <main className="mx-auto w-full min-w-full py-4">
        <span className="mb-6 flex items-center gap-1 text-sm text-slate-500">
          <Link href="/home">
            <House className="size-4" />
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-slate-800">Liste de contrats</span>
        </span>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Contrat
          </h1>
          <Button
            size="lg"
            className="h-12 w-52 cursor-pointer rounded bg-[#0073C5] px-5 text-white"
            asChild
          >
            <Link href="/home/contrats/new">Nouveau contrat</Link>
          </Button>
        </div>

        <div className="overflow-hidden border border-slate-200/80 bg-white">
          <Table>
            <TableHeader className="bg-[#F4F4F4BB]">
              <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  Titre
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  Client
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  Montant
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  Statut
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  Période
                </TableHead>
                <TableHead className="h-11 w-14 bg-slate-100 px-4 text-right text-sm font-semibold text-slate-700">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoContrats.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-slate-200 hover:bg-slate-50/80"
                >
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.titre}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.client}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.montant}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatutBadge statut={row.statut} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.periode}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" asChild className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                      <Link
                        href={`/home/contrats/${encodeURIComponent(row.id)}`}
                        aria-label="Détails du contrat"
                      >
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
