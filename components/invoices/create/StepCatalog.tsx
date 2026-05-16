"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { useInvoiceFournitures } from "@/core/hooks/invoices/useInvoices";

import { FieldError } from "./Fields";
import {
    formatMoney,
    getLineSubtotal,
    getLineTotal,
} from "./utils";
import type {
    CatalogItem,
    InvoiceFormErrors,
    InvoiceItem,
    ItemKind,
    SetInvoiceErrors,
    SetInvoiceItems,
} from "./types";

export function StepCatalog({
                                itemKind,
                                items,
                                errors,
                                setItems,
                                setErrors,
                            }: {
    itemKind: ItemKind;
    items: InvoiceItem[];
    errors: InvoiceFormErrors;
    setItems: SetInvoiceItems;
    setErrors: SetInvoiceErrors;
}) {
    const t = useTranslations("createInvoice");

    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] =
        useState<CatalogItem | null>(null);

    const {
        data: fournituresData,
        isLoading,
        isError,
    } = useInvoiceFournitures({
        page: 1,
        perPage: 100,
    });

    const catalogItems: CatalogItem[] = useMemo(() => {
        return (fournituresData?.items ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            code: item.code,
            type: itemKind,
            tax: Number(item.tax_group_info?.rate ?? 0),
            taxGroupId: item.tax_group,
            taxGroupCode: item.tax_group_info?.code ?? "",
            taxGroupTitle: item.tax_group_info?.title ?? "",
            taxGroupMention: item.tax_group_info?.mention ?? "",
            priceHT: Number(item.price_before ?? 0),
            priceTTC: Number(item.price_after ?? 0),
            currency: item.currency === "USD" ? "USD" : "CDF",
        }));
    }, [fournituresData?.items, itemKind]);

    const suggestions = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) {
            return catalogItems;
        }

        return catalogItems.filter((item) => {
            return (
                item.name.toLowerCase().includes(q) ||
                item.code?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
            );
        });
    }, [catalogItems, search]);

    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const addItem = () => {
        if (!selectedItem) return;

        const newItem: InvoiceItem = {
            id: Date.now(),
            catalogId: selectedItem.id,
            name: selectedItem.name,
            type: selectedItem.type,
            quantity: 1,

            tax: selectedItem.tax,
            taxGroupId: selectedItem.taxGroupId,
            taxGroupCode: selectedItem.taxGroupCode,
            taxGroupTitle: selectedItem.taxGroupTitle,
            taxGroupMention: selectedItem.taxGroupMention,

            priceHT: selectedItem.priceHT,
            priceTTC: selectedItem.priceTTC,
            currency: selectedItem.currency,

            men: selectedItem.type === "Service" ? 1 : undefined,
            days: selectedItem.type === "Service" ? 1 : undefined,
            dailyPrice:
                selectedItem.type === "Service"
                    ? selectedItem.priceHT || 10000
                    : undefined,
        };

        setItems((prev) => [...prev, newItem]);

        setSelectedItem(null);
        setSearch("");
        setIsOpen(false);

        setErrors((prev) => ({
            ...prev,
            items: undefined,
        }));
    };

    const updateArticleQuantity = (id: number, quantity: number) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity:
                            quantity < 1 || Number.isNaN(quantity)
                                ? 1
                                : quantity,
                    }
                    : item
            )
        );

        setErrors((prev) => ({
            ...prev,
            items: undefined,
        }));
    };

    const updateServiceField = (
        id: number,
        field: "men" | "days" | "dailyPrice",
        value: number
    ) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        [field]:
                            value < 1 || Number.isNaN(value) ? 1 : value,
                    }
                    : item
            )
        );

        setErrors((prev) => ({
            ...prev,
            items: undefined,
        }));
    };

    const isArticle = itemKind === "Article";

    return (
        <div className="bg-white p-8">
            <h2 className="mb-4 text-[20px] font-semibold text-slate-700">
                {isArticle ? t("kind.article") : t("kind.service")}
            </h2>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <input
                        value={search}
                        onFocus={() => setIsOpen(true)}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setSelectedItem(null);
                            setIsOpen(true);
                        }}
                        placeholder={
                            isArticle
                                ? t("catalog.searchArticle")
                                : t("catalog.searchService")
                        }
                        className="h-12 w-full rounded border border-slate-300 px-5 pr-14 text-[18px] font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0879bd]"
                    />

                    <Search className="absolute right-5 top-1/2 size-5 -translate-y-1/2 text-slate-700" />

                    {isOpen && (
                        <div className="absolute left-0 right-0 top-[54px] z-20 max-h-[300px] overflow-y-auto border border-slate-200 bg-white shadow-lg">
                            {isLoading ? (
                                <div className="px-5 py-3 text-sm font-medium text-slate-500">
                                    Chargement...
                                </div>
                            ) : isError ? (
                                <div className="px-5 py-3 text-sm font-medium text-red-500">
                                    Impossible de charger les fournitures.
                                </div>
                            ) : suggestions.length === 0 ? (
                                <div className="px-5 py-3 text-sm font-medium text-slate-500">
                                    Aucun résultat
                                </div>
                            ) : (
                                suggestions.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            setSearch(item.name);
                                            setSelectedItem(item);
                                            setIsOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-3 text-left hover:bg-slate-50"
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold text-slate-800">
                                                {item.name}
                                            </span>

                                            <span className="mt-1 block text-xs text-slate-500">
                                                {item.code
                                                    ? `${item.code} / `
                                                    : ""}
                                                HT {item.currency}{" "}
                                                {formatMoney(item.priceHT)}
                                                {" / "}
                                                TVA {item.tax}%
                                            </span>
                                        </span>

                                        <span className="ml-4 shrink-0 text-xs font-semibold text-slate-400">
                                            {item.taxGroupMention || `TVA ${item.tax}%`}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={addItem}
                    disabled={!selectedItem}
                    className="h-12 w-52 rounded bg-[#0879bd] text-[14px] font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {t("common.add")}
                </button>
            </div>

            <FieldError message={errors.items} />

            <div className="mt-16 overflow-x-auto">
                {isArticle ? (
                    <>
                        <div className="grid min-w-[1040px] grid-cols-[90px_1fr_130px_130px_150px_170px_170px_40px] bg-slate-100 px-6 py-3 text-[17px] font-semibold text-slate-400">
                            <div>{t("table.number")}</div>
                            <div>{t("kind.article")}</div>
                            <div>{t("table.quantity")}</div>
                            <div>{t("table.tax")}</div>
                            <div>{t("table.priceHT")}</div>
                            <div>Devise</div>
                            <div>Total TTC</div>
                            <div />
                        </div>

                        {items.length === 0 ? (
                            <div className="min-w-[1040px] px-6 py-10 text-center text-sm font-medium text-slate-400">
                                {t("catalog.noArticle")}
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid min-w-[1040px] grid-cols-[90px_1fr_130px_130px_150px_170px_170px_40px] items-center px-6 py-5 text-[17px] font-semibold text-slate-700"
                                >
                                    <div>{index + 1}</div>

                                    <div>{item.name}</div>

                                    <div>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(event) =>
                                                updateArticleQuantity(
                                                    item.id,
                                                    Number(event.target.value)
                                                )
                                            }
                                            className="h-11 w-24 rounded border border-slate-300 px-3 text-center text-[16px] font-semibold outline-none focus:border-[#0879bd]"
                                        />
                                    </div>

                                    <div>{item.tax}%</div>

                                    <div>{formatMoney(item.priceHT)}</div>

                                    <div>{item.currency}</div>

                                    <div>
                                        {formatMoney(getLineTotal(item))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="flex size-8 items-center justify-center text-slate-600 hover:bg-slate-100"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </>
                ) : (
                    <>
                        <div className="grid min-w-[1300px] grid-cols-[70px_1fr_130px_130px_180px_130px_150px_150px_170px_40px] bg-slate-100 px-6 py-3 text-[16px] font-semibold text-slate-400">
                            <div>{t("table.number")}</div>
                            <div>{t("kind.service")}</div>
                            <div>{t("table.men")}</div>
                            <div>{t("table.days")}</div>
                            <div>{t("table.dailyPrice")}</div>
                            <div>{t("table.tax")}</div>
                            <div>{t("table.totalHT")}</div>
                            <div>Devise</div>
                            <div>Total TTC</div>
                            <div />
                        </div>

                        {items.length === 0 ? (
                            <div className="min-w-[1300px] px-6 py-10 text-center text-sm font-medium text-slate-400">
                                {t("catalog.noService")}
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid min-w-[1300px] grid-cols-[70px_1fr_130px_130px_180px_130px_150px_150px_170px_40px] items-center px-6 py-5 text-[16px] font-semibold text-slate-700"
                                >
                                    <div>{index + 1}</div>

                                    <div>{item.name}</div>

                                    <div>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.men ?? 1}
                                            onChange={(event) =>
                                                updateServiceField(
                                                    item.id,
                                                    "men",
                                                    Number(event.target.value)
                                                )
                                            }
                                            className="h-11 w-24 rounded border border-slate-300 px-3 text-center text-[16px] font-semibold outline-none focus:border-[#0879bd]"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.days ?? 1}
                                            onChange={(event) =>
                                                updateServiceField(
                                                    item.id,
                                                    "days",
                                                    Number(event.target.value)
                                                )
                                            }
                                            className="h-11 w-24 rounded border border-slate-300 px-3 text-center text-[16px] font-semibold outline-none focus:border-[#0879bd]"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.dailyPrice ?? 10000}
                                            onChange={(event) =>
                                                updateServiceField(
                                                    item.id,
                                                    "dailyPrice",
                                                    Number(event.target.value)
                                                )
                                            }
                                            className="h-11 w-36 rounded border border-slate-300 px-3 text-center text-[16px] font-semibold outline-none focus:border-[#0879bd]"
                                        />
                                    </div>

                                    <div>{item.tax}%</div>

                                    <div>
                                        {formatMoney(getLineSubtotal(item))}
                                    </div>

                                    <div>{item.currency}</div>

                                    <div>
                                        {formatMoney(getLineTotal(item))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="flex size-8 items-center justify-center text-slate-600 hover:bg-slate-100"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
