"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { useInvoiceFournitures } from "@/core/hooks/invoices/useInvoices";
import { useFournituresList } from "@/core/hooks/fournitures/useFournituresList";

import { FieldError } from "./Fields";
import { formatMoney, getLineSubtotal, getLineTotal } from "./utils";
import type {
    CatalogItem,
    InvoiceFormErrors,
    InvoiceItem,
    ItemKind,
    SetInvoiceErrors,
    SetInvoiceItems,
} from "./types";

type CatalogApiItem = {
    id?: string | number;
    name?: unknown;
    description?: unknown;
    code?: unknown;
    tax_group?: number;
    tax_group_info?: {
        rate?: unknown;
        code?: unknown;
        title?: unknown;
        mention?: unknown;
    };
    price_before?: unknown;
    price_after?: unknown;
    currency?: unknown;
};

function text(value: unknown) {
    return typeof value === "string" ? value : "";
}

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

    const isArticle = itemKind === "Article";

    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

    const {
        data: fournituresData,
        isLoading: isLoadingFournitures,
        isError: isErrorFournitures,
    } = useInvoiceFournitures({
        page: 1,
        perPage: 100,
    });

    const {
        data: services,
        isLoading: isLoadingServices,
        isError: isErrorServices,
    } = useFournituresList();

    const isLoading = isArticle ? isLoadingFournitures : isLoadingServices;
    const isError = isArticle ? isErrorFournitures : isErrorServices;

    const currentItems = useMemo(() => {
        return items.filter((item) => item.type === itemKind);
    }, [items, itemKind]);

    const catalogItems: CatalogItem[] = useMemo(() => {
        const sourceItems = isArticle
            ? fournituresData?.items ?? []
            : services?.items ?? [];

        return sourceItems.map((item: CatalogApiItem) => ({
            id: Number(item.id),
            name: text(item.name),
            description: text(item.description),
            code: text(item.code),
            type: itemKind,
            tax: Number(item.tax_group_info?.rate ?? 0),
            taxGroupId: item.tax_group,
            taxGroupCode: text(item.tax_group_info?.code),
            taxGroupTitle: text(item.tax_group_info?.title),
            taxGroupMention: text(item.tax_group_info?.mention),
            priceHT: Number(item.price_before ?? 0),
            priceTTC: Number(item.price_after ?? 0),
            currency: item.currency === "USD" ? "USD" : "CDF",
        }));
    }, [fournituresData?.items, services?.items, isArticle, itemKind]);

    const suggestions = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return catalogItems;

        return catalogItems.filter((item) => {
            return (
                item.name.toLowerCase().includes(q) ||
                item.code?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
            );
        });
    }, [catalogItems, search]);

    const resetSelection = () => {
        setSelectedItem(null);
        setSearch("");
        setIsOpen(false);

        setErrors((prev) => ({
            ...prev,
            items: undefined,
        }));
    };

    const removeItem = (id: number) => {
        setItems((prev) =>
            prev.filter((item) => item.type !== itemKind || item.id !== id)
        );
    };

    const addItem = () => {
        if (!selectedItem) return;

        setItems((prev) => {
            const sameKindItems = prev.filter((item) => item.type === itemKind);
            const selectedName = selectedItem.name.trim().toLowerCase();

            const existingItem = sameKindItems.find(
                (item) => item.name.trim().toLowerCase() === selectedName
            );

            if (existingItem) {
                return prev.map((item) => {
                    if (item.type !== itemKind) return item;
                    if (item.id !== existingItem.id) return item;

                    if (item.type === "Article") {
                        return {
                            ...item,
                            quantity: (item.quantity ?? 1) + 1,
                            code: item.code ?? selectedItem.code,
                        };
                    }

                    return {
                        ...item,
                        men: (item.men ?? 1) + 1,
                        code: item.code ?? selectedItem.code,
                    };
                });
            }

            const newItem: InvoiceItem = {
                id: Date.now(),
                catalogId: selectedItem.id,
                code: selectedItem.code,
                name: selectedItem.name,
                type: itemKind,
                quantity: 1,

                tax: selectedItem.tax,
                taxGroupId: selectedItem.taxGroupId,
                taxGroupCode: selectedItem.taxGroupCode,
                taxGroupTitle: selectedItem.taxGroupTitle,
                taxGroupMention: selectedItem.taxGroupMention,

                priceHT: selectedItem.priceHT,
                priceTTC: selectedItem.priceTTC,
                currency: selectedItem.currency,

                men: itemKind === "Service" ? 1 : undefined,
                days: itemKind === "Service" ? 1 : undefined,
                dailyPrice:
                    itemKind === "Service"
                        ? selectedItem.priceHT || 10000
                        : undefined,
            };

            return [...prev, newItem];
        });

        resetSelection();
    };

    const updateArticleQuantity = (id: number, quantity: number) => {
        setItems((prev) =>
            prev.map((item) =>
                    item.type === itemKind && item.id === id
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
                    item.type === itemKind && item.id === id
                        ? {
                            ...item,
                            [field]:
                                value < 1 || Number.isNaN(value)
                                    ? 1
                                    : value,
                        }
                        : item
                )
        );

        setErrors((prev) => ({
            ...prev,
            items: undefined,
        }));
    };

    return (
        <div className="bg-white">
            <h2 className="p-4 text-[20px] font-semibold text-slate-700">
                {isArticle ? t("kind.article") : t("kind.service")}
            </h2>

            <div className="flex gap-4 p-4">
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
                        className="h-12 w-full border border-slate-300 px-5 pr-14 text-[18px] font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0879bd]"
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
                                    {isArticle
                                        ? "Impossible de charger les articles."
                                        : "Impossible de charger les services."}
                                </div>
                            ) : suggestions.length === 0 ? (
                                <div className="px-5 py-3 text-sm font-medium text-slate-500">
                                    Aucun résultat
                                </div>
                            ) : (
                                suggestions.map((item) => (
                                    <button
                                        key={`${item.type}-${item.id}-${item.code}`}
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
                                            {item.taxGroupMention ||
                                                `TVA ${item.tax}%`}
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
                    className="h-12 w-52 bg-[#0879bd] text-[14px] font-semibold text-white hover:bg-[#076ca8] disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {t("common.add")}
                </button>
            </div>

            <FieldError message={errors.items} />

            <div className="mt-2 p-4">
                {isArticle ? (
                    <>
                        <div className="grid min-w-[1160px] grid-cols-[70px_140px_1fr_130px_130px_150px_150px_170px_40px] bg-slate-100 px-6 py-3 text-[17px] font-semibold text-slate-400">
                            <div>{t("table.number")}</div>
                            <div>Code</div>
                            <div>{t("kind.article")}</div>
                            <div>{t("table.quantity")}</div>
                            <div>{t("table.tax")}</div>
                            <div>{t("table.priceHT")}</div>
                            <div>Total TTC</div>
                            <div />
                        </div>

                        {currentItems.length === 0 ? (
                            <div className="min-w-[1160px] px-6 py-10 text-center text-sm font-medium text-slate-400">
                                {t("catalog.noArticle")}
                            </div>
                        ) : (
                            currentItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid min-w-[1160px] grid-cols-[70px_140px_1fr_130px_130px_150px_150px_170px_40px] items-center px-6 py-5 text-[17px] font-semibold text-slate-700"
                                >
                                    <div>{index + 1}</div>
                                    <div>{item.code || "-"}</div>
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
                                            className="h-11 w-24 border border-slate-300 px-3 text-center text-[16px] font-semibold outline-none focus:border-[#0879bd]"
                                        />
                                    </div>

                                    <div>{item.tax}%</div>
                                    <div>{formatMoney(item.priceHT)}</div>
                                    <div>{formatMoney(getLineTotal(item))}</div>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="flex size-8 items-center justify-center text-red-600 hover:bg-slate-100"
                                    >
                                        <X className="size-4" color="red" />
                                    </button>
                                </div>
                            ))
                        )}
                    </>
                ) : (
                    <>
                        <div className="grid min-w-[1400px] grid-cols-[70px_140px_1fr_130px_130px_180px_130px_150px_150px_170px_40px] bg-slate-100 px-6 py-3 text-[16px] font-semibold text-slate-400">
                            <div>{t("table.number")}</div>
                            <div>Code</div>
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

                        {currentItems.length === 0 ? (
                            <div className="min-w-[1420px] px-6 py-10 text-center text-sm font-medium text-slate-400">
                                {t("catalog.noService")}
                            </div>
                        ) : (
                            currentItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid min-w-[1420px] grid-cols-[70px_140px_1fr_130px_130px_180px_130px_150px_150px_170px_40px] items-center px-6 py-5 text-[16px] font-semibold text-slate-700"
                                >
                                    <div>{index + 1}</div>
                                    <div>{item.code || "-"}</div>
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
                                            className="h-11 w-24 border border-slate-300 px-3 text-center text-[16px] font-semibold outline-none focus:border-[#0879bd]"
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
                                            className="h-11 w-24 border border-slate-300 px-3 text-center text-[16px] font-semibold outline-none focus:border-[#0879bd]"
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
                                            className="h-11 w-36 border border-slate-300 px-3 text-center text-[16px] font-semibold outline-none focus:border-[#0879bd]"
                                        />
                                    </div>

                                    <div>{item.tax}%</div>
                                    <div>{formatMoney(getLineSubtotal(item))}</div>
                                    <div>{item.currency}</div>
                                    <div>{formatMoney(getLineTotal(item))}</div>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="flex size-8 items-center justify-center text-red-600 hover:bg-slate-100"
                                    >
                                        <X className="size-4" color="red" />
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
