"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    ChevronLeft,
    ChevronRight,
    House,
    Loader2,
    Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    FieldError,
    FieldLabel,
    InputField,
    SelectField,
} from "@/components/invoices/create/Fields";
import {
    useInvoiceContracts,
    useInvoices,
} from "@/core/hooks/invoices/useInvoices";
import {
    useCreatePayment,
    usePaymentChannelReferentials,
    usePaymentMethodReferentials,
    usePayments,
} from "@/core/hooks/payment/usePayments";
import type { PaymentRecord } from "@/core/schemas/payment.schema";
import { getAxiosErrorMessage } from "@/core/utils/apiResponse";

const PER_PAGE = 20;

type PageMode = "list" | "create";
type CreateStep = 1 | 2;

function formatAmount(amount: number | undefined, currency: string | undefined) {
    const cur = (currency ?? "").trim() || "—";
    if (amount === undefined || Number.isNaN(amount)) {
        return `${cur} —`;
    }

    return `${cur} ${new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 2,
    }).format(amount)}`;
}

function paymentRowLabel(row: PaymentRecord, index: number): string {
    if (row.reference && String(row.reference).trim() !== "") {
        return String(row.reference);
    }
    if (row.id !== undefined) {
        return `#${row.id}`;
    }
    return `#${index + 1}`;
}

function pickTruthyString(...vals: unknown[]): string | undefined {
    for (const v of vals) {
        if (typeof v === "string" && v.trim() !== "") {
            return v.trim();
        }
    }
    return undefined;
}

function paymentInvoiceDisplayName(
    row: PaymentRecord,
    invoiceLabelById: Map<number, string>
): string {
    const r = row as Record<string, unknown>;
    const nested = r.invoice;

    if (nested && typeof nested === "object") {
        const o = nested as Record<string, unknown>;
        const fromNested = pickTruthyString(
            o.invoice_ref,
            o.reference,
            o.number,
            o.invoice_number,
            o.title,
            o.name
        );
        if (fromNested) return fromNested;
    }

    const fromRow = pickTruthyString(
        r.invoice_ref,
        r.invoice_number,
        r.invoice_name,
        r.number
    );
    if (fromRow) return fromRow;

    if (row.invoice_id !== undefined) {
        return invoiceLabelById.get(row.invoice_id) ?? `#${row.invoice_id}`;
    }

    return "—";
}

function paymentDisplayDateIso(row: PaymentRecord): string | undefined {
    const r = row as Record<string, unknown>;
    const keys = [
        "payment_date",
        "paid_at",
        "created_at",
        "updated_at",
        "date",
    ] as const;

    for (const k of keys) {
        const v = r[k];
        if (typeof v === "string" && v.trim() !== "") {
            return v.trim();
        }
    }

    return undefined;
}

function formatPaymentTableDate(raw: string): string {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
        return raw;
    }
    return d.toLocaleString("fr-FR");
}

