import Link from "next/link"
import { ChevronRight, Eye, House } from "lucide-react"

import { Navbar } from "@/components/shared/OtherComponents/Navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type Statut = "Suspendu" | "Actif" | "Complet"

type ContratRow = {
  titre: string
  client: string
  montant: string
  statut: Statut
  periode: string
}

const contrats: ContratRow[] = [
  {
    titre: "Maintenance Applicative",
    client: "Rawbank",
    montant: "10,000 $",
    statut: "Suspendu",
    periode: "12-05-2026",
  },
  {
    titre: "Installation API",
    client: "Rawbank",
    montant: "10,000 $",
    statut: "Actif",
    periode: "12-05-2026",
  },
  {
    titre: "Maintenance applicatif",
    client: "EquityBCDC",
    montant: "10,000 $",
    statut: "Complet",
    periode: "12-05-2026",
  },
  {
    titre: "Support niveau 2",
    client: "StandardBank",
    montant: "10,000 $",
    statut: "Actif",
    periode: "12-05-2026",
  },
  {
    titre: "Audit sécurité",
    client: "Castillo",
    montant: "10,000 $",
    statut: "Suspendu",
    periode: "12-05-2026",
  },
]

function StatutBadge({ statut }: { statut: Statut }) {
  const styles: Record<Statut, string> = {
    Suspendu: "border-transparent bg-[#FCF5E5] text-[#E8BC52] hover:bg-[#FCF5E5]",
    Actif: "border-transparent bg-[#E8EFFB] text-[#6691E7] hover:bg-[#E8EFFB]",
    Complet: "border-transparent bg-[#DCF6E9] text-[#13C56B] hover:bg-[#DCF6E9]",
  }

  return (
    <Badge
      variant="outline"
      className={cn("rounded px-2.5 font-medium", styles[statut])}
    >
      {statut}
    </Badge>
  )
}

export default function ContratsPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <span className="flex items-center gap-1 text-sm text-slate-500 mb-6">
            <Link href="/home"> <House className="size-4" /> </Link>
            <ChevronRight className="size-4" /> Contrats
            <ChevronRight className="size-4" />Visualiser
        </span>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Contrat
          </h1>
          <Button
            size="lg"
            className="rounded bg-[#0879bd] px-5 w-52 text-white cursor-pointer"
          >
            <Link href="/contrats/new">Nouveau contrat</Link>
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
              {contrats.map((row) => (
                <TableRow
                  key={`${row.titre}-${row.client}-${row.periode}`}
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                      aria-label="Détails du contrat"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
