"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader/Loader";
import { ArticleTaxGroupSelect } from "@/components/articles/article-tax-group-select";
import {
    CreateFormFooter,
    createFormSelectClassName,
    FieldLabel,
    InputField,
    NativeSelectField,
    SelectFieldSkeleton,
    TextareaField,
} from "@/components/invoices/create/Fields";
import { useUpdateFourniture } from "@/core/hooks/fournitures/useUpdateFourniture";
import { useItemTypes } from "@/core/hooks/fournitures/useItemTypes";
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
import { buildItemTypeSelectOptions } from "@/lib/item-types/item-type-select-options";
import { formatReferentielOptionLabel } from "@/lib/referentials/referential-option-label";
import { useRouter } from "@/i18n/routing";

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

    const {
        data: itemTypes = [],
        isPending: itemTypesPending,
        isError: itemTypesError,
        refetch: refetchItemTypes,
    } = useItemTypes();

    const updateMutation = useUpdateFourniture({
        onSuccess: () => {
            toast.success(tEdit("toastSaved"));
            router.push(
                `/home/articles/${encodeURIComponent(initial.idIkwook)}/visualiser`,
            );
        },
        onError: (error) => {
            toast.error(
                getAxiosErrorMessage(
                    error,
                    "Impossible de mettre à jour l’article.",
                ),
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

    const itemTypeOptions = useMemo(
        () => buildItemTypeSelectOptions(itemTypes, code),
        [itemTypes, code],
    );

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
        <span className="text-red-500" aria-hidden>
            {" "}
            *
        </span>
    );

    const referentialBaselineLabel =
        apiBaseline.category_info?.title?.trim() ||
        String(tEdit("referentialFallback", { id: apiBaseline.category_id }));

    const saveDisabledExternally =
        referentialsPending ||
        referentialsError ||
        !canSubmitReferentials ||
        itemTypesPending ||
        itemTypesError ||
        !code.trim();

    return (
        <form
            className="relative mt-4"
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
                    specialParsed !== null && specialParsed > 0
                        ? specialParsed
                        : 0;

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
                    images: Array.isArray(apiBaseline.images)
                        ? apiBaseline.images
                        : [],
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

            <div className="bg-white p-8">
                <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                    <input type="hidden" name="idIkwook" value={initial.idIkwook} />

                    <div>
                        <FieldLabel>
                            {tCreate("fields.name")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            id="nom"
                            name="nom"
                            required
                            value={nom}
                            onChange={setNom}
                        />
                    </div>

                    <div>
                        <FieldLabel>
                            {tCreate("fields.code")}
                            {requiredStar}
                        </FieldLabel>
                        {itemTypesPending ? (
                            <SelectFieldSkeleton
                                aria-label={tCreate("fields.code")}
                            />
                        ) : (
                            <NativeSelectField
                                id="code"
                                name="code"
                                required
                                value={code}
                                disabled={
                                    itemTypesError ||
                                    itemTypeOptions.length === 0
                                }
                                onChange={setCode}
                                aria-label={tCreate("fields.code")}
                            >
                                <option value="">
                                    {tCreate("selectPlaceholder")}
                                </option>
                                {itemTypeOptions.map((item) => (
                                    <option key={item.id} value={item.code}>
                                        {item.code}
                                    </option>
                                ))}
                            </NativeSelectField>
                        )}
                        {itemTypesError ? (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-red-500">
                                <span>{tCreate("itemTypeLoadError")}</span>
                                <button
                                    type="button"
                                    className="underline underline-offset-2 hover:text-red-600"
                                    onClick={() => void refetchItemTypes()}
                                >
                                    {tCreate("retryItemTypesFetch")}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>
                            {tCreate("fields.referential")}
                            {requiredStar}
                        </FieldLabel>
                        <NativeSelectField
                            id="referentialId"
                            name="referentialId"
                            required
                            value={referentialId}
                            disabled={
                                referentialsPending ||
                                referentialsError ||
                                (referentialRows.length === 0 &&
                                    !referentialMissingFromCatalog)
                            }
                            onChange={setReferentialId}
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
                        </NativeSelectField>
                        {referentialsError ? (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-red-500">
                                <span>{tCreate("referentialLoadError")}</span>
                                <button
                                    type="button"
                                    className="underline underline-offset-2 hover:text-red-600"
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
                            <p className="mt-2 text-sm font-medium text-amber-700">
                                {tCreate("referentialNoneForAxis")}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <FieldLabel>
                            {tCreate("fields.currency")}
                            {requiredStar}
                        </FieldLabel>
                        <NativeSelectField
                            id="devise"
                            name="devise"
                            required
                            value={devise}
                            onChange={(v) =>
                                setDevise(v as ArticleDetailRecord["devise"])
                            }
                            aria-label={tCreate("fields.currency")}
                        >
                            <option value="" disabled>
                                {tCreate("selectPlaceholder")}
                            </option>
                            <option value="usd">USD</option>
                            <option value="cdf">CDF</option>
                            <option value="eur">EUR</option>
                        </NativeSelectField>
                    </div>

                    <div>
                        <FieldLabel>
                            {tCreate("fields.priceExclTax")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            id="prix-ht"
                            name="prixHt"
                            inputMode="decimal"
                            required
                            value={prixHt}
                            onChange={setPrixHt}
                            onBlur={onPrixHtBlur}
                            placeholder={tCreate(
                                "placeholders.priceExclTaxExample",
                            )}
                        />
                    </div>

                    <div>
                        <FieldLabel>
                            {tCreate("fields.taxGroup")}
                            {requiredStar}
                        </FieldLabel>
                        <div className="relative">
                            <ArticleTaxGroupSelect
                                id="groupe-tax"
                                name="groupeTax"
                                required
                                className={createFormSelectClassName}
                                value={groupeTax}
                                onValueChange={setGroupeTax}
                                includeInactiveIds={[initial.groupeTax]}
                            />
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
                        </div>
                    </div>

                    <div>
                        <FieldLabel>
                            {tCreate("fields.priceInclTax")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            id="prix-ttc"
                            readOnly
                            inputMode="decimal"
                            required
                            value={prixTtcAffiche}
                            placeholder={
                                groupeTax && prixHt ? undefined : "—"
                            }
                        />
                    </div>

                    <div>
                        <FieldLabel>
                            {tCreate("fields.specialPrice")}
                        </FieldLabel>
                        <InputField
                            id="prix-special"
                            name="prixSpecial"
                            inputMode="decimal"
                            placeholder={tCreate("placeholders.optional")}
                            value={prixSpecial}
                            onChange={setPrixSpecial}
                        />
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1">
                            <FieldLabel>
                                {tCreate("fields.pieceUnit")}
                            </FieldLabel>
                            <NativeSelectField
                                id="piece-unite"
                                name="pieceUnite"
                                value={pieceUnite}
                                onChange={(v) =>
                                    setPieceUnite(
                                        v as ArticleDetailRecord["pieceUnite"],
                                    )
                                }
                                aria-label={tCreate("fields.pieceUnit")}
                            >
                                <option value="piece">
                                    {tCreate("units.piece")}
                                </option>
                                <option value="kg">{tCreate("units.kg")}</option>
                                <option value="heure">
                                    {tCreate("units.hour")}
                                </option>
                                <option value="forfait">
                                    {tCreate("units.flatRate")}
                                </option>
                            </NativeSelectField>
                        </div>
                        <div className="w-full sm:w-40">
                            <FieldLabel>{tCreate("fields.unit")}</FieldLabel>
                            <InputField
                                id="unite"
                                name="unite"
                                value={unite}
                                onChange={setUnite}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>
                            {tCreate("fields.description")}
                        </FieldLabel>
                        <TextareaField
                            id="description"
                            name="description"
                            placeholder={tCreate("placeholders.optional")}
                            value={description}
                            onChange={setDescription}
                        />
                    </div>
                </div>

                <CreateFormFooter
                    cancelLabel={tCreate("actions.cancel")}
                    submitLabel={tCreate("actions.save")}
                    onCancel={() => router.push("/home/articles")}
                    submitDisabled={
                        updateMutation.isPending || saveDisabledExternally
                    }
                    submitType="submit"
                />
            </div>
        </form>
    );
}
