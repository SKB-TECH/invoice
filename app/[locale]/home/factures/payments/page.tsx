"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    ChevronLeft,
    ChevronRight,
    House,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PaymentsCreateForm } from "@/components/payments/payments-create-form";
import { PaymentsListHeader } from "@/components/payments/payments-list-header";
import { PaymentsTable } from "@/components/payments/payments-table";
import { usePaymentsPageState } from "@/core/hooks/payment/usePaymentsPageState";

export default function PaymentsPage() {
    const t = useTranslations("paymentsPage");
    const {
        mode,
        setMode,
        page,
        totalPages,
        totalItems,
        items,
        isLoading,
        isError,
        isFetching,
        invoiceLabelById,
        handlePrevPage,
        handleNextPage,
        resetForm,
        exitCreateMode,
        isProcessing,
        formError,
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
        handleSubmit,
    } = usePaymentsPageState(t);

    if (mode === "create") {
        return (
            <PaymentsCreateForm
                formError={formError}
                isProcessing={isProcessing}
                invoiceIdStr={invoiceIdStr}
                selectedInvoiceDisplayLabel={selectedInvoiceDisplayLabel}
                invoiceSearchOptions={invoiceSearchOptions}
                invoicesPending={invoicesPending}
                invoicesError={invoicesError}
                onSelectInvoice={onSelectInvoice}
                clientDisplay={clientDisplay}
                resolvedContractIdStr={resolvedContractIdStr}
                resolvedClientId={resolvedClientId}
                contracts={contracts}
                invoiceContractId={invoiceContractId}
                contractOptions={contractOptions}
                onContractChange={onContractChange}
                amountStr={amountStr}
                currencyStr={currencyStr}
                selectedInvoiceTotal={selectedInvoiceTotal}
                selectedInvoiceCurrency={selectedInvoiceCurrency}
                amountExceedsInvoice={amountExceedsInvoice}
                amountExceedsMessage={amountExceedsMessage}
                onAmountChange={onAmountChange}
                exchangeRateStr={exchangeRateStr}
                onExchangeRateChange={onExchangeRateChange}
                channelPlaceHolder={channelPlaceHolder}
                channelIdStr={channelIdStr}
                channelOptions={channelOptions}
                channelsPending={channelsPending}
                channelRefsLength={channelRefsLength}
                onChannelChange={onChannelChange}
                methodPlaceHolder={methodPlaceHolder}
                methodIdStr={methodIdStr}
                methodOptions={methodOptions}
                methodsPending={methodsPending}
                methodRefsLength={methodRefsLength}
                onMethodChange={onMethodChange}
                onCancel={exitCreateMode}
                onSubmit={handleSubmit}
            />
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

            <PaymentsListHeader
                onCreate={() => {
                    resetForm();
                    setMode("create");
                }}
            />

            <PaymentsTable
                items={items}
                isLoading={isLoading}
                isError={isError}
                invoiceLabelById={invoiceLabelById}
            />

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
