"use client";

import { useMemo, useState } from "react";

import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";

import Loader from "@/components/loader/Loader";
import { ArticleTaxGroupSelect } from "@/components/articles/article-tax-group-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateFourniture } from "@/core/hooks/fournitures/useCreateFourniture";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";
import type { ArticleDetailRecord } from "@/lib/fournitures/articles/articles-data";
import {
    articleUiGroupToGroupId,
    detailPieceUniteToUnitId,
    taxGroupSlugToNumericId,
} from "@/lib/fournitures/articles/fournitures-mappers";
import { resolveTaxRateDecimal } from "@/lib/fournitures/articles/tax-rates";

const selectClass =
    "h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

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
    v: string
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

    const createMutation = useCreateFourniture({
        onSuccess: (data) => {
            router.push(
                `/home/articles/${encodeURIComponent(String(data.id))}/visualiser`
            );
        },
        onError: (error) => {
            toast.error(
                getAxiosErrorMessage(
                    error,
                    "Impossible de créer l’article."
                )
            );
        },
    });

    const [prixHt, setPrixHt] = useState("");
    const [groupeTax, setGroupeTax] = useState("");

    const prixTtcAffiche = useMemo(() => {
        const ht = parseDecimalInput(prixHt);
        if (ht === null || !groupeTax.trim()) return "";
        return formatMoneyFr(ht * (1 + resolveTaxRateDecimal(groupeTax)));
    }, [prixHt, groupeTax]);

    const requiredStar = (
        <>
            {" "}
            <span className="text-red-500">*</span>
        </>
    );

    return (
        <main className="relative mx-auto w-full min-w-full text-foreground">
            {createMutation.isPending ? (
                <Loader variant="overlay" text={tCreate("creating")} />
            ) : null}

            <span className="mb-6 flex items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNavbar("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4" />
                <Link href="/home/articles" className="hover:text-slate-700">
                    {tList("title")}
                </Link>
                <ChevronRight className="size-4" />
                {tCreate("breadcrumbNew")}
            </span>

            <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                {tNavbar("NouvelArticle")}
            </h1>

            <form
                className="rounded-none border border-slate-200/80 bg-white p-6 sm:p-8"
                method="post"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (createMutation.isPending) return;

                    const fd = new FormData(e.currentTarget);
                    const name = String(fd.get("nom") ?? "").trim();
                    const code = String(fd.get("code") ?? "").trim();
                    const description = String(
                        fd.get("description") ?? ""
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
                        fd.get("prixSpecial") ?? ""
                    ).trim();

                    const price_before = parseDecimalInput(prixHt);

                    if (
                        !name ||
                        !code ||
                        !devise ||
                        !groupeTaxTrim
                    ) {
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
                        category_id: 0,
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
                <div className="grid gap-6 sm:grid-cols-2">
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
                            defaultValue=""
                            required
                            className={selectClass}
                            aria-label={tCreate("fields.currency")}
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
                            value={prixHt}
                            onChange={(e) => setPrixHt(e.target.value)}
                            onBlur={() => {
                                const ht = parseDecimalInput(prixHt);
                                if (ht !== null) setPrixHt(formatMoneyFr(ht));
                            }}
                            placeholder={tCreate(
                                "placeholders.priceExclTaxExample"
                            )}
                            className="h-12 rounded-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="groupe-tax"
                            className="font-medium text-slate-700"
                        >
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
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="prix-ttc"
                            className="font-medium text-slate-700"
                        >
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
                            value={prixTtcAffiche}
                            placeholder={
                                groupeTax && prixHt ? undefined : "—"
                            }
                            className="h-12 cursor-default rounded-none bg-slate-50 text-slate-800"
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
                                defaultValue="piece"
                                className={selectClass}
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
                            </select>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-[7.5rem] sm:shrink-0">
                            <Label htmlFor="unite" className="font-medium text-slate-700">
                                {tCreate("fields.unit")}
                            </Label>
                            <Input id="unite" name="unite" className="h-12 rounded-none" />
                        </div>
                    </div>

                    {/* <div className="flex flex-col gap-2 sm:col-span-2">
                        <Label htmlFor="groupe" className="font-medium text-slate-700">
                            {tCreate("fields.articleGroup")}
                            {requiredStar}
                        </Label>
                        <select
                            id="groupe"
                            name="groupe"
                            defaultValue=""
                            required
                            className={selectClass}
                            aria-label={tCreate("fields.articleGroup")}
                        >
                            <option value="" disabled>
                                {tCreate("selectPlaceholder")}
                            </option>
                            <option value="a">{tCreate("articleGroups.a")}</option>
                            <option value="b">{tCreate("articleGroups.b")}</option>
                            <option value="c">{tCreate("articleGroups.c")}</option>
                        </select>
                    </div> */}
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
                        disabled={createMutation.isPending}
                        className="h-12 w-52 cursor-pointer rounded-none bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
                    >
                        {tCreate("actions.save")}
                    </Button>
                </div>
            </form>
        </main>
    );
}
