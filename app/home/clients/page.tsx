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

type ClientRow = {
  id: number
  reference: string
  titre: string
  type: string
  nif: string
  statut: Statut
  telephone: string
}

const clients: ClientRow[] = [
  {
    id: 1,
    reference: "1234567890",
    titre: "Rawbank",
    type: "Entreprise",
    nif: "1234567890",
    statut: "Actif",
    telephone: "078 000 0000",
  },
  {
    id: 2,
    reference: "1234567890",
    titre: "Rawbank",
    type: "Entreprise",
    nif: "1234567890",
    statut: "Suspendu",
    telephone: "078 000 0000",
  },
  {
    id: 3,
    reference: "1234567890",
    titre: "Rawbank",
    type: "Entreprise",
    nif: "1234567890",
    statut: "Complet",
    telephone: "078 000 0000",
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

export default function ClientsPage() {
  return (
    <main className="mx-auto w-full min-w-full py-4 text-foreground">
      <span className="flex items-center gap-1 text-sm text-slate-500 mb-6">
        <Link href="/home"> <House className="size-4" /> </Link>
          <ChevronRight className="size-4" /> Clients
          <ChevronRight className="size-4" />Visualiser
      </span>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Clients
          </h1>
          <Button
            size="lg"
            className="h-12 rounded bg-[#0879bd] px-5 w-52 text-white cursor-pointer"
          >
            <Link href="/home/clients/new">Nouveau client</Link>
          </Button>
        </div>

        <div className="overflow-hidden border border-slate-200/80 bg-white">
          <Table>
            <TableHeader className="bg-[#F4F4F4BB]">
              <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  N° Référence
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  Titre
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  Type
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  NIF
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  Statut
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                    Téléphone
                </TableHead>
                <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-slate-200 hover:bg-slate-50/80"
                >
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.reference}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.titre}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.nif}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    <StatutBadge statut={row.statut} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-800">
                    {row.telephone}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                      aria-label="Détails du client"
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
  )
}
