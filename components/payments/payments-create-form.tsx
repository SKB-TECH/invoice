"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
    FieldError,
    FieldLabel,
    InputField,
    SelectField,
} from "@/components/invoices/create/Fields";
import { InvoiceSearchSelect } from "@/components/invoices/create/InvoiceSearchSelect";

type Option = {
    value: string;
    label: string;
};

type InvoiceSearchOption = {
    id: number;
    primary: string;
    secondary: string;
};

type Props = {
    formError: string;
    isProcessing: boolean;
    invoiceIdStr: string;
    selectedInvoiceDisplayLabel: string;
    invoiceSearchOptions: InvoiceSearchOption[];
    invoicesPending: boolean;
    invoicesError: boolean;
    onSelectInvoice: (id: number) => void;
    clientDisplay: string;
    resolvedContractIdStr: string;
    resolvedClientId?: number;
    contracts: Array<{ id: number; reference?: string; title?: string }>;
    invoiceContractId?: number;
    contractOptions: Option[];
    onContractChange: (value: string) => void;
    amountStr: string;
    currencyStr: string;
    selectedInvoiceTotal?: number;
    selectedInvoiceCurrency?: string;
    amountExceedsInvoice: boolean;
    amountExceedsMessage: string;
    onAmountChange: (value: string) => void;
    exchangeRateStr: string;
    onExchangeRateChange: (value: string) => void;
    channelPlaceHolder: string;
    channelIdStr: string;
    channelOptions: Option[];
    channelsPending: boolean;
    channelRefsLength: number;
    onChannelChange: (value: string) => void;
    methodPlaceHolder: string;
    methodIdStr: string;
    methodOptions: Option[];
    methodsPending: boolean;
    methodRefsLength: number;
    onMethodChange: (value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
};

export function PaymentsCreateForm(props: Props) {
    const t = useTranslations("paymentsPage");
    const {
        formError,
        isProcessing,
        invoiceIdStr,
        selectedInvoiceDisplayLabel,
        invoiceSearchOptions,
        invoicesPending,
        invoicesError,
        onSelectInvoice,
        clientDisplay,
        resolvedContractIdStr,
        resolvedClientId,
        contracts,
        invoiceContractId,
        contractOptions,
        onContractChange,
        amountStr,
        currencyStr,
        selectedInvoiceTotal,
        selectedInvoiceCurrency,
        amountExceedsInvoice,
        amountExceedsMessage,
        onAmountChange,
        exchangeRateStr,
        onExchangeRateChange,
        channelPlaceHolder,
        channelIdStr,
        channelOptions,
        channelsPending,
        channelRefsLength,
        onChannelChange,
        methodPlaceHolder,
        methodIdStr,
        methodOptions,
        methodsPending,
        methodRefsLength,
        onMethodChange,
        onCancel,
        onSubmit,
    } = props;

    return (
        <main className="w-full text-slate-700">
            <div className="mb-3 flex flex-wrap items-center gap-x-2 text-[13px] font-medium text-slate-400">
                <button
                    type="button"
                    onClick={onCancel}
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

            <div className="mt-4 bg-white p-8">
                <FieldError message={formError} />

                <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-6 lg:grid-cols-2">
                    <div>
                        <FieldLabel>{t("form.invoice")}</FieldLabel>
                        <InvoiceSearchSelect
                            key={
                                invoiceIdStr.trim() === "" ||
                                Number.isNaN(Number(invoiceIdStr))
                                    ? "invoice-none"
                                    : `invoice-${invoiceIdStr}`
                            }
                            options={invoiceSearchOptions}
                            value={selectedInvoiceDisplayLabel}
                            placeholder={
                                invoicesPending
                                    ? t("form.loadingInvoices")
                                    : t("form.invoiceSearchPlaceholder")
                            }
                            emptyLabel={t("form.invoiceSearchEmpty")}
                            disabled={invoicesPending || invoicesError}
                            onSelect={onSelectInvoice}
                        />

                        {invoicesError ? (
                            <p className="mt-2 text-sm font-medium text-red-500">
                                {t("form.invoicesLoadError")}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <FieldLabel>{t("form.client")}</FieldLabel>
                        <InputField readOnly value={clientDisplay} placeholder="—" />
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>{t("form.contract")}</FieldLabel>
                        <SelectField
                            placeholder={
                                !resolvedClientId || resolvedClientId <= 0
                                    ? t("form.contractNeedsInvoice")
                                    : contracts.length === 0
                                      ? t("form.noContracts")
                                      : t("form.contractPlaceholder")
                            }
                            value={resolvedContractIdStr}
                            options={contractOptions}
                            disabled={
                                !resolvedClientId ||
                                resolvedClientId <= 0 ||
                                contracts.length === 0 ||
                                (invoiceContractId !== undefined &&
                                    contracts.length === 1)
                            }
                            onChange={onContractChange}
                        />
                    </div>

                    <div className="min-w-0">
                        <FieldLabel>{t("form.amount")}</FieldLabel>
                        <div className="flex h-[50px] w-full overflow-hidden rounded border border-slate-300 bg-white transition-colors focus-within:border-[#0879bd]">
                            <div className="flex shrink-0 items-stretch border-r border-slate-200 bg-slate-50">
                                <input
                                    type="text"
                                    value={currencyStr}
                                    maxLength={16}
                                    spellCheck={false}
                                    autoCapitalize="characters"
                                    aria-label={t("form.currency")}
                                    className="w-[5rem] bg-transparent px-3 text-center text-[17px] font-semibold uppercase tracking-wide text-slate-700 outline-none placeholder:text-slate-400"
                                    disabled
                                />
                            </div>
                            <input
                                type="text"
                                inputMode="decimal"
                                dir="rtl"
                                placeholder={t("form.amountPlaceholder")}
                                value={amountStr}
                                onChange={(e) => onAmountChange(e.target.value)}
                                className="min-w-0 flex-1 border-0 bg-transparent px-4 text-[17px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </div>
                        {selectedInvoiceTotal !== undefined ? (
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                {t("form.invoiceTotalHint", {
                                    amount: `${selectedInvoiceCurrency ?? currencyStr} ${new Intl.NumberFormat(
                                        "fr-FR",
                                        { maximumFractionDigits: 2 },
                                    ).format(selectedInvoiceTotal)}`,
                                })}
                            </p>
                        ) : null}
                        {amountExceedsInvoice ? (
                            <p className="mt-1 text-sm font-medium text-amber-600">
                                {amountExceedsMessage}
                            </p>
                        ) : null}
                    </div>

                    <div className="min-w-0">
                        <FieldLabel>{t("form.exchangeRate")}</FieldLabel>
                        <InputField
                            value={exchangeRateStr}
                            onChange={onExchangeRateChange}
                        />
                    </div>

                    <div className="min-w-0">
                        <FieldLabel>{t("form.channel")}</FieldLabel>
                        <SelectField
                            placeholder={channelPlaceHolder}
                            value={channelIdStr}
                            options={channelOptions}
                            disabled={channelsPending || channelRefsLength === 0}
                            onChange={onChannelChange}
                        />
                    </div>

                    <div className="min-w-0">
                        <FieldLabel>{t("form.method")}</FieldLabel>
                        <SelectField
                            placeholder={methodPlaceHolder}
                            value={methodIdStr}
                            options={methodOptions}
                            disabled={methodsPending || methodRefsLength === 0}
                            onChange={onMethodChange}
                        />
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="h-12 w-52 rounded bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {t("form.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
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
        </main>
    );
}
