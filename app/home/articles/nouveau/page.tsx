"use client";
import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArticleTaxGroupSelect } from "@/components/fournitures/articles/article-tax-group-select";
import { useRouter } from "next/navigation";

const selectClass =
  "h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export default function NouvelArticlePage() {
  const router = useRouter();
  return (
    <main className="mx-auto w-full min-w-full text-foreground">
      <span className="mb-6 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/home">
          <House className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link
          href="/home/articles"
          className="hover:text-slate-700"
        >
          Articles
        </Link>
        <ChevronRight className="size-4" />
        Nouveau
      </span>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
        Nouvel article
      </h1>

      <form
        className="rounded-none border border-slate-200/80 bg-white p-6 sm:p-8"
        action="#"
        method="post"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nom" className="font-medium text-slate-700">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input id="nom" name="nom" required className="h-12 rounded-none" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="code" className="font-medium text-slate-700">
              Code <span className="text-red-500">*</span>
            </Label>
            <Input id="code" name="code" required className="h-12 rounded-none" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="prix-ht" className="font-medium text-slate-700">
              Prix HT <span className="text-red-500">*</span>
            </Label>
            <Input
              id="prix-ht"
              name="prixHt"
              inputMode="decimal"
              required
              placeholder="Ex: 10 000"
              className="h-12 rounded-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="prix-ttc" className="font-medium text-slate-700">
              Prix TTC <span className="text-red-500">*</span>
            </Label>
            <Input
              id="prix-ttc"
              name="prixTtc"
              inputMode="decimal"
              required
              placeholder="Ex: 11 800"
              className="h-12 rounded-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="devise" className="font-medium text-slate-700">
              Devise <span className="text-red-500">*</span>
            </Label>
            <select
              id="devise"
              name="devise"
              defaultValue=""
              required
              className={selectClass}
            >
              <option value="" disabled>
                Sélectionner
              </option>
              <option value="usd">USD</option>
              <option value="cdf">CDF</option>
              <option value="eur">EUR</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="groupe-tax" className="font-medium text-slate-700">
              Groupe de tax <span className="text-red-500">*</span>
            </Label>
            <ArticleTaxGroupSelect
              id="groupe-tax"
              name="groupeTax"
              required
              defaultValue=""
              className={selectClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="prix-special" className="font-medium text-slate-700">
              Prix spécial / Promotion
            </Label>
            <Input
              id="prix-special"
              name="prixSpecial"
              inputMode="decimal"
              placeholder="Facultatif"
              className="h-12 rounded-none"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Label htmlFor="piece-unite" className="font-medium text-slate-700">
                Pièce / Unité
              </Label>
              <select
                id="piece-unite"
                name="pieceUnite"
                defaultValue="piece"
                className={selectClass}
              >
                <option value="piece">Pièce</option>
                <option value="kg">Kg</option>
                <option value="heure">Heure</option>
                <option value="forfait">Forfait</option>
              </select>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-[7.5rem] sm:shrink-0">
              <Label htmlFor="unite" className="font-medium text-slate-700">
                Unité
              </Label>
              <Input id="unite" name="unite" className="h-12 rounded-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="groupe" className="font-medium text-slate-700">
              Groupe <span className="text-red-500">*</span>
            </Label>
            <select
              id="groupe"
              name="groupe"
              defaultValue=""
              required
              className={selectClass}
            >
              <option value="" disabled>
                Sélectionner
              </option>
              <option value="a">Groupe A</option>
              <option value="b">Groupe B</option>
              <option value="c">Groupe C</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 md:flex-row md:flex-wrap md:justify-end">
          <Button
          onClick={() => router.push("/home/articles")}
            type="button"
            variant="secondary"
            className="h-12 w-52 cursor-pointer rounded-none bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="h-12 w-52 cursor-pointer rounded-none bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </main>
  );
}
