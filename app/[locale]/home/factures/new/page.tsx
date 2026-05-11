"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Search, X } from "lucide-react";

type Step = 1 | 2 | 3;
type ItemKind = "Article" | "Service";

type Client = {
    id: number;
    name: string;
    nif: string;
    rccm: string;
    idNat: string;
    address: string;
    phone: string;
    email: string;
};

type CatalogItem = {
    id: number;
    name: string;
    type: ItemKind;
    tax: number;
    priceHT: number;
};

type InvoiceItem = {
    id: number;
    catalogId: number;
    name: string;
    type: ItemKind;
    quantity: number;
    tax: number;
    priceHT: number;
    men?: number;
    days?: number;
    dailyPrice?: number;
};

type InvoiceForm = {
    clientId: number | null;
    clientName: string;
    nif: string;
    rccm: string;
    idNat: string;
    address: string;
    phone: string;
    email: string;
    invoiceType: string;
    itemKind: ItemKind;
};

const clients: Client[] = [
    {
        id: 1,
        name: "Rawbank",
        nif: "A1234567",
        rccm: "CD/KIN/RCCM/14-B-1456",
        idNat: "01-83-N12345P",
        address: "101, Avenue du Lac C/Gombe",
        phone: "+243 81 00 00 000",
        email: "support.rawbank.cd",
    },
    {
        id: 2,
        name: "EquityBCDC",
        nif: "B9876543",
        rccm: "CD/KIN/RCCM/18-B-9090",
        idNat: "01-83-EBCDC",
        address: "12, Boulevard du 30 Juin C/Gombe",
        phone: "+243 82 220 40 12",
        email: "contact@equitybcdc.cd",
    },
    {
        id: 3,
        name: "Solidaire Banque",
        nif: "C4567890",
        rccm: "CD/KIN/RCCM/20-B-5555",
        idNat: "01-83-SOLID",
        address: "6, Av. Justice C/Gombe",
        phone: "+243 99 000 00 00",
        email: "contact@solidaire.cd",
    },
    {
        id: 4,
        name: "Standardbank",
        nif: "D3333333",
        rccm: "CD/KIN/RCCM/11-B-7890",
        idNat: "01-83-STB",
        address: "Avenue Colonel Ebeya C/Gombe",
        phone: "+243 85 000 00 00",
        email: "info@standardbank.cd",
    },
];

const catalogItems: CatalogItem[] = [
    {
        id: 1,
        name: "Ordinateur portable",
        type: "Article",
        tax: 16,
        priceHT: 850000,
    },
    {
        id: 2,
        name: "Imprimante thermique",
        type: "Article",
        tax: 16,
        priceHT: 320000,
    },
    {
        id: 3,
        name: "Routeur réseau",
        type: "Article",
        tax: 16,
        priceHT: 150000,
    },
    {
        id: 4,
        name: "Licence logiciel",
        type: "Article",
        tax: 16,
        priceHT: 500000,
    },
    {
        id: 5,
        name: "Maintenance",
        type: "Service",
        tax: 16,
        priceHT: 0,
    },
    {
        id: 6,
        name: "Installation",
        type: "Service",
        tax: 16,
        priceHT: 0,
    },
    {
        id: 7,
        name: "Support technique",
        type: "Service",
        tax: 16,
        priceHT: 0,
    },
    {
        id: 8,
        name: "Formation utilisateur",
        type: "Service",
        tax: 16,
        priceHT: 0,
    },
];

const initialForm: InvoiceForm = {
    clientId: null,
    clientName: "",
    nif: "",
    rccm: "",
    idNat: "",
    address: "",
    phone: "",
    email: "",
    invoiceType: "",
    itemKind: "Service",
};

const initialItems: InvoiceItem[] = [
    {
        id: 1,
        catalogId: 5,
        name: "Maintenance",
        type: "Service",
        quantity: 1,
        tax: 16,
        priceHT: 0,
        men: 1,
        days: 1,
        dailyPrice: 10000,
    },
];

