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
import { cn } from "@/lib/utils"

const textareaClassName = cn(
  "flex min-h-[120px] w-full resize-y rounded border border-input bg-transparent px-2.5 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
)

function DateField({
  id,
  label,
}: {
  id: string
  label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-medium text-slate-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="date"
          className="h-9 pr-9 rounded [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <Calendar
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
    </div>
  )
}

export default function NouveauClientPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] text-foreground">

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
              <Label htmlFor="reference" className="font-medium text-slate-700">
                Numéro Référence <span className="text-red-500">*</span>
              </Label>
              <Input id="reference" name="reference" required={true} className="h-9 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="nom-contrat" className="font-medium text-slate-700">
                Nom contrat <span className="text-red-500">*</span>
              </Label>
              <Input id="nom-contrat" name="nomContrat" required={true} className="h-9 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="id-ikwook" className="font-medium text-slate-700">
                iD iKwook
              </Label>
              <Input id="id-ikwook" name="idIKwook" className="h-9 rounded" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="avenant-id" className="font-medium text-slate-700">
                Avenant contrat ID <span className="text-red-500">*</span>
              </Label>
              <Input id="avenant-id" name="avenantContratId" className="h-9 rounded" required={true} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="auto-renew" className="font-medium text-slate-700">
                Auto renew <span className="text-red-500">*</span>
              </Label>
              <Select name="autoRenew" required={true}>
                <SelectTrigger id="auto-renew" className="h-9 w-full rounded">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent className="rounded">
                  <SelectItem className="rounded" value="oui">Oui</SelectItem>
                  <SelectItem className="rounded" value="non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="telephone" className="font-medium text-slate-700">
                Téléphone
              </Label>
              <Input id="telephone" name="telephone" type="tel" className="h-9 rounded" />
            </div>

            <DateField id="date-debut" label="Date de debut" />
            <DateField id="date-fin" label="Date de fin" />

            <div className="flex flex-col gap-2">
              <Label htmlFor="valeur" className="font-medium text-slate-700">
                Valeur du Contrat<span className="text-red-500">*</span>
              </Label>
              <Input
                id="valeur"
                name="valeur"
                inputMode="decimal"
                required={true}
                placeholder="Ex: 10,000"
                className="h-9 rounded"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="statut" className="font-medium text-slate-700">
                Statut<span className="text-red-500">*</span>
              </Label>
              <Select name="statut" defaultValue="actif" required={true}>
                <SelectTrigger id="statut" className="h-9 w-full rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded">
                  <SelectItem className="rounded" value="actif">Actif</SelectItem>
                  <SelectItem className="rounded" value="suspendu">Suspendu</SelectItem>
                  <SelectItem className="rounded" value="complet">Complet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="description" className="font-medium text-slate-700">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className={`${textareaClassName} rounded`}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row flex-wrap md:justify-end gap-3 border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="secondary"
              className="h-9 w-52 rounded bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80 cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="h-9 w-52 rounded bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8] cursor-pointer"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
