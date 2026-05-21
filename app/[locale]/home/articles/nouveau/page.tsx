"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";

import Loader from "@/components/loader/Loader";
import { ArticleTaxGroupSelect } from "@/components/articles/article-tax-group-select";
import {
    CreateFormFooter,
    createFormSelectClassName,
    FieldLabel,
    InputField,
    NativeSelectField,
    TextareaField,
} from "@/components/invoices/create/Fields";
import { useCreateFourniture } from "@/core/hooks/fournitures/useCreateFourniture";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";
import type { ArticleDetailRecord } from "@/lib/fournitures/articles/articles-data";
import {
    articleUiGroupToGroupId,
    detailPieceUniteToUnitId,
    taxGroupSlugToNumericId,
} from "@/lib/fournitures/articles/fournitures-mappers";
import { resolveTaxRateDecimal } from "@/lib/fournitures/articles/tax-rates";
import { useReferentielsCatalog } from "@/core/hooks/referentiels/useReferentielsCatalog";
import { formatReferentielAxisCodeLabel } from "@/lib/referentials/referential-option-label";

function parseDecimalInput(raw: string): number | null {
    const t = raw.trim().replace(/\s/g, "").replace(",", ".");
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
}

function formatMoneyFr(n: number): string {
    return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function formPieceToDetailKey(
    v: string,
): ArticleDetailRecord["pieceUnite"] {
    if (v === "heure" || v === "hour") return "heure";
    if (v === "piece" || v === "kg" || v === "forfait") return v;
    return "piece";
}

export default function NouvelArticlePage() {
    const router = useRouter();
    const tCreate = useTranslations("articles.create");
    const tList = useTranslations("articles.list");
    const tNavbar = useTranslations("navbar");

    const {
        items: referentialRows,
        isPending: referentialsPending,
        isError: referentialsError,
        refetch: refetchReferentials,
    } = useReferentielsCatalog(null);

    const createMutation = useCreateFourniture({
        onSuccess: (data) => {
            router.push(
                `/home/articles/${encodeURIComponent(String(data.id))}/visualiser`,
            );
        },
        onError: (error) => {
            toast.error(
                getAxiosErrorMessage(
                    error,
                    "Impossible de créer l’article.",
                ),
            );
        },
    });

    const [prixHt, setPrixHt] = useState("");
    const [groupeTax, setGroupeTax] = useState("");
    const [referentialId, setReferentialId] = useState("");

    const prixTtcAffiche = useMemo(() => {
        const ht = parseDecimalInput(prixHt);
        if (ht === null || !groupeTax.trim()) return "";
        return formatMoneyFr(ht * (1 + resolveTaxRateDecimal(groupeTax)));
    }, [prixHt, groupeTax]);

    const requiredStar = (
        <span className="text-red-500" aria-hidden>
            {" "}
            *
        </span>
    );

    return (
        <main className="relative w-full text-slate-700">
            {createMutation.isPending ? (
                <Loader variant="overlay" text={tCreate("creating")} />
            ) : null}

            <div className="mb-3 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                {" / "}
                <Link
                    href="/home/articles"
                    className="hover:text-slate-600"
                >
                    {tList("title")}
                </Link>
                {" / "}
                <span className="font-semibold text-slate-600">
                    {tCreate("breadcrumbNew")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {tNavbar("NouvelArticle")}
            </h1>

            <form
                className="mt-4"
                method="post"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (createMutation.isPending) return;

                    const fd = new FormData(e.currentTarget);
                    const name = String(fd.get("nom") ?? "").trim();
                    const code = String(fd.get("code") ?? "").trim();
                    const description = String(
                        fd.get("description") ?? "",
                    ).trim();
                    const devise = String(fd.get("devise") ?? "")
                        .trim()
                        .toUpperCase();
                    const groupeTaxTrim = groupeTax.trim();
                    const groupe =
                        String(fd.get("groupe") ?? "a").trim() || "a";
                    const pieceRaw = String(fd.get("pieceUnite") ?? "piece");
                    const unite = String(fd.get("unite") ?? "").trim();
                    const prixSpecialRaw = String(
                        fd.get("prixSpecial") ?? "",
                    ).trim();

                    const price_before = parseDecimalInput(prixHt);

                    if (!name || !code || !devise || !groupeTaxTrim) {
                        toast.error(tCreate("invalidForm"));
                        return;
                    }

                    if (price_before === null) {
                        toast.error(tCreate("invalidForm"));
                        return;
                    }

                    const price_after =
                        price_before *
                        (1 + resolveTaxRateDecimal(groupeTaxTrim));

                    if (!Number.isFinite(price_after)) {
                        toast.error(tCreate("invalidForm"));
                        return;
                    }

                    const specialParsed = parseDecimalInput(prixSpecialRaw);
                    const special_price =
                        specialParsed !== null ? specialParsed : 0;

                    const referentialIdRaw = referentialId.trim();
                    const category_id = Number.parseInt(referentialIdRaw, 10);
                    if (
                        !Number.isFinite(category_id) ||
                        category_id < 1
                    ) {
                        toast.error(tCreate("invalidReferential"));
                        return;
                    }

                    const pieceKey = formPieceToDetailKey(pieceRaw);
                    const unit_id = detailPieceUniteToUnitId(pieceKey);

                    void createMutation.mutate({
                        name,
                        description: description || name,
                        code,
                        price_before,
                        price_after,
                        currency: devise,
                        tax_group: taxGroupSlugToNumericId(groupeTaxTrim),
                        special_price,
                        category_id,
                        group_id: articleUiGroupToGroupId(groupe),
                        unit_id,
                        supplier_id: 0,
                        barcode: "",
                        stock_min: 0,
                        stock_current: 0,
                        images: [],
                        external_id: "",
                        notes: unite ? `Unité : ${unite}` : "",
                    });
                }}
            >
                <div className="bg-white p-8">
                    <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                        <div>
                            <FieldLabel>
                                {tCreate("fields.name")}
                                {requiredStar}
                            </FieldLabel>
                            <InputField
                                id="nom"
                                name="nom"
                                required
                            />
                        </div>

                        <div>
                            <FieldLabel>
                                {tCreate("fields.code")}
                                {requiredStar}
                            </FieldLabel>
                            <InputField
                                id="code"
                                name="code"
                                required
                            />
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
                                    referentialRows.length === 0
                                }
                                onChange={setReferentialId}
                                aria-label={tCreate("fields.referential")}
                            >
                                <option value="">
                                    {referentialsPending
                                        ? tCreate("referentialLoading")
                                        : tCreate("referentialPlaceholder")}
                                </option>
                                {!referentialsPending &&
                                    referentialRows.map((row) => (
                                        <option
                                            key={row.id}
                                            value={String(row.id)}
                                            title={row.title.trim() || undefined}
                                        >
                                            {formatReferentielAxisCodeLabel(row)}
                                        </option>
                                    ))}
                            </NativeSelectField>
                            {referentialsError ? (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-red-500">
                                    <span>
                                        {tCreate("referentialLoadError")}
                                    </span>
                                    <button
                                        type="button"
                                        className="underline underline-offset-2 hover:text-red-600"
                                        onClick={() =>
                                            void refetchReferentials()
                                        }
                                    >
                                        {tCreate("retryReferentialsFetch")}
                                    </button>
                                </div>
                            ) : null}
                            {!referentialsPending &&
                            !referentialsError &&
                            referentialRows.length === 0 ? (
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
                                defaultValue=""
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
                                onBlur={() => {
                                    const ht = parseDecimalInput(prixHt);
                                    if (ht !== null) setPrixHt(formatMoneyFr(ht));
                                }}
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
                                    defaultValue="piece"
                                    aria-label={tCreate("fields.pieceUnit")}
                                >
                                    <option value="piece">
                                        {tCreate("units.piece")}
                                    </option>
                                    <option value="kg">
                                        {tCreate("units.kg")}
                                    </option>
                                    <option value="heure">
                                        {tCreate("units.hour")}
                                    </option>
                                    <option value="forfait">
                                        {tCreate("units.flatRate")}
                                    </option>
                                </NativeSelectField>
                            </div>
                            <div className="w-full sm:w-40">
                                <FieldLabel>
                                    {tCreate("fields.unit")}
                                </FieldLabel>
                                <InputField id="unite" name="unite" />
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
                            />
                        </div>
                    </div>

                    <CreateFormFooter
                        cancelLabel={tCreate("actions.cancel")}
                        submitLabel={tCreate("actions.save")}
                        onCancel={() => router.push("/home/articles")}
                        submitDisabled={
                            createMutation.isPending ||
                            referentialsPending ||
                            referentialsError ||
                            referentialRows.length === 0
                        }
                        submitType="submit"
                    />
                </div>
            </form>
        </main>
    );
}