async function searchCatalogApi(
    type: ItemKind,
    query: string
): Promise<CatalogItem[]> {
    const q = query.trim().toLowerCase();

    await new Promise((resolve) => setTimeout(resolve, 250));

    return catalogItems.filter((item) => {
        const sameType = item.type === type;
        const matchQuery = !q || item.name.toLowerCase().includes(q);

        return sameType && matchQuery;
    });
}

function formatMoney(value: number) {
    return value.toLocaleString("fr-FR").replace(/\s/g, ".");
}

function getLineSubtotal(item: InvoiceItem) {
    if (item.type === "Service") {
        const men = item.men ?? 1;
        const days = item.days ?? 1;
        const dailyPrice = item.dailyPrice ?? 0;

        return men * days * dailyPrice;
    }

    return item.quantity * item.priceHT;
}

function getLineTax(item: InvoiceItem) {
    return Math.round(getLineSubtotal(item) * (item.tax / 100));
}

function getItemKindLabel(type: ItemKind, t: ReturnType<typeof useTranslations>) {
    return type === "Article" ? t("kind.article") : t("kind.service");
}

function FieldLabel({ children }: { children: ReactNode }) {
    return (
        <label className="mb-2 block text-[17px] font-semibold text-slate-700">
            {children}
        </label>
    );
}

function InputField({
                        placeholder,
                        value,
                        type = "text",
                        readOnly = false,
                        onChange,
                    }: {
    placeholder?: string;
    value?: string;
    type?: string;
    readOnly?: boolean;
    onChange?: (value: string) => void;
}) {
    return (
        <input
            type={type}
            value={value ?? ""}
            readOnly={readOnly}
            placeholder={placeholder}
            onChange={(event) => onChange?.(event.target.value)}
            className={[
                "h-[50px] w-full rounded border border-slate-300 bg-white px-5 text-[17px] font-medium text-slate-700 outline-none",
                "placeholder:text-slate-400 focus:border-[#0879bd]",
                readOnly ? "bg-slate-50 text-slate-500" : "",
            ].join(" ")}
        />
    );
}

function SelectField({
                         placeholder,
                         value,
                         options = [],
                         onChange,
                     }: {
    placeholder?: string;
    value?: string;
    options?: Array<{
        label: string;
        value: string;
    }>;
    onChange?: (value: string) => void;
}) {
    return (
        <div className="relative">
            <select
                value={value ?? ""}
                onChange={(event) => onChange?.(event.target.value)}
                className={[
                    "h-[50px] w-full appearance-none rounded border border-slate-300 bg-white px-5 pr-12 text-[17px] font-medium outline-none",
                    value ? "text-slate-700" : "text-slate-400",
                    "focus:border-[#0879bd]",
                ].join(" ")}
            >
                <option value="">{placeholder ?? "Sélectionnez"}</option>

                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
        </div>
    );
}

