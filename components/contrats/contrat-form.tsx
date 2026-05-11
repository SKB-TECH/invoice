"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

import type { ContratDetailRecord } from "@/lib/contrats/contrats-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const textareaClassName = cn(
  "flex min-h-[120px] w-full resize-y rounded border border-input bg-transparent px-2.5 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
);

const selectClassName = cn(
  "h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
);

type ContratFormBase = {
  cancelHref: string;
  /**
   * Si vrai : refuse l’envoi lorsque les deux dates sont renseignées et identiques
   * (toast d’erreur, position gérée par le Toaster racine : top-right).
   */
  validateContractDatesDistinct?: boolean;
};

type ContratFormCreateProps = ContratFormBase & {
  variant: "create";
};

type ContratFormEditProps = ContratFormBase & {
  variant: "edit";
  initial: ContratDetailRecord;
};

export type ContratFormProps = ContratFormCreateProps | ContratFormEditProps;

function DateField({
  id,
  label,
  name,
  defaultValue,
  required,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-medium text-slate-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type="date"
          required={required}
          defaultValue={defaultValue}
          className="h-12 rounded pr-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <Calendar
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function ContratForm(props: ContratFormProps) {
  const t = useTranslations("contrats.createContrat");
  const cancelHref = props.cancelHref;
  const validateContractDatesDistinct =
    props.validateContractDatesDistinct === true;

  const defaultReference =
    props.variant === "edit" ? props.initial.reference : undefined;

  const defaultNomContrat =
    props.variant === "edit" ? props.initial.nomContrat : undefined;

  const defaultAutoRenew =
    props.variant === "edit"
      ? props.initial.autoRenew
        ? "oui"
        : "non"
      : undefined;

  const defaultTelephone =
    props.variant === "edit" ? props.initial.telephone : undefined;

  const defaultDateDebut =
    props.variant === "edit" ? props.initial.dateDebut : undefined;

  const defaultDateFin =
    props.variant === "edit" ? props.initial.dateFin : undefined;

  const defaultValeur =
    props.variant === "edit" ? String(props.initial.valeur) : undefined;

  const defaultStatut =
    props.variant === "edit" ? props.initial.statut : "actif";

  const defaultDescription =
    props.variant === "edit" ? props.initial.description : undefined;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateContractDatesDistinct) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const dateDebut = String(fd.get("dateDebut") ?? "").trim();
    const dateFin = String(fd.get("dateFin") ?? "").trim();
    if (dateDebut !== "" && dateFin !== "" && dateDebut === dateFin) {
      e.preventDefault();
      toast.error(
        "La date de début et la date de fin du contrat doivent être différentes.",
      );
    }
  };

  return (
    <form
      className="rounded border border-slate-200/80 bg-white p-6 sm:p-8"
      action="#"
      method="post"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="reference" className="font-medium text-slate-700">
            {t("form.reference")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="reference"
            name="reference"
            required
            defaultValue={defaultReference}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nom-contrat" className="font-medium text-slate-700">
            {t("form.nom")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nom-contrat"
            name="nomContrat"
            required
            defaultValue={defaultNomContrat}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="auto-renew" className="font-medium text-slate-700">
            {t("form.auto-renew.title")} <span className="text-red-500">*</span>
          </Label>
          <select
            id="auto-renew"
            name="autoRenew"
            defaultValue={defaultAutoRenew ?? "oui"}
            className={selectClassName}
            required
          >
            <option value="oui">{t("form.auto-renew.options.oui")}</option>
            <option value="non">{t("form.auto-renew.options.non")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="telephone" className="font-medium text-slate-700">
            {t("form.tel")}
          </Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            defaultValue={defaultTelephone}
            className="h-12 rounded"
          />
        </div>

        <DateField
          id="date-debut"
          name="dateDebut"
          label={t("form.dateStart")}
          defaultValue={defaultDateDebut}
          required={validateContractDatesDistinct}
        />
        <DateField
          id="date-fin"
          name="dateFin"
          label={t("form.dateEnd")}
          defaultValue={defaultDateFin}
          required={validateContractDatesDistinct}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="valeur" className="font-medium text-slate-700">
            {t("form.valeur")}<span className="text-red-500">*</span>
          </Label>
          <Input
            id="valeur"
            name="valeur"
            inputMode="decimal"
            required
            placeholder="Ex: 10,000"
            defaultValue={defaultValeur}
            className="h-12 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="statut" className="font-medium text-slate-700">
            {t("form.status.title")}<span className="text-red-500">*</span>
          </Label>
          <select
            id="statut"
            name="statut"
            defaultValue={defaultStatut}
            className={selectClassName}
            required
          >
            <option value="actif">{t("form.status.options.actif")}</option>
            <option value="suspendu">{t("form.status.options.suspendu")}</option>
            <option value="complet">{t("form.status.options.complet")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="description" className="font-medium text-slate-700">
            {t("form.description")}
          </Label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={defaultDescription}
            className={cn(textareaClassName, "rounded")}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col flex-wrap gap-3 border-t border-slate-100 pt-6 md:flex-row md:justify-end">
        <Link href={cancelHref}>
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-52 rounded bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80 cursor-pointer"
          >
            {t("cancel")}
          </Button>
        </Link>
        <Button
          type="submit"
          className="h-12 w-52 rounded bg-[#0073C5] px-5 text-white shadow-none hover:bg-[#066aa8] cursor-pointer"
        >
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
