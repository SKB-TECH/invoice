"use client";

import Link from "next/link";

import type { ClientDetailRecord } from "@/lib/clients/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

const selectClassName =
  "h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

type ClientFormBase = {
  cancelHref: string;
};

type ClientFormCreateProps = ClientFormBase & {
  variant: "create";
};

type ClientFormEditProps = ClientFormBase & {
  variant: "edit";
  initial: ClientDetailRecord;
};

export type ClientFormProps = ClientFormCreateProps | ClientFormEditProps;

export function ClientForm(props: ClientFormProps) {
  const cancelHref = props.cancelHref;
  const t = useTranslations("clients.createClient.form");
  const defaults =
    props.variant === "edit"
      ? {
          reference: props.initial.reference,
          nomClient: props.initial.nomClient,
          sousTitre: props.initial.sousTitre,
          nif: props.initial.nif,
          rccm: props.initial.rccm,
          telephone: props.initial.telephone,
          email: props.initial.email,
          adresse: props.initial.adresse,
          pays: props.initial.pays,
          statut: props.initial.statut,
          typeClient: props.initial.typeClient,
        }
      : null;

  return (
    <form
      className="rounded border border-slate-200/80 bg-white p-6 sm:p-8"
      action="#"
      method="post"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="reference" className="font-medium text-slate-700">
            {t("reference")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="reference"
            name="reference"
            required
            defaultValue={defaults?.reference}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nom-client" className="font-medium text-slate-700">
            {t("nom")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nom-client"
            name="nomClient"
            required
            defaultValue={defaults?.nomClient}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="sous-titre" className="font-medium text-slate-700">
            {t("sousTitre")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sous-titre"
            name="sousTitre"
            required
            defaultValue={defaults?.sousTitre}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nif" className="font-medium text-slate-700">
            {t("nif")}
          </Label>
          <Input
            id="nif"
            name="nif"
            defaultValue={defaults?.nif}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rccm" className="font-medium text-slate-700">
            {t("rccm")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="rccm"
            name="rccm"
            required
            defaultValue={defaults?.rccm}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="telephone" className="font-medium text-slate-700">
            {t("tel")}
          </Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            defaultValue={defaults?.telephone}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="font-medium text-slate-700">
            {t("email")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaults?.email}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="adresse" className="font-medium text-slate-700">
            {t("adresse")}
          </Label>
          <Input
            id="adresse"
            name="adresse"
            type="text"
            defaultValue={defaults?.adresse}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="pays" className="font-medium text-slate-700">
            {t("pays")}
          </Label>
          <Input
            id="pays"
            name="pays"
            type="text"
            defaultValue={defaults?.pays}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="statut" className="font-medium text-slate-700">
            {t("status.title")}
          </Label>
          <select
            id="statut"
            name="statut"
            defaultValue={defaults?.statut ?? "actif"}
            className={selectClassName}
            required
          >
            <option value="actif">{t("status.options.actif")}</option>
            <option value="suspendu">{t("status.options.suspendu")}</option>
            <option value="complet">{t("status.options.complet")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="type-client" className="font-medium text-slate-700">
            {t("type.title")}
          </Label>
          <select
            id="type-client"
            name="typeClient"
            defaultValue={defaults?.typeClient ?? "ponctuel"}
            className={selectClassName}
            required
          >
            <option value="ponctuel">{t("type.options.ponctuel")}</option>
            <option value="recurrent">{t("type.options.recurrent")}</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-col flex-wrap gap-3 border-t border-slate-100 pt-6 md:flex-row md:justify-end">
        <Link href={cancelHref}>
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-52 cursor-pointer rounded bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80"
          >
            {t("annule")}
          </Button>
        </Link>
        <Button
          type="submit"
          className="h-12 w-52 cursor-pointer rounded bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
        >
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