function ClientSearchSelect({
                                clients,
                                value,
                                onSelect,
                            }: {
    clients: Client[];
    value: string;
    onSelect: (client: Client) => void;
}) {
    const t = useTranslations("createInvoice");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value);

    useEffect(() => {
        setSearch(value);
    }, [value]);

    const filteredClients = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return clients;

        return clients.filter((client) => {
            return (
                client.name.toLowerCase().includes(q) ||
                client.nif.toLowerCase().includes(q) ||
                client.rccm.toLowerCase().includes(q) ||
                client.phone.toLowerCase().includes(q)
            );
        });
    }, [search]);

    const handleSelectClient = (client: Client) => {
        setSearch(client.name);
        setOpen(false);
        onSelect(client);
    };

    return (
        <div className="relative">
            <div className="relative">
                <input
                    value={search}
                    onFocus={() => setOpen(true)}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setOpen(true);
                    }}
                    placeholder={t("client.searchPlaceholder")}
                    className="h-[50px] w-full rounded border border-slate-300 bg-white px-5 pr-12 text-[17px] font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0879bd]"
                />

                <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
            </div>

            {open && (
                <div className="absolute left-0 right-0 top-[56px] z-30 max-h-[260px] overflow-y-auto border border-slate-200 bg-white shadow-lg">
                    {filteredClients.length === 0 ? (
                        <div className="px-5 py-4 text-sm font-medium text-slate-500">
                            {t("client.empty")}
                        </div>
                    ) : (
                        filteredClients.map((client) => (
                            <button
                                key={client.id}
                                type="button"
                                onClick={() => handleSelectClient(client)}
                                className="flex w-full flex-col items-start border-b border-slate-100 px-5 py-3 text-left hover:bg-slate-50"
                            >
                                <span className="text-[15px] font-semibold text-slate-800">
                                    {client.name}
                                </span>
                                <span className="mt-1 text-xs text-slate-500">
                                    NIF: {client.nif} / RCCM: {client.rccm}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function Stepper({
                     currentStep,
                     itemKind,
                 }: {
    currentStep: Step;
    itemKind: ItemKind;
}) {
    const t = useTranslations("createInvoice");

    const steps = [
        {
            id: 1,
            label: t("steps.client"),
        },
        {
            id: 2,
            label: getItemKindLabel(itemKind, t),
        },
        {
            id: 3,
            label: t("steps.preview"),
        },
    ];

    return (
        <div className="mt-12">
            <div className="relative flex items-start justify-between">
                <div className="absolute left-[35px] right-[35px] top-[17px] h-px bg-slate-300" />

                <div
                    className="absolute left-[35px] top-[17px] h-px bg-[#0EAA2C]"
                    style={{
                        width:
                            currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                    }}
                />

                {steps.map((step) => {
                    const isActive = step.id === currentStep;
                    const isDone = step.id < currentStep;

                    return (
                        <div
                            key={step.id}
                            className="relative z-10 flex w-[140px] flex-col items-center"
                        >
                            <div
                                className={[
                                    "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                                    isActive
                                        ? "bg-[#0879bd] text-white"
                                        : isDone
                                            ? "bg-[#0EAA2C] text-white"
                                            : "bg-slate-300 text-slate-500",
                                ].join(" ")}
                            >
                                {step.id}
                            </div>

                            <p
                                className={[
                                    "mt-4 text-center text-[11px] font-semibold",
                                    isActive
                                        ? "text-[#0879bd]"
                                        : isDone
                                            ? "text-[#0EAA2C]"
                                            : "text-slate-400",
                                ].join(" ")}
                            >
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StepClient({
                        form,
                        setForm,
                        setItems,
                    }: {
    form: InvoiceForm;
    setForm: Dispatch<SetStateAction<InvoiceForm>>;
    setItems: Dispatch<SetStateAction<InvoiceItem[]>>;
}) {
    const t = useTranslations("createInvoice");

    const handleSelectClient = (client: Client) => {
        setForm((prev) => ({
            ...prev,
            clientId: client.id,
            clientName: client.name,
            nif: client.nif,
            rccm: client.rccm,
            idNat: client.idNat,
            address: client.address,
            phone: client.phone,
            email: client.email,
        }));
    };

    const handleChangeItemKind = (value: string) => {
        const itemKind = value as ItemKind;

        setForm((prev) => ({
            ...prev,
            itemKind,
        }));

        setItems([]);
    };

    return (
        <div className="bg-white p-8">
            <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                <div>
                    <FieldLabel>{t("client.client")}</FieldLabel>
                    <ClientSearchSelect
                        clients={clients}
                        value={form.clientName}
                        onSelect={handleSelectClient}
                    />
                </div>

                <div>
                    <FieldLabel>{t("client.clientName")}</FieldLabel>
                    <InputField value={form.clientName} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.nif")}</FieldLabel>
                    <InputField value={form.nif} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.rccm")}</FieldLabel>
                    <InputField value={form.rccm} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.idNat")}</FieldLabel>
                    <InputField value={form.idNat} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.address")}</FieldLabel>
                    <InputField value={form.address} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.phone")}</FieldLabel>
                    <InputField value={form.phone} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.email")}</FieldLabel>
                    <InputField value={form.email} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.invoiceType")}</FieldLabel>
                    <SelectField
                        placeholder={t("client.invoiceTypePlaceholder")}
                        value={form.invoiceType}
                        options={[
                            { label: t("invoiceTypes.sale"), value: "Vente" },
                            { label: t("invoiceTypes.creditNote"), value: "Avoir" },
                            { label: t("invoiceTypes.proforma"), value: "Proforma" },
                        ]}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                invoiceType: value,
                            }))
                        }
                    />
                </div>

                <div>
                    <FieldLabel>{t("client.itemKind")}</FieldLabel>
                    <SelectField
                        placeholder={t("common.select")}
                        value={form.itemKind}
                        options={[
                            { label: t("kind.article"), value: "Article" },
                            { label: t("kind.service"), value: "Service" },
                        ]}
                        onChange={handleChangeItemKind}
                    />
                </div>
            </div>
        </div>
    );
}

function StepCatalog({
                         itemKind,
                         items,
                         setItems,
                     }: {
    itemKind: ItemKind;
    items: InvoiceItem[];
    setItems: Dispatch<SetStateAction<InvoiceItem[]>>;
}) {
    const t = useTranslations("createInvoice");
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
    const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let ignore = false;

        setLoading(true);

        const timer = window.setTimeout(() => {
            searchCatalogApi(itemKind, search)
                .then((results) => {
                    if (!ignore) {
                        setSuggestions(results);
                    }
                })
                .finally(() => {
                    if (!ignore) {
                        setLoading(false);
                    }
                });
        }, 250);

        return () => {
            ignore = true;
            window.clearTimeout(timer);
        };
    }, [itemKind, search]);

    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const addItem = () => {
        if (!selectedItem) return;

        setItems((prev) => [
            ...prev,
            {
                id: Date.now(),
                catalogId: selectedItem.id,
                name: selectedItem.name,
                type: selectedItem.type,
                quantity: 1,
                tax: selectedItem.tax,
                priceHT: selectedItem.priceHT,
                men: selectedItem.type === "Service" ? 1 : undefined,
                days: selectedItem.type === "Service" ? 1 : undefined,
                dailyPrice: selectedItem.type === "Service" ? 10000 : undefined,
            },
        ]);

        setSelectedItem(null);
        setSearch("");
    };

    const updateArticleQuantity = (id: number, quantity: number) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: quantity < 1 || Number.isNaN(quantity) ? 1 : quantity,
                    }
                    : item
            )
        );
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
                        [field]: value < 1 || Number.isNaN(value) ? 1 : value,
                    }
                    : item
            )
        );
    };

    const isArticle = itemKind === "Article";

    return (
        <div className="bg-white p-8">
            <h2 className="mb-4 text-[20px] font-semibold text-slate-700">
                {getItemKindLabel(itemKind, t)}
            </h2>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setSelectedItem(null);
                        }}
                        placeholder={
                            isArticle
                                ? t("catalog.searchArticle")
                                : t("catalog.searchService")
                        }
                        className="h-12 w-full rounded border border-slate-300 px-5 pr-14 text-[18px] font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0879bd]"
                    />

                    <Search className="absolute right-5 top-1/2 size-5 -translate-y-1/2 text-slate-700" />

                    {search && (
                        <div className="absolute left-0 right-0 top-[54px] z-20 max-h-[260px] overflow-y-auto border border-slate-200 bg-white shadow-lg">
                            {loading ? (
                                <div className="px-5 py-3 text-sm font-medium text-slate-500">
                                    {t("catalog.loading")}
                                </div>
                            ) : suggestions.length === 0 ? (
                                <div className="px-5 py-3 text-sm font-medium text-slate-500">
                                    {t("catalog.empty")}
                                </div>
                            ) : (
                                suggestions.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            setSearch(item.name);
                                            setSelectedItem(item);
                                        }}
                                        className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-3 text-left hover:bg-slate-50"
                                    >
                                        <span>
                                            <span className="block text-sm font-semibold text-slate-800">
                                                {item.name}
                                            </span>
                                            <span className="mt-1 block text-xs text-slate-500">
                                                {item.type === "Article"
                                                    ? `${t("table.tax")} ${item.tax}% / ${t(
                                                        "table.priceHT"
                                                    )} ${formatMoney(item.priceHT)}`
                                                    : `${t("table.tax")} ${item.tax}% / ${t(
                                                        "catalog.dailyService"
                                                    )}`}
                                            </span>
                                        </span>

                                        <span className="text-xs font-semibold text-slate-400">
                                            {getItemKindLabel(item.type, t)}
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

            <div className="mt-16 overflow-x-auto">
                {isArticle ? (
                    <>
                        <div className="grid min-w-[780px] grid-cols-[90px_1fr_150px_150px_180px_40px] bg-slate-100 px-6 py-3 text-[17px] font-semibold text-slate-400">
                            <div>{t("table.number")}</div>
                            <div>{t("kind.article")}</div>
                            <div>{t("table.quantity")}</div>
                            <div>{t("table.tax")}</div>
                            <div>{t("table.priceHT")}</div>
                            <div />
                        </div>

                        {items.length === 0 ? (
                            <div className="min-w-[780px] px-6 py-10 text-center text-sm font-medium text-slate-400">
                                {t("catalog.noArticle")}
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid min-w-[780px] grid-cols-[90px_1fr_150px_150px_180px_40px] items-center px-6 py-5 text-[17px] font-semibold text-slate-700"
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
                        <div className="grid min-w-[1050px] grid-cols-[70px_1fr_130px_130px_180px_120px_170px_40px] bg-slate-100 px-6 py-3 text-[16px] font-semibold text-slate-400">
                            <div>{t("table.number")}</div>
                            <div>{t("kind.service")}</div>
                            <div>{t("table.men")}</div>
                            <div>{t("table.days")}</div>
                            <div>{t("table.dailyPrice")}</div>
                            <div>{t("table.tax")}</div>
                            <div>{t("table.totalHT")}</div>
                            <div />
                        </div>

                        {items.length === 0 ? (
                            <div className="min-w-[1050px] px-6 py-10 text-center text-sm font-medium text-slate-400">
                                {t("catalog.noService")}
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid min-w-[1050px] grid-cols-[70px_1fr_130px_130px_180px_120px_170px_40px] items-center px-6 py-5 text-[16px] font-semibold text-slate-700"
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

                                    <div>{formatMoney(getLineSubtotal(item))}</div>

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

function StepPreview({
                         form,
                         items,
                         setCurrentStep,
                     }: {
    form: InvoiceForm;
    items: InvoiceItem[];
    setCurrentStep: Dispatch<SetStateAction<Step>>;
}) {
    const t = useTranslations("createInvoice");

    const subtotal = items.reduce((sum, item) => sum + getLineSubtotal(item), 0);
    const tax = items.reduce((sum, item) => sum + getLineTax(item), 0);
    const total = subtotal + tax;

    const clientName = form.clientName || "Rawbank";
    const clientAddress = form.address || "101, Avenue du Lac C/Gombe";
    const clientPhone = form.phone || "+243 81 00 00 000";
    const clientEmail = form.email || "support.rawbank.cd";

    const isArticle = form.itemKind === "Article";

    const handleSubmit = () => {
        console.log("Soumettre la facture", {
            form,
            items,
            subtotal,
            tax,
            total,
        });
    };

    const handleSave = () => {
        console.log("Enregistrer la facture", {
            form,
            items,
            subtotal,
            tax,
            total,
        });
    };

    const handleNormalize = () => {
        console.log("Normaliser la facture", {
            form,
            items,
            subtotal,
            tax,
            total,
        });
    };

    const handleCancel = () => {
        setCurrentStep(1);
    };

    return (
        <div className="bg-white p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-[25px] font-semibold text-slate-700">
                        {t("steps.preview")}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-400">
                        Vérifiez les informations de la facture avant validation.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="h-12 rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        {t("preview.editClient")}
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="h-12 rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        {isArticle
                            ? t("preview.editArticles")
                            : t("preview.editServices")}
                    </button>
                </div>
            </div>

            <section className="w-full">
                <div className="rounded border border-slate-300 bg-white p-10">
                    <div className="mb-12 flex items-start justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center border-4 border-slate-900 text-sm font-black text-slate-900">
                                    IK
                                </div>

                                <div>
                                    <p className="text-3xl font-black leading-none tracking-tight text-slate-900">
                                        iKwook
                                    </p>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
                                        Invoice
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-5xl font-black uppercase tracking-tight text-black">
                            FACTURE
                        </h2>
                    </div>

                    <div className="mb-5 flex items-end justify-between border-b-2 border-black pb-2">
                        <div className="text-sm font-bold uppercase leading-5 text-black">
                            <p>Date : 02/11/2026</p>
                            <p>Échéance : 30/11/2026</p>
                        </div>

                        <p className="text-lg font-black uppercase text-black">
                            Facture N° : 101
                        </p>
                    </div>

                    <div className="mb-20 grid grid-cols-1 gap-10 md:grid-cols-2">
                        <div>
                            <p className="mb-4 text-sm font-black uppercase text-black">
                                Émetteur :
                            </p>

                            <p className="text-sm font-bold leading-5 text-black">
                                iKwook Sarl
                                <br />
                                support.ikwook.cd
                                <br />
                                +243 822 22 000
                                <br />
                                76, Avenue de Justice C/Gombe
                            </p>
                        </div>

                        <div className="md:text-right">
                            <p className="mb-4 text-sm font-black uppercase text-black">
                                Destinataire :
                            </p>

                            <p className="text-sm font-bold leading-5 text-black">
                                {clientName}
                                <br />
                                {clientEmail}
                                <br />
                                {clientPhone}
                                <br />
                                {clientAddress}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isArticle ? (
                            <>
                                <div className="grid min-w-[650px] grid-cols-[80px_1fr_120px_120px_140px] border-b-2 border-black pb-3 text-sm font-black text-black">
                                    <div>{t("table.number")}</div>
                                    <div>{t("kind.article")}</div>
                                    <div className="text-right">{t("table.quantity")}</div>
                                    <div className="text-right">{t("table.tax")}</div>
                                    <div className="text-right">{t("table.priceHT")}</div>
                                </div>

                                {items.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="grid min-w-[650px] grid-cols-[80px_1fr_120px_120px_140px] border-b border-slate-400 py-4 text-sm font-semibold text-slate-700"
                                    >
                                        <div>{index + 1}</div>
                                        <div>{item.name}</div>
                                        <div className="text-right">{item.quantity}</div>
                                        <div className="text-right">{item.tax}%</div>
                                        <div className="text-right">
                                            {formatMoney(item.priceHT)}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <div className="grid min-w-[760px] grid-cols-[55px_1fr_80px_80px_130px_90px_120px] border-b-2 border-black pb-3 text-sm font-black text-black">
                                    <div>{t("table.number")}</div>
                                    <div>{t("kind.service")}</div>
                                    <div className="text-right">{t("table.men")}</div>
                                    <div className="text-right">{t("table.days")}</div>
                                    <div className="text-right">
                                        {t("table.dailyPriceShort")}
                                    </div>
                                    <div className="text-right">{t("table.tax")}</div>
                                    <div className="text-right">{t("table.totalHT")}</div>
                                </div>

                                {items.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="grid min-w-[760px] grid-cols-[55px_1fr_80px_80px_130px_90px_120px] border-b border-slate-400 py-4 text-sm font-semibold text-slate-700"
                                    >
                                        <div>{index + 1}</div>
                                        <div>{item.name}</div>
                                        <div className="text-right">{item.men ?? 1}</div>
                                        <div className="text-right">{item.days ?? 1}</div>
                                        <div className="text-right">
                                            {formatMoney(item.dailyPrice ?? 0)}
                                        </div>
                                        <div className="text-right">{item.tax}%</div>
                                        <div className="text-right">
                                            {formatMoney(getLineSubtotal(item))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
                        <div className="pt-8">
                            <p className="mb-5 text-lg font-black uppercase text-black">
                                Règlement :
                            </p>

                            <p className="text-sm leading-5 text-black">
                                <span className="font-bold">Par virement bancaire :</span>
                                <br />
                                Banque : Rawbank
                                <br />
                                Compte : 123-456-7890
                            </p>
                        </div>

                        <div className="ml-auto w-full max-w-[320px]">
                            <div className="space-y-3">
                                <div className="flex justify-between text-lg font-black text-black">
                                    <span>{t("summary.subtotal")} :</span>
                                    <span>{formatMoney(subtotal)}</span>
                                </div>

                                <div className="flex justify-between text-lg font-black text-black">
                                    <span>{t("summary.tax")} :</span>
                                    <span>{formatMoney(tax)}</span>
                                </div>

                                <div className="flex justify-between text-lg font-black text-black">
                                    <span>Remise :</span>
                                    <span>-</span>
                                </div>

                                <div className="flex justify-between border-t border-black pt-3 text-lg font-black text-black">
                                    <span>{t("summary.total")} :</span>
                                    <span>{formatMoney(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 max-w-[420px] space-y-5 text-xs leading-5 text-black">
                        <p>
                            En cas de retard de paiement, une indemnité de retard peut être
                            appliquée conformément aux conditions générales.
                        </p>

                        <p>
                            Conditions générales de vente consultables sur le site :
                            www.ikwook.cd
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8]"
                    >
                        Soumettre
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="h-12 w-52 rounded bg-slate-700 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Enregistrer
                    </button>

                    <button
                        type="button"
                        onClick={handleNormalize}
                        className="h-12 w-52 rounded bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                    >
                        Normaliser
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="h-12 w-52 rounded bg-slate-400 text-sm font-semibold text-white hover:bg-slate-500"
                    >
                        Annuler
                    </button>
                </div>
            </section>
        </div>
    );
}

export default function CreateInvoicePage() {
    const t = useTranslations("createInvoice");

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [items, setItems] = useState<InvoiceItem[]>(initialItems);
    const [form, setForm] = useState<InvoiceForm>(initialForm);

    const visibleItems = useMemo(() => {
        return items.filter((item) => item.type === form.itemKind);
    }, [items, form.itemKind]);

    const canGoBack = currentStep > 1;

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, 3) as Step);
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    };

    const currentContent = useMemo(() => {
        if (currentStep === 1) {
            return <StepClient form={form} setForm={setForm} setItems={setItems} />;
        }

        if (currentStep === 2) {
            return (
                <StepCatalog
                    itemKind={form.itemKind}
                    items={visibleItems}
                    setItems={setItems}
                />
            );
        }

        return (
            <StepPreview
                form={form}
                items={visibleItems}
                setCurrentStep={setCurrentStep}
            />
        );
    }, [currentStep, form, visibleItems]);

    return (
        <main className="w-full text-slate-700">
            <div className="mb-3 text-[13px] font-medium text-slate-400">
                {t("breadcrumb.home")} /{" "}
                <span className="font-semibold text-slate-600">
                    {t("breadcrumb.createInvoice")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {t("title")}
            </h1>

            <Stepper currentStep={currentStep} itemKind={form.itemKind} />

            <div className="mt-4 min-h-[500px]">{currentContent}</div>

            {currentStep !== 3 && (
                <div className="mt-0 flex justify-end gap-5 bg-white px-3 py-3">
                    <button
                        type="button"
                        onClick={canGoBack ? prevStep : undefined}
                        className="h-12 w-52 rounded bg-slate-400 text-[14px] font-semibold text-white hover:bg-slate-500"
                    >
                        {canGoBack ? t("common.previous") : t("common.cancel")}
                    </button>

                    <button
                        type="button"
                        onClick={nextStep}
                        className="h-12 w-52 rounded bg-[#0879bd] text-[20px] font-semibold text-white hover:bg-[#076ca8]"
                    >
                        {t("common.next")}
                    </button>
                </div>
            )}
        </main>
    );
}
