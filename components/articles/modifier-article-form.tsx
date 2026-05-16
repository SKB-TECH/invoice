"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader/Loader";
import { useUpdateFourniture } from "@/core/hooks/fournitures/useUpdateFourniture";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";
import type {
  FournitureArticle,
  CreateFourniturePayload,
} from "@/core/types/fourniture";
import type { ArticleDetailRecord } from "@/lib/fournitures/articles/articles-data";
import {
  articleUiGroupToGroupId,
  detailPieceUniteToUnitId,
  taxGroupSlugToNumericId,
} from "@/lib/fournitures/articles/fournitures-mappers";
import { resolveTaxRateDecimal } from "@/lib/fournitures/articles/tax-rates";
import {
  formatTaxGroupOptionLabel,
  readTaxGroups,
  TAX_GROUPS_CHANGED_EVENT,
  type TaxGroup,
} from "@/lib/tax-groups/tax-groups-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ArticleRowStatus } from "@/components/articles/types";
import { useRouter } from "@/i18n/routing";

const selectClass =
  "h-12 w-full rounded-none border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

function formatMoneyFr(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function parseMoneyInput(s: string): number | null {
  const t = s.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

type ModifierArticleFormProps = {
  initial: ArticleDetailRecord;
  /** Réponse GET initiale pour réinjecter les champs absents du formulaire dans le PUT */
  apiBaseline: FournitureArticle;
};

export function ModifierArticleForm({
  initial,
  apiBaseline,
}: ModifierArticleFormProps) {
  const router = useRouter();
  const tCreate = useTranslations("articles.create");
  const tEdit = useTranslations("articles.edit");
  const tList = useTranslations("articles.list");

  const updateMutation = useUpdateFourniture({
    onSuccess: () => {
      toast.success(tEdit("toastSaved"));
      router.push(
        `/home/articles/${encodeURIComponent(initial.idIkwook)}/visualiser`
      );
    },
    onError: (error) => {
      toast.error(
        getAxiosErrorMessage(error, "Impossible de mettre à jour l’article.")
      );
    },
  });

  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>(() =>
    typeof window !== "undefined" ? readTaxGroups() : []
  );

  useEffect(() => {
    const sync = () => setTaxGroups(readTaxGroups());
    sync();
    window.addEventListener(TAX_GROUPS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(TAX_GROUPS_CHANGED_EVENT, sync);
  }, []);

  const unknownTaxGroupLabel = tEdit("unknownTaxGroupName");

  const selectableTaxGroups = useMemo(() => {
    const base = taxGroups.filter((g) => g.active || g.id === initial.groupeTax);
    const ids = new Set(base.map((g) => g.id));
    if (ids.has(initial.groupeTax)) return base;
    return [
      ...base,
      {
        id: initial.groupeTax,
        code: "?",
        name: unknownTaxGroupLabel,
        description: "",
        comments: "",
        ratePercent:
          Math.round(resolveTaxRateDecimal(initial.groupeTax) * 10000) / 100,
        active: false,
      },
    ];
  }, [taxGroups, initial.groupeTax, unknownTaxGroupLabel]);

  const [nom, setNom] = useState(initial.title);
  const [code, setCode] = useState(initial.code);
  const [description, setDescription] = useState(initial.description);
  const [prixHt, setPrixHt] = useState(formatMoneyFr(initial.prixHt));
  const [prixTtc, setPrixTtc] = useState(formatMoneyFr(initial.prixTtc));
  const [groupeTax, setGroupeTax] = useState(initial.groupeTax);
  const [devise, setDevise] = useState(initial.devise);
  const [groupe, setGroupe] = useState(initial.groupe);
  const [prixSpecial, setPrixSpecial] = useState(
    initial.prixSpecial != null ? formatMoneyFr(initial.prixSpecial) : ""
  );
  const [pieceUnite, setPieceUnite] = useState(initial.pieceUnite);
  const [unite, setUnite] = useState(initial.unite);
  const [statut, setStatut] = useState<ArticleRowStatus>(initial.status);
  const [period, setPeriod] = useState(initial.period);

  const onPrixHtChange = (value: string) => {
    setPrixHt(value);
    const ht = parseMoneyInput(value);
    if (ht !== null) {
      setPrixTtc(
        formatMoneyFr(ht * (1 + resolveTaxRateDecimal(groupeTax)))
      );
    } else {
      setPrixTtc("");
    }
  };

  const onPrixHtBlur = () => {
    const ht = parseMoneyInput(prixHt);
    if (ht !== null) {
      const formatted = formatMoneyFr(ht);
      setPrixHt(formatted);
      setPrixTtc(
        formatMoneyFr(ht * (1 + resolveTaxRateDecimal(groupeTax)))
      );
    }
  };

  const onGroupeTaxChange = (taxKey: string) => {
    setGroupeTax(taxKey);
    const ht = parseMoneyInput(prixHt);
    if (ht !== null) {
      setPrixTtc(
        formatMoneyFr(ht * (1 + resolveTaxRateDecimal(taxKey)))
      );
    }
  };

  const requiredStar = (
    <>
      {" "}
      <span className="text-red-500">*</span>
    </>
  );

  return (
    <form
      className="relative rounded-none border border-slate-200/80 bg-white p-6 sm:p-8"
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        if (updateMutation.isPending) return;

        const id = Number(initial.idIkwook);
        if (!Number.isFinite(id) || id <= 0) {
          toast.error(tCreate("invalidForm"));
          return;
        }

        const price_before = parseMoneyInput(prixHt);
        if (price_before === null || !groupeTax.trim()) {
          toast.error(tCreate("invalidForm"));
          return;
        }

        const price_after =
          price_before * (1 + resolveTaxRateDecimal(groupeTax));

        if (Number.isNaN(price_after)) {
          toast.error(tCreate("invalidForm"));
          return;
        }

        const nomTrim = nom.trim();
        const codeTrim = code.trim();
        const descTrim = description.trim();
        if (!nomTrim || !codeTrim || !descTrim) {
          toast.error(tCreate("invalidForm"));
          return;
        }

        const specialParsed = parseMoneyInput(prixSpecial.trim());
        const special_price =
          specialParsed !== null && specialParsed > 0 ? specialParsed : 0;

        const payload: CreateFourniturePayload = {
          name: nomTrim,
          description: descTrim,
          code: codeTrim,
          price_before,
          price_after,
          currency: devise.toUpperCase(),
          tax_group: taxGroupSlugToNumericId(groupeTax),
          special_price,
          category_id: apiBaseline.category_id,
          group_id: articleUiGroupToGroupId(groupe),
          unit_id: detailPieceUniteToUnitId(pieceUnite),
          supplier_id: apiBaseline.supplier_id,
          barcode: apiBaseline.barcode ?? "",
          stock_min: apiBaseline.stock_min,
          stock_current: apiBaseline.stock_current,
          images: Array.isArray(apiBaseline.images) ? apiBaseline.images : [],
          external_id: apiBaseline.external_id ?? "",
          notes: unite.trim()
            ? `Unité : ${unite.trim()}`
            : (apiBaseline.notes ?? ""),
        };

        updateMutation.mutate({ id, payload });
      }}
    >
      {updateMutation.isPending ? (
        <Loader variant="overlay" text={tEdit("saving")} />
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <input type="hidden" name="idIkwook" value={initial.idIkwook} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="nom" className="font-medium text-slate-700">
            {tCreate("fields.name")}
            {requiredStar}
          </Label>
          <Input
            id="nom"
            name="nom"
            required
            className="h-12 rounded-none"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="code" className="font-medium text-slate-700">
            {tCreate("fields.code")}
            {requiredStar}
          </Label>
          <Input
            id="code"
            name="code"
            required
            className="h-12 rounded-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="description" className="font-medium text-slate-700">
            {tEdit("fields.description")}
            {requiredStar}
          </Label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            className={cn(
              "flex min-h-[120px] w-full resize-y rounded-none border border-input bg-transparent px-2.5 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
            )}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="prix-ht" className="font-medium text-slate-700">
            {tCreate("fields.priceExclTax")}
            {requiredStar}
          </Label>
          <Input
            id="prix-ht"
            name="prixHt"
            inputMode="decimal"
            required
            className="h-12 rounded-none"
            value={prixHt}
            onChange={(e) => onPrixHtChange(e.target.value)}
            onBlur={onPrixHtBlur}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="groupe-tax" className="font-medium text-slate-700">
            {tCreate("fields.taxGroup")}
            {requiredStar}
          </Label>
          <select
            id="groupe-tax"
            name="groupeTax"
            required
            className={selectClass}
            value={groupeTax}
            aria-label={tCreate("taxGroupSelectAria")}
            onChange={(e) => onGroupeTaxChange(e.target.value)}
          >
            {selectableTaxGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {formatTaxGroupOptionLabel(g, { showInactive: true })}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">{tEdit("taxGroupHint")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="prix-ttc"
            className="font-medium text-slate-700"
          >
            {tCreate("fields.priceInclTax")}
            {requiredStar}
          </Label>
          <p className="text-xs text-slate-500">
            {tCreate("fields.priceInclTaxHint")}
          </p>
          <Input
            id="prix-ttc"
            readOnly
            tabIndex={-1}
            aria-readonly="true"
            inputMode="decimal"
            required
            className="h-12 cursor-default rounded-none bg-slate-50 text-slate-800"
            value={prixTtc}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="devise" className="font-medium text-slate-700">
            {tCreate("fields.currency")}
            {requiredStar}
          </Label>
          <select
            id="devise"
            name="devise"
            required
            className={selectClass}
            value={devise}
            aria-label={tCreate("fields.currency")}
            onChange={(e) =>
              setDevise(e.target.value as ArticleDetailRecord["devise"])
            }
          >
            <option value="usd">USD</option>
            <option value="cdf">CDF</option>
            <option value="eur">EUR</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="prix-special" className="font-medium text-slate-700">
            {tCreate("fields.specialPrice")}
          </Label>
          <Input
            id="prix-special"
            name="prixSpecial"
            inputMode="decimal"
            placeholder={tCreate("placeholders.optional")}
            className="h-12 rounded-none"
            value={prixSpecial}
            onChange={(e) => setPrixSpecial(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label htmlFor="piece-unite" className="font-medium text-slate-700">
              {tCreate("fields.pieceUnit")}
            </Label>
            <select
              id="piece-unite"
              name="pieceUnite"
              className={selectClass}
              value={pieceUnite}
              aria-label={tCreate("fields.pieceUnit")}
              onChange={(e) =>
                setPieceUnite(e.target.value as ArticleDetailRecord["pieceUnite"])
              }
            >
              <option value="piece">{tCreate("units.piece")}</option>
              <option value="kg">{tCreate("units.kg")}</option>
              <option value="heure">{tCreate("units.hour")}</option>
              <option value="forfait">{tCreate("units.flatRate")}</option>
            </select>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-[7.5rem] sm:shrink-0">
            <Label htmlFor="unite" className="font-medium text-slate-700">
              {tCreate("fields.unit")}
            </Label>
            <Input
              id="unite"
              name="unite"
              className="h-12 rounded-none"
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="statut" className="font-medium text-slate-700">
            {tEdit("fields.status")}
            {requiredStar}
          </Label>
          <select
            id="statut"
            name="statut"
            required
            className={selectClass}
            value={statut}
            aria-label={tEdit("fields.status")}
            onChange={(e) => setStatut(e.target.value as ArticleRowStatus)}
          >
            <option value="actif">{tList("status.actif")}</option>
            <option value="suspendu">{tList("status.suspendu")}</option>
            <option value="complet">{tList("status.complet")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="period" className="font-medium text-slate-700">
            {tEdit("fields.period")}
            {requiredStar}
          </Label>
          <Input
            id="period"
            name="period"
            type="date"
            required
            className="h-12 rounded-none"
            aria-label={tEdit("fields.period")}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="groupe" className="font-medium text-slate-700">
            {tCreate("fields.articleGroup")}
            {requiredStar}
          </Label>
          <select
            id="groupe"
            name="groupe"
            required
            className={selectClass}
            value={groupe}
            aria-label={tCreate("fields.articleGroup")}
            onChange={(e) =>
              setGroupe(e.target.value as ArticleDetailRecord["groupe"])
            }
          >
            <option value="a">{tCreate("articleGroups.a")}</option>
            <option value="b">{tCreate("articleGroups.b")}</option>
            <option value="c">{tCreate("articleGroups.c")}</option>
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
          {tCreate("actions.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="h-12 w-52 cursor-pointer rounded-none bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
        >
          {tCreate("actions.save")}
        </Button>
      </div>
    </form>
  );
}
