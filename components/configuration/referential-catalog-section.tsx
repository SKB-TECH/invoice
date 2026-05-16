"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import {
    REFERENTIAL_CATALOG_CHANGED_EVENT,
    REFERENTIAL_REGISTRY_SLUGS,
    type ReferentialCatalogRow,
    deleteReferentialRow,
    readReferentialCatalog,
    overwriteRegistryCatalogFromFullSync,
    updateReferentialRow,
} from "@/lib/referentials/referential-catalog-storage";
import {
    fetchAllReferentiels,
    referentielRecordToCatalogRow,
} from "@/core/services/referentiels.service";

export function ReferentialCatalogSection() {
    const t = useTranslations("configuration.referentialCatalog");
    const locale = useLocale();
    const collator = locale === "en" ? "en" : "fr";

    const [catalog, setCatalog] = useState<ReferentialCatalogRow[]>(() =>
        typeof window !== "undefined" ? readReferentialCatalog() : [],
    );

    const [editId, setEditId] = useState<number | null>(null);
    const [eCode, setECode] = useState("");
    const [eTitle, setETitle] = useState("");
    const [eDesc, setEDesc] = useState("");

    const sync = useCallback(() => {
        setCatalog(readReferentialCatalog());
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            sync();
        });

        window.addEventListener(REFERENTIAL_CATALOG_CHANGED_EVENT, sync);

        let cancelled = false;

        void (async () => {
            try {
                const records = await fetchAllReferentiels({ perPage: 20 });
                if (cancelled) return;

                overwriteRegistryCatalogFromFullSync(
                    records.map(referentielRecordToCatalogRow)
                );
                queueMicrotask(() => {
                    sync();
                });
            } catch {
                /* Liste indisponible ou enveloppe non reconnue */
            }
        })();

        return () => {
            cancelled = true;
            window.removeEventListener(
                REFERENTIAL_CATALOG_CHANGED_EVENT,
                sync
            );
        };
    }, [sync]);

    const sortedRows = useMemo(
        () =>
            [...catalog].sort((a, b) => {
                const cmpRef = a.referentiel.localeCompare(b.referentiel, collator, {
                    sensitivity: "base",
                });
                if (cmpRef !== 0) return cmpRef;
                return a.code.localeCompare(b.code, collator, {
                    sensitivity: "base",
                });
            }),
        [catalog, collator],
    );

    const axisDisplay = useCallback(
        (slug: string) =>
            (REFERENTIAL_REGISTRY_SLUGS as readonly string[]).includes(slug)
                ? t(`types.${slug as (typeof REFERENTIAL_REGISTRY_SLUGS)[number]}`)
                : slug,
        [t],
    );

    const openEdit = (row: ReferentialCatalogRow) => {
        setEditId(row.id);
        setECode(row.code);
        setETitle(row.title);
        setEDesc(row.description);
    };

    const closeEdit = () => {
        setEditId(null);
        setECode("");
        setETitle("");
        setEDesc("");
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editId === null) return;

        const codeTrim = eCode.trim();
        const titleTrim = eTitle.trim();
        if (!codeTrim || !titleTrim) {
            toast.error(t("toasts.codeTitleRequired"));
            return;
        }

        const editingRow = sortedRows.find((r) => r.id === editId);
        if (!editingRow) return;

        const clash = sortedRows.some(
            (r) =>
                r.id !== editId &&
                r.referentiel === editingRow.referentiel &&
                r.code.trim().toLowerCase() === codeTrim.toLowerCase(),
        );
        if (clash) {
            toast.error(t("toasts.duplicateCode"));
            return;
        }

        const parent_id = editingRow.parent_id;

        const ok = updateReferentialRow(editId, {
            code: codeTrim,
            title: titleTrim,
            description: eDesc.trim(),
            parent_id,
            referentiel: editingRow.referentiel,
        });

        if (!ok) {
            toast.error(t("toasts.saveFailed"));
            return;
        }

        closeEdit();
        sync();
        toast.success(t("toasts.updated"));
    };

    const handleDelete = (id: number) => {
        deleteReferentialRow(id);
        if (editId === id) closeEdit();
        sync();
        toast.success(t("toasts.deleted"));
    };

    return (
        <div className="space-y-5">
            <div className="border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <h2 className="text-[16px] font-semibold text-slate-900">
                            {t("sectionHeadline")}
                        </h2>

                        <Link
                            href="/home/configuration/referentiels/nouveau"
                            className="inline-flex h-11 items-center justify-center border border-[#0073C5] bg-[#0073C5] px-5 text-[13px] font-semibold text-white hover:bg-[#005999] sm:w-auto sm:shrink-0"
                        >
                            {t("openCreateForm")}
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto px-5 py-4">
                    <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-600">
                                <th className="py-2 pr-3 font-medium">{t("axisColumn")}</th>
                                <th className="py-2 pr-3 font-medium">{t("code")}</th>
                                <th className="py-2 pr-3 font-medium">{t("entityTitle")}</th>
                                <th className="py-2 pr-3 font-medium hidden md:table-cell">
                                    {t("description")}
                                </th>
                                <th className="w-28 py-2 text-right font-medium">
                                    {t("actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-slate-500"
                                    >
                                        {t("empty")}
                                    </td>
                                </tr>
                            ) : (
                                sortedRows.map((row) =>
                                    editId === row.id ? (
                                        <tr key={row.id} className="border-b border-slate-100">
                                            <td colSpan={5} className="py-3 px-1">
                                                <form
                                                    onSubmit={handleSaveEdit}
                                                    className="flex flex-col gap-3 xl:grid xl:grid-cols-12 xl:items-end xl:gap-3"
                                                >
                                                    <div className="xl:col-span-2 flex flex-col gap-1">
                                                        <label
                                                            htmlFor={`ref-edit-code-${row.id}`}
                                                            className="text-[12px] font-medium"
                                                        >
                                                            {t("code")}
                                                        </label>
                                                        <input
                                                            id={`ref-edit-code-${row.id}`}
                                                            value={eCode}
                                                            onChange={(e) =>
                                                                setECode(e.target.value)
                                                            }
                                                            className="h-10 w-full border border-slate-200 px-2 text-[13px]"
                                                        />
                                                    </div>
                                                    <div className="xl:col-span-4 flex flex-col gap-1">
                                                        <label
                                                            htmlFor={`ref-edit-title-${row.id}`}
                                                            className="text-[12px] font-medium"
                                                        >
                                                            {t("entityTitle")}
                                                        </label>
                                                        <input
                                                            id={`ref-edit-title-${row.id}`}
                                                            value={eTitle}
                                                            onChange={(e) =>
                                                                setETitle(e.target.value)
                                                            }
                                                            className="h-10 w-full border border-slate-200 px-2 text-[13px]"
                                                        />
                                                    </div>
                                                    <div className="xl:col-span-5 flex flex-col gap-1">
                                                        <label
                                                            htmlFor={`ref-edit-desc-${row.id}`}
                                                            className="text-[12px] font-medium"
                                                        >
                                                            {t("description")}
                                                        </label>
                                                        <input
                                                            id={`ref-edit-desc-${row.id}`}
                                                            value={eDesc}
                                                            onChange={(e) =>
                                                                setEDesc(e.target.value)
                                                            }
                                                            className="h-10 w-full border border-slate-200 px-2 text-[13px]"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 xl:col-span-1">
                                                        <button
                                                            type="submit"
                                                            className="h-10 flex-1 bg-[#0073C5] px-2 text-[12px] font-semibold text-white"
                                                        >
                                                            {t("save")}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={closeEdit}
                                                            className="h-10 flex-1 border border-slate-200 px-2 text-[12px]"
                                                        >
                                                            {t("cancel")}
                                                        </button>
                                                    </div>
                                                </form>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr
                                            key={row.id}
                                            className="border-b border-slate-100"
                                        >
                                            <td className="py-3 pr-3 text-slate-600">
                                                {axisDisplay(row.referentiel)}
                                            </td>
                                            <td className="py-3 pr-3 font-medium tabular-nums text-slate-800">
                                                {row.code}
                                            </td>
                                            <td className="py-3 pr-3 text-slate-800">
                                                {row.title}
                                            </td>
                                            <td className="py-3 pr-3 text-slate-600 hidden md:table-cell max-w-48 truncate">
                                                {row.description || "—"}
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(row)}
                                                        className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                        aria-label={t("editAria")}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(row.id)
                                                        }
                                                        className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-red-600 hover:bg-red-50"
                                                        aria-label={t("deleteAria")}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
