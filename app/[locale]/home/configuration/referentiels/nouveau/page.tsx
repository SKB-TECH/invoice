"use client";

import React, {
    useCallback,
    useEffect,
    useState,
} from "react";
import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";

import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    REFERENTIAL_CATALOG_CHANGED_EVENT,
    readReferentialCatalog,
    rowsForReferential,
    upsertCatalogRow,
} from "@/lib/referentials/referential-catalog-storage";
import {
    createReferentiel,
    referentielRecordToCatalogRow,
} from "@/core/services/referentiels.service";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

export default function NouveauReferentielPage() {
    const router = useRouter();
    const tNav = useTranslations("navbar");
    const tCfg = useTranslations("configuration");
    const t = useTranslations("configuration.referentialCreate");
    const tToast = useTranslations("configuration.referentialCatalog.toasts");

    const [catalog, setCatalog] = useState<ReturnType<
        typeof readReferentialCatalog
    >>(() =>
        typeof window !== "undefined" ? readReferentialCatalog() : []
    );

    const [referentialAxis, setReferentialAxis] = useState("");
    const [code, setCode] = useState("");
    const [titleVal, setTitleVal] = useState("");
    const [description, setDescription] = useState("");
    const [pending, setPending] = useState(false);

    const axisTrim = referentialAxis.trim();

    const sync = useCallback(() => {
        setCatalog(readReferentialCatalog());
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            sync();
        });
        window.addEventListener(REFERENTIAL_CATALOG_CHANGED_EVENT, sync);
        return () =>
            window.removeEventListener(
                REFERENTIAL_CATALOG_CHANGED_EVENT,
                sync
            );
    }, [sync]);

    const requiredStar = (
        <>
            {" "}
            <span className="text-red-500">*</span>
        </>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pending) return;

        const codeTrim = code.trim();
        const titleTrim = titleVal.trim();
        const descTrim = description.trim();

        if (!axisTrim || !codeTrim || !titleTrim) {
            toast.error(t("invalidForm"));
            return;
        }

        const dup = rowsForReferential(axisTrim, catalog).some(
            (r) =>
                r.code.trim().toLowerCase() === codeTrim.toLowerCase(),
        );
        if (dup) {
            toast.error(tToast("duplicateCode"));
            return;
        }

        setPending(true);
        try {
            const saved = await createReferentiel({
                referentiel: axisTrim,
                title: titleTrim,
                description: descTrim,
                code: codeTrim,
                parent_id: 0,
            });
            upsertCatalogRow(referentielRecordToCatalogRow(saved));
            sync();
            toast.success(tToast("created"));
            router.push("/home/configuration");
        } catch (error) {
            toast.error(getAxiosErrorMessage(error, tToast("apiError")));
        } finally {
            setPending(false);
        }
    };

    return (
        <main className="relative mx-auto w-full min-w-full text-foreground">
            {pending ? (
                <Loader variant="overlay" text={t("creating")} />
            ) : null}

            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNav("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link href="/home/configuration" className="hover:text-slate-700">
                    {tCfg("menu.referentials")}
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <span aria-current="page">{t("breadcrumbNew")}</span>
            </span>

            <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                {tNav("NouveauReferentiel")}
            </h1>

            <form
                className="rounded-none border border-slate-200/80 bg-white p-6 sm:p-8"
                method="post"
                onSubmit={(e) => {
                    void handleSubmit(e);
                }}
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-2 sm:col-span-2">
                        <Label
                            htmlFor="ref-axis"
                            className="font-medium text-slate-700"
                        >
                            {t("fields.referential")}
                            {requiredStar}
                        </Label>
                        <Input
                            id="ref-axis"
                            name="referential"
                            required
                            value={referentialAxis}
                            onChange={(e) => setReferentialAxis(e.target.value)}
                            placeholder={t("placeholders.referential")}
                            autoComplete="off"
                            className="h-12 rounded-none"
                            aria-label={t("fields.referential")}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="ref-code"
                            className="font-medium text-slate-700"
                        >
                            {t("fields.code")}
                            {requiredStar}
                        </Label>
                        <Input
                            id="ref-code"
                            name="code"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={t("placeholders.code")}
                            autoComplete="off"
                            className="h-12 rounded-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="ref-title"
                            className="font-medium text-slate-700"
                        >
                            {t("fields.entityTitle")}
                            {requiredStar}
                        </Label>
                        <Input
                            id="ref-title"
                            name="title"
                            required
                            value={titleVal}
                            onChange={(e) => setTitleVal(e.target.value)}
                            placeholder={t("placeholders.entityTitle")}
                            autoComplete="off"
                            className="h-12 rounded-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2 sm:col-span-2">
                        <Label
                            htmlFor="ref-desc"
                            className="font-medium text-slate-700"
                        >
                            {t("fields.description")}
                        </Label>
                        <textarea
                            id="ref-desc"
                            name="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("placeholders.description")}
                            className="rounded-none border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 md:flex-row md:flex-wrap md:justify-end">
                    <Button
                        onClick={() => router.push("/home/configuration")}
                        type="button"
                        variant="secondary"
                        className="h-12 w-52 cursor-pointer rounded-none bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80"
                    >
                        {t("actions.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        disabled={pending}
                        className="h-12 w-52 cursor-pointer rounded-none bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
                    >
                        {t("actions.save")}
                    </Button>
                </div>
            </form>
        </main>
    );
}
