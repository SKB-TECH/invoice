"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader/Loader";
import { ArticleTaxGroupSelect } from "@/components/articles/article-tax-group-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateFourniture } from "@/core/hooks/fournitures/useUpdateFourniture";
import { useReferentielsCatalog } from "@/core/hooks/referentiels/useReferentielsCatalog";
import type {
  CreateFourniturePayload,
  FournitureArticle,
} from "@/core/types/fourniture";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";
import type { ArticleDetailRecord } from "@/lib/fournitures/articles/articles-data";
import {
  detailPieceUniteToUnitId,
  taxGroupSlugToNumericId,
} from "@/lib/fournitures/articles/fournitures-mappers";
import { resolveTaxRateDecimal } from "@/lib/fournitures/articles/tax-rates";
import { formatReferentielOptionLabel } from "@/lib/referentials/referential-option-label";
import { useRouter } from "@/i18n/routing";

const selectClass =
  "h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

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

  const {
    items: referentialRows,
    isPending: referentialsPending,
    isError: referentialsError,
    refetch: refetchReferentials,
  } = useReferentielsCatalog(null);

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

  const [nom, setNom] = useState(initial.title);
  const [code, setCode] = useState(initial.code);
  const [description, setDescription] = useState(initial.description);
  const [referentialId, setReferentialId] = useState(() =>
    apiBaseline.category_id > 0 ? String(apiBaseline.category_id) : "",
  );

  const [prixHt, setPrixHt] = useState(formatMoneyFr(initial.prixHt));
  const [groupeTax, setGroupeTax] = useState(initial.groupeTax);
  const prixTtcAffiche = useMemo(() => {
    const ht = parseMoneyInput(prixHt);
    if (ht === null || !groupeTax.trim()) return "";
    return formatMoneyFr(ht * (1 + resolveTaxRateDecimal(groupeTax)));
  }, [prixHt, groupeTax]);

  const [devise, setDevise] = useState(initial.devise);
  const [prixSpecial, setPrixSpecial] = useState(
    initial.prixSpecial != null ? formatMoneyFr(initial.prixSpecial) : "",
  );
  const [pieceUnite, setPieceUnite] = useState(initial.pieceUnite);
  const [unite, setUnite] = useState(initial.unite);

  const referentialMissingFromCatalog =
    apiBaseline.category_id > 0 &&
    !referentialRows.some((r) => r.id === apiBaseline.category_id);

  const canSubmitReferentials =
    referentialRows.length > 0 || referentialMissingFromCatalog;

  const onPrixHtBlur = () => {
    const ht = parseMoneyInput(prixHt);
    if (ht !== null) {
      setPrixHt(formatMoneyFr(ht));
    }
  };

  const requiredStar = (
    <>
      {" "}
      <span className="text-red-500">*</span>
    </>
  );

  const referentialBaselineLabel =
    apiBaseline.category_info?.title?.trim() ||
    String(tEdit("referentialFallback", { id: apiBaseline.category_id }));

  const saveDisabledExternally =
    referentialsPending || referentialsError || !canSubmitReferentials;

  return (
    <form
      className="relative rounded-none border border-slate-200/80 bg-white p-6 sm:p-8"
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        if (updateMutation.isPending || saveDisabledExternally) return;

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
        if (!nomTrim || !codeTrim) {
          toast.error(tCreate("invalidForm"));
          return;
        }

        const referentialIdRaw = referentialId.trim();
        const category_id = Number.parseInt(referentialIdRaw, 10);
        if (!Number.isFinite(category_id) || category_id < 1) {
          toast.error(tCreate("invalidReferential"));
          return;
        }

        const descTrim = description.trim();
        const specialParsed = parseMoneyInput(prixSpecial.trim());
        const special_price =
          specialParsed !== null && specialParsed > 0 ? specialParsed : 0;

        const payload: CreateFourniturePayload = {
          name: nomTrim,
          description: descTrim || nomTrim,
          code: codeTrim,
          price_before,
          price_after,
          currency: devise.toUpperCase(),
          tax_group: taxGroupSlugToNumericId(groupeTax),
          special_price,
          category_id,
          group_id: apiBaseline.group_id,
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

        void updateMutation.mutate({ id, payload });
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
          <Label
            htmlFor="description"
            className="font-medium text-slate-700"
          >
            {tCreate("fields.description")}
          </Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="rounded-none border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            placeholder={tCreate("placeholders.optional")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label
            htmlFor="referentialId"
            className="font-medium text-slate-700"
          >
            {tCreate("fields.referential")}
            {requiredStar}
          </Label>
          <select
            id="referentialId"
            name="referentialId"
            required
            value={referentialId}
            onChange={(e) => setReferentialId(e.target.value)}
            disabled={
              referentialsPending ||
              referentialsError ||
              (referentialRows.length === 0 && !referentialMissingFromCatalog)
            }
            className={selectClass}
            aria-label={tCreate("fields.referential")}
          >
            <option value="">
              {referentialsPending
                ? tCreate("referentialLoading")
                : tCreate("referentialPlaceholder")}
            </option>
            {referentialMissingFromCatalog ? (
              <option value={String(apiBaseline.category_id)}>
                {referentialBaselineLabel}
              </option>
            ) : null}
            {!referentialsPending &&
              referentialRows.map((row) => (
                <option
                  key={row.id}
                  value={String(row.id)}
                  title={formatReferentielOptionLabel(row)}
                >
                  {formatReferentielOptionLabel(row)}
                </option>
              ))}
          </select>
          {referentialsError ? (
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-red-600">
              <span>{tCreate("referentialLoadError")}</span>
              <button
                type="button"
                className="underline underline-offset-2 hover:text-red-700"
                onClick={() => void refetchReferentials()}
              >
                {tCreate("retryReferentialsFetch")}
              </button>
            </div>
          ) : null}
          {!referentialsPending &&
          !referentialsError &&
          referentialRows.length === 0 &&
          !referentialMissingFromCatalog ? (
            <p className="text-[13px] text-amber-700">
              {tCreate("referentialNoneForAxis")}
            </p>
          ) : null}
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
            <option value="" disabled>
              {tCreate("selectPlaceholder")}
            </option>
            <option value="usd">USD</option>
            <option value="cdf">CDF</option>
            <option value="eur">EUR</option>
          </select>
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
            onChange={(e) => setPrixHt(e.target.value)}
            onBlur={onPrixHtBlur}
            placeholder={tCreate(
              "placeholders.priceExclTaxExample",
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="groupe-tax" className="font-medium text-slate-700">
            {tCreate("fields.taxGroup")}
            {requiredStar}
          </Label>
          <ArticleTaxGroupSelect
            id="groupe-tax"
            name="groupeTax"
            required
            className={selectClass}
            value={groupeTax}
            onValueChange={setGroupeTax}
            includeInactiveIds={[initial.groupeTax]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="prix-ttc" className="font-medium text-slate-700">
            {tCreate("fields.priceInclTax")}
            {requiredStar}
          </Label>
          <Input
            id="prix-ttc"
            readOnly
            tabIndex={-1}
            aria-readonly="true"
            inputMode="decimal"
            required
            className="h-12 cursor-default rounded-none bg-slate-50 text-slate-800"
            value={prixTtcAffiche}
            placeholder={groupeTax && prixHt ? undefined : "—"}
          />
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
                setPieceUnite(
                  e.target.value as ArticleDetailRecord["pieceUnite"],
                )
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
          disabled={updateMutation.isPending || saveDisabledExternally}
          className="h-12 w-52 cursor-pointer rounded-none bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
        >
          {tCreate("actions.save")}
        </Button>
      </div>
    </form>
  );
}
