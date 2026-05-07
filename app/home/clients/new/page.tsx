import Link from "next/link"
import { Calendar, ChevronRight, House } from "lucide-react"

import { Navbar } from "@/components/shared/OtherComponents/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function NouveauClientPage() {
  return (
    <main className="mx-auto w-full min-w-full text-foreground">
        <span className="flex items-center gap-1 text-sm text-slate-500 mb-6">
            <Link href="/home"> <House className="size-4" /> </Link>
            <ChevronRight className="size-4" /> Clients
            <ChevronRight className="size-4" />Nouveau
        </span>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Nouveau Client
        </h1>

        <form
          className="rounded border border-slate-200/80 bg-white p-6 sm:p-8"
          action="#"
          method="post"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nom-client" className="font-medium text-slate-700">
                Nom client <span className="text-red-500">*</span>
              </Label>
              <Input id="nom-client" name="nomClient" required={true} className="h-12 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sous-titre" className="font-medium text-slate-700">
                Sous titre <span className="text-red-500">*</span>
              </Label>
              <Input id="sous-titre" name="sousTitre" required={true} className="h-12 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="nif" className="font-medium text-slate-700">
                Numéro impôt/NIF
              </Label>
              <Input id="nif" name="nif" className="h-12 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="avenant-id" className="font-medium text-slate-700">
                RCCM
              </Label>
              <Input id="avenant-id" name="avenantContratId" className="h-12 rounded" required={true} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="telephone" className="font-medium text-slate-700">
                Téléphone
              </Label>
              <Input id="telephone" name="telephone" type="tel" className="h-12 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="font-medium text-slate-700">
                Email
              </Label>
              <Input id="email" name="email" type="email" className="h-12 rounded" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="adresse" className="font-medium text-slate-700">
                Adresse
              </Label>
              <Input id="adresse" name="adresse" type="text" className="h-12 rounded" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pays" className="font-medium text-slate-700">
                Pays
              </Label>
              <Input id="pays" name="pays" type="text" className="h-12 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="statut" className="font-medium text-slate-700">
                Statut
              </Label>
              <select name="statut" defaultValue="actif" className="h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4" required={true}>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
                <option value="complet">Complet</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="statut" className="font-medium text-slate-700">
                Type de client
              </Label>
              <select name="typeClient" defaultValue="ponctuel" className="h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4" required={true}>
                <option value="ponctuel">Ponctuel</option>
                <option value="recurrent">Récurrent</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row flex-wrap md:justify-end gap-3 border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="secondary"
              className="h-12 w-52 rounded bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80 cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="h-12 w-52 rounded bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8] cursor-pointer"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </main>
  )
}