function PaymentStepper({ currentStep }: { currentStep: CreateStep }) {
    const t = useTranslations("paymentsPage");

    const steps = [
        { id: 1 as const, label: t("stepper.step1") },
        { id: 2 as const, label: t("stepper.step2") },
    ];

    return (
        <div className="mt-12">
            <div className="relative flex items-start justify-between">
                <div className="absolute left-[35px] right-[35px] top-[17px] h-px bg-slate-300" />

                <div
                    className="absolute left-[35px] top-[17px] h-px bg-[#0EAA2C]"
                    style={{
                        width: currentStep === 1 ? "0%" : "100%",
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

export default function PaymentsPage() {
    const t = useTranslations("paymentsPage");

    const [mode, setMode] = useState<PageMode>("list");
    const [createStep, setCreateStep] = useState<CreateStep>(1);

    const [page, setPage] = useState(1);

    const [invoiceIdStr, setInvoiceIdStr] = useState("");
    const [contractIdStr, setContractIdStr] = useState("");
    const [amountStr, setAmountStr] = useState("");
    const [currencyStr, setCurrencyStr] = useState("USD");
    const [channelIdStr, setChannelIdStr] = useState("");
    const [methodIdStr, setMethodIdStr] = useState("");
    const [exchangeRateStr, setExchangeRateStr] = useState("1");
    const [collectorStr, setCollectorStr] = useState("");
    const [drawerStr, setDrawerStr] = useState("");
    const [formError, setFormError] = useState("");

    const { data, isLoading, isError, isFetching } = usePayments({
        page,
        perPage: PER_PAGE,
    });

    const { data: invoicesData } = useInvoices({
        page: 1,
        perPage: 100,
    });

    const invoiceLabelById = useMemo(() => {
        const map = new Map<number, string>();
        for (const inv of invoicesData?.items ?? []) {
            const ext = inv as { invoice_ref?: string };
            const label =
                pickTruthyString(ext.invoice_ref, inv.invoice_number) ??
                `#${inv.id}`;
            map.set(inv.id, label);
        }
        return map;
    }, [invoicesData?.items]);

    const selectedInvoice = useMemo(() => {
        const id = Number(invoiceIdStr);
        if (!invoiceIdStr.trim() || Number.isNaN(id)) return null;
        return (
            (invoicesData?.items ?? []).find((inv) => inv.id === id) ?? null
        );
    }, [invoiceIdStr, invoicesData?.items]);

    const resolvedClientId = selectedInvoice?.client_id;

    const { data: contractsData } = useInvoiceContracts({
        client_id:
            typeof resolvedClientId === "number" && resolvedClientId > 0
                ? resolvedClientId
                : undefined,
        page: 1,
        perPage: 100,
    });

    const { data: channelRefs = [], isPending: channelsPending } =
        usePaymentChannelReferentials();

    const { data: methodRefs = [], isPending: methodsPending } =
        usePaymentMethodReferentials();

    const createPayment = useCreatePayment({
        onSuccess: () => {
            toast.success(t("form.success"));
            exitCreateMode();
        },
        onError: (error) => {
            setFormError(
                getAxiosErrorMessage(error, t("form.submitErrorFallback"))
            );
        },
    });

    function resetForm() {
        setCreateStep(1);
        setInvoiceIdStr("");
        setContractIdStr("");
        setAmountStr("");
        setCurrencyStr("USD");
        setChannelIdStr("");
        setMethodIdStr("");
        setExchangeRateStr("1");
        setCollectorStr("");
        setDrawerStr("");
        setFormError("");
    }

    function exitCreateMode() {
        setMode("list");
        resetForm();
    }

    const meta = data?.meta;
    const totalItems =
        meta?.total !== undefined ? meta.total : (data?.items?.length ?? 0);
    const totalPages = Math.max(
        1,
        meta?.lastPage ??
            (meta?.total !== undefined
                ? Math.ceil(meta.total / PER_PAGE)
                : 1)
    );

    const items = data?.items ?? [];

    const handlePrevPage = () => {
        setPage((p) => Math.max(1, p - 1));
    };

    const handleNextPage = () => {
        setPage((p) => Math.min(totalPages, p + 1));
    };

    const validateStep1 = (): boolean => {
        if (!selectedInvoice || resolvedClientId === undefined) {
            setFormError(t("validation.invoiceRequired"));
            return false;
        }
        if (!contractIdStr.trim()) {
            setFormError(t("validation.contractRequired"));
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        setFormError("");

        if (!validateStep1()) {
            setCreateStep(1);
            return;
        }

        const amount = Number(amountStr.replace(",", "."));
        if (!Number.isFinite(amount) || amount <= 0) {
            setFormError(t("validation.amountInvalid"));
            return;
        }

        const currency = currencyStr.trim();
        if (!currency) {
            setFormError(t("validation.currencyRequired"));
            return;
        }

        const channelId = Number(channelIdStr);
        const methodId = Number(methodIdStr);
        const contractId = Number(contractIdStr);
        const exchangeRate = Number(exchangeRateStr.replace(",", "."));

        if (!channelIdStr.trim() || Number.isNaN(channelId) || channelId <= 0) {
            setFormError(t("validation.channelRequired"));
            return;
        }

        if (!methodIdStr.trim() || Number.isNaN(methodId) || methodId <= 0) {
            setFormError(t("validation.methodRequired"));
            return;
        }

        if (Number.isNaN(contractId) || contractId <= 0) {
            setFormError(t("validation.contractRequired"));
            return;
        }

        if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
            setFormError(t("validation.exchangeRateInvalid"));
            return;
        }

        if (!selectedInvoice || resolvedClientId === undefined) return;

        createPayment.mutate({
            invoice_id: selectedInvoice.id,
            client_id: resolvedClientId,
            amount,
            currency,
            channel_id: channelId,
            cash_info: {
                collector: collectorStr.trim(),
                drawer: drawerStr.trim(),
            },
            contract_id: contractId,
            method_id: methodId,
            exchange_rate: exchangeRate,
        });
    };

    const clientDisplay =
        selectedInvoice?.client?.legal_name ||
        selectedInvoice?.client?.client_name ||
        (resolvedClientId !== undefined ? `#${resolvedClientId}` : "—");

    const contracts = contractsData?.items ?? [];

    const invoiceOptions = (invoicesData?.items ?? []).map((inv) => ({
        value: String(inv.id),
        label:
            (inv as { invoice_ref?: string }).invoice_ref ??
            inv.invoice_number ??
            `#${inv.id}`,
    }));

    const contractOptions = contracts.map((c) => ({
        value: String(c.id),
        label: c.reference || c.title || `#${c.id}`,
    }));

    const channelPlaceHolder =
        channelsPending
            ? t("form.loadingChannels")
            : channelRefs.length === 0
              ? t("form.noChannels")
              : t("form.channelPlaceholder");

    const methodPlaceHolder =
        methodsPending
            ? t("form.loadingMethods")
            : methodRefs.length === 0
              ? t("form.noMethods")
              : t("form.methodPlaceholder");

    const channelOptions = channelRefs.map((r) => ({
        value: String(r.id),
        label: r.title || r.code,
    }));

    const methodOptions = methodRefs.map((r) => ({
        value: String(r.id),
        label: r.title || r.code,
    }));

    const isProcessing = createPayment.isPending;

    if (mode === "create") {
        return (
            <main className="w-full text-slate-700">
                <div className="mb-3 flex flex-wrap items-center gap-x-2 text-[13px] font-medium text-slate-400">
                    <button
                        type="button"
                        onClick={() => exitCreateMode()}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 rounded hover:text-slate-600 disabled:opacity-50"
                    >
                        <ChevronLeft className="size-4" />
                        {t("backToList")}
                    </button>
                    <span aria-hidden>/</span>
                    <span className="font-semibold text-slate-600">
                        {t("createTitle")}
                    </span>
                </div>

                <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                    {t("createTitle")}
                </h1>

                <PaymentStepper currentStep={createStep} />

                {createStep === 1 ? (
                    <div className="mt-4 bg-white p-8">
                        <div className="mb-8">
                            <p className="text-[17px] font-semibold text-slate-700">
                                {t("step1.title")}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-400">
                                {t("step1.subtitle")}
                            </p>
                        </div>

                        <FieldError message={formError} />

                        <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-6 lg:grid-cols-2">
                            <div>
                                <FieldLabel>{t("form.invoice")}</FieldLabel>
                                <SelectField
                                    placeholder={t("form.invoicePlaceholder")}
                                    value={invoiceIdStr}
                                    options={invoiceOptions}
                                    onChange={(v) => {
                                        setInvoiceIdStr(v);
                                        setContractIdStr("");
                                        setFormError("");
                                    }}
                                />
                            </div>

                            <div>
                                <FieldLabel>{t("form.client")}</FieldLabel>
                                <InputField
                                    readOnly
                                    value={clientDisplay}
                                    placeholder="—"
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <FieldLabel>{t("form.contract")}</FieldLabel>
                                <SelectField
                                    placeholder={
                                        !resolvedClientId ||
                                        resolvedClientId <= 0
                                            ? t("form.contractNeedsInvoice")
                                            : contracts.length === 0
                                              ? t("form.noContracts")
                                              : t("form.contractPlaceholder")
                                    }
                                    value={contractIdStr}
                                    options={contractOptions}
                                    disabled={
                                        !resolvedClientId ||
                                        resolvedClientId <= 0 ||
                                        contracts.length === 0
                                    }
                                    onChange={(v) => {
                                        setContractIdStr(v);
                                        setFormError("");
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex flex-wrap justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => exitCreateMode()}
                                disabled={isProcessing}
                                className="h-12 w-52 rounded bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {t("form.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormError("");
                                    if (!validateStep1()) return;
                                    setCreateStep(2);
                                }}
                                disabled={isProcessing}
                                className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {t("form.next")}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 bg-white p-8">
                        <div className="mb-8">
                            <p className="text-[17px] font-semibold text-slate-700">
                                {t("step2.title")}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-400">
                                {t("step2.subtitle")}
                            </p>
                        </div>

                        <FieldError message={formError} />

                        <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-6 lg:grid-cols-2">
                            <div>
                                <FieldLabel>{t("form.amount")}</FieldLabel>
                                <InputField
                                    type="text"
                                    placeholder={t("form.amountPlaceholder")}
                                    value={amountStr}
                                    onChange={(v) => setAmountStr(v)}
                                />
                            </div>
                            <div>
                                <FieldLabel>{t("form.currency")}</FieldLabel>
                                <InputField
                                    value={currencyStr}
                                    onChange={(v) =>
                                        setCurrencyStr(v.toUpperCase())
                                    }
                                />
                            </div>

                            <div>
                                <FieldLabel>{t("form.channel")}</FieldLabel>
                                <SelectField
                                    placeholder={channelPlaceHolder}
                                    value={channelIdStr}
                                    options={channelOptions}
                                    disabled={
                                        channelsPending ||
                                        channelRefs.length === 0
                                    }
                                    onChange={(v) => {
                                        setChannelIdStr(v);
                                        setFormError("");
                                    }}
                                />
                            </div>
                            <div>
                                <FieldLabel>{t("form.method")}</FieldLabel>
                                <SelectField
                                    placeholder={methodPlaceHolder}
                                    value={methodIdStr}
                                    options={methodOptions}
                                    disabled={
                                        methodsPending ||
                                        methodRefs.length === 0
                                    }
                                    onChange={(v) => {
                                        setMethodIdStr(v);
                                        setFormError("");
                                    }}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <FieldLabel>{t("form.exchangeRate")}</FieldLabel>
                                <InputField
                                    value={exchangeRateStr}
                                    onChange={(v) => setExchangeRateStr(v)}
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex flex-wrap justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormError("");
                                    setCreateStep(1);
                                }}
                                disabled={isProcessing}
                                className="h-12 rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {t("form.back")}
                            </button>
                            <button
                                type="button"
                                onClick={() => exitCreateMode()}
                                disabled={isProcessing}
                                className="h-12 w-52 rounded bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {t("form.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {isProcessing ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        {t("form.submitting")}
                                    </span>
                                ) : (
                                    t("form.submit")
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        );
    }

    return (
        <main className="mx-auto w-full min-w-full py-4 text-foreground">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home">
                    <House className="size-4" />
                </Link>

                <ChevronRight className="size-4 shrink-0" />

                <Link href="/home/factures" className="hover:text-slate-700">
                    {t("breadcrumb.invoices")}
                </Link>

                <ChevronRight className="size-4 shrink-0" />

                <span className="text-slate-800">
                    {t("breadcrumb.payments")}
                </span>
            </span>

            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 w-fit"
                        asChild
                    >
                        <Link href="/home/factures" className="gap-1">
                            <ChevronLeft className="size-4" />
                            {t("backToInvoices")}
                        </Link>
                    </Button>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                        {t("title")}
                    </h1>
                </div>

                <Button
                    type="button"
                    size="lg"
                    className="h-12 cursor-pointer rounded bg-[#0879bd] px-5 text-white hover:bg-[#076ca8]"
                    onClick={() => {
                        resetForm();
                        setMode("create");
                    }}
                >
                    <Plus className="mr-2 size-4" />
                    {t("recordPayment")}
                </Button>
            </div>

            <div className="overflow-hidden border border-slate-200/80 bg-white">
                <Table>
                    <TableHeader className="bg-[#F4F4F4BB]">
                        <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.paymentReference")}
                            </TableHead>
                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.invoiceName")}
                            </TableHead>
                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.amountWithCurrency")}
                            </TableHead>
                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.date")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-40 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                        <Loader2 className="size-4 animate-spin" />
                                        {t("loading")}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-40 text-center text-sm text-red-600"
                                >
                                    {t("loadError")}
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-32 text-center text-sm text-slate-500"
                                >
                                    {t("empty")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((row, index) => (
                                <TableRow
                                    key={`${paymentRowLabel(row, index)}-${index}`}
                                    className="border-slate-200 hover:bg-slate-50/80"
                                >
                                    <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                                        {row.reference ?? "—"}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-slate-800">
                                        {paymentInvoiceDisplayName(
                                            row,
                                            invoiceLabelById
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                                        {formatAmount(row.amount, row.currency)}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-slate-600">
                                        {(() => {
                                            const raw =
                                                paymentDisplayDateIso(row);
                                            return raw
                                                ? formatPaymentTableDate(raw)
                                                : "—";
                                        })()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <span>
                    {t("pagination.summary", {
                        page,
                        totalPages,
                        total: totalItems,
                    })}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={page <= 1 || isFetching}
                    >
                        <ChevronLeft className="size-4" />
                        {t("pagination.prev")}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={page >= totalPages || isFetching}
                    >
                        {t("pagination.next")}
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </main>
    );
}
