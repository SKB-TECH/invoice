import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { getAxiosErrorMessage } from "@/core/utils/apiResponse";
import {
    formatAmount,
    invoiceListClientDisplayName,
    pickTruthyString,
} from "@/components/payments/payments-utils";

const PER_PAGE = 20;

type PageMode = "list" | "create";
type TranslateFn = (
    key: string,
    values?: Record<string, string | number | Date>,
) => string;

export function usePaymentsPageState(t: TranslateFn) {
    const [mode, setMode] = useState<PageMode>("list");
    const [page, setPage] = useState(1);

    const [invoiceIdStr, setInvoiceIdStr] = useState("");
    const [contractIdStr, setContractIdStr] = useState("");
    const [amountStr, setAmountStr] = useState("");
    const [currencyStr, setCurrencyStr] = useState("USD");
    const [channelIdStr, setChannelIdStr] = useState("");
    const [methodIdStr, setMethodIdStr] = useState("");
    const [exchangeRateStr, setExchangeRateStr] = useState("");
    const [collectorStr, setCollectorStr] = useState("");
    const [drawerStr, setDrawerStr] = useState("");
    const [formError, setFormError] = useState("");

    const { data, isLoading, isError, isFetching } = usePayments({
        page,
        perPage: PER_PAGE,
    });

    const {
        data: invoicesData,
        isPending: invoicesPending,
        isError: invoicesError,
    } = useInvoices({
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
        return (invoicesData?.items ?? []).find((inv) => inv.id === id) ?? null;
    }, [invoiceIdStr, invoicesData?.items]);

    const selectedInvoiceDisplayLabel = useMemo(() => {
        if (!selectedInvoice) return "";
        const ext = selectedInvoice as { invoice_ref?: string };
        return (
            pickTruthyString(ext.invoice_ref, selectedInvoice.invoice_number) ??
            `#${selectedInvoice.id}`
        );
    }, [selectedInvoice]);

    const resolvedClientId = selectedInvoice?.client_id;

    const invoiceContractId = useMemo(() => {
        if (!selectedInvoice) return undefined;
        const cid = (selectedInvoice as { contract_id?: number }).contract_id;
        return typeof cid === "number" && cid > 0 ? cid : undefined;
    }, [selectedInvoice]);

    const resolvedContractIdStr = useMemo(() => {
        if (invoiceContractId !== undefined) return String(invoiceContractId);
        return contractIdStr;
    }, [contractIdStr, invoiceContractId]);

    const { data: contractsData } = useInvoiceContracts({
        client_id:
            typeof resolvedClientId === "number" && resolvedClientId > 0
                ? resolvedClientId
                : undefined,
        contract_id: invoiceContractId,
        page: 1,
        perPage: 100,
    });

    const { data: channelRefs = [], isPending: channelsPending } =
        usePaymentChannelReferentials();
    const { data: methodRefs = [], isPending: methodsPending } =
        usePaymentMethodReferentials();

    const resetForm = useCallback(() => {
        setInvoiceIdStr("");
        setContractIdStr("");
        setAmountStr("");
        setCurrencyStr("USD");
        setChannelIdStr("");
        setMethodIdStr("");
        setExchangeRateStr("");
        setCollectorStr("");
        setDrawerStr("");
        setFormError("");
    }, []);

    const exitCreateMode = useCallback(() => {
        setMode("list");
        resetForm();
    }, [resetForm]);

    const createPayment = useCreatePayment({
        onSuccess: () => {
            toast.success(t("form.success"));
            exitCreateMode();
        },
        onError: (error) => {
            setFormError(
                getAxiosErrorMessage(error, t("form.submitErrorFallback")),
            );
        },
    });

    const meta = data?.meta;
    const totalItems =
        meta?.total !== undefined ? meta.total : (data?.items?.length ?? 0);
    const totalPages = Math.max(
        1,
        meta?.lastPage ??
            (meta?.total !== undefined ? Math.ceil(meta.total / PER_PAGE) : 1),
    );
    const items = data?.items ?? [];

    const handlePrevPage = useCallback(() => {
        setPage((p) => Math.max(1, p - 1));
    }, []);

    const handleNextPage = useCallback(() => {
        setPage((p) => Math.min(totalPages, p + 1));
    }, [totalPages]);

    const selectedInvoiceTotal = useMemo(() => {
        if (!selectedInvoice) return undefined;
        const total = selectedInvoice.total;
        return typeof total === "number" && !Number.isNaN(total)
            ? total
            : undefined;
    }, [selectedInvoice]);

    const selectedInvoiceCurrency = useMemo(() => {
        if (!selectedInvoice?.currency) return undefined;
        const cur = selectedInvoice.currency.trim().toUpperCase();
        return cur || undefined;
    }, [selectedInvoice]);

    const parsedAmount = useMemo(() => {
        const amount = Number(amountStr.replace(",", "."));
        return Number.isFinite(amount) ? amount : undefined;
    }, [amountStr]);

    const amountExceedsInvoice = useMemo(
        () =>
            selectedInvoiceTotal !== undefined &&
            parsedAmount !== undefined &&
            parsedAmount > selectedInvoiceTotal,
        [parsedAmount, selectedInvoiceTotal],
    );

    const amountExceedsMessage = useMemo(() => {
        if (!amountExceedsInvoice || selectedInvoiceTotal === undefined) return "";
        return t("validation.amountExceedsInvoice", {
            max: formatAmount(
                selectedInvoiceTotal,
                selectedInvoiceCurrency ?? currencyStr,
            ),
        });
    }, [
        amountExceedsInvoice,
        selectedInvoiceCurrency,
        selectedInvoiceTotal,
        currencyStr,
        t,
    ]);

    const validateForm = useCallback((): boolean => {
        if (!selectedInvoice || resolvedClientId === undefined) {
            setFormError(t("validation.invoiceRequired"));
            return false;
        }
        if (!resolvedContractIdStr.trim()) {
            setFormError(t("validation.contractRequired"));
            return false;
        }
        return true;
    }, [resolvedClientId, resolvedContractIdStr, selectedInvoice, t]);

    const handleSubmit = useCallback(() => {
        setFormError("");
        if (!validateForm()) return;

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

        if (selectedInvoiceTotal !== undefined && amount > selectedInvoiceTotal) {
            setFormError(
                t("validation.amountExceedsInvoice", {
                    max: formatAmount(
                        selectedInvoiceTotal,
                        selectedInvoiceCurrency ?? currency,
                    ),
                }),
            );
            return;
        }

        const channelId = Number(channelIdStr);
        const methodId = Number(methodIdStr);
        const contractId = Number(resolvedContractIdStr);
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
    }, [
        amountStr,
        channelIdStr,
        collectorStr,
        createPayment,
        currencyStr,
        drawerStr,
        exchangeRateStr,
        methodIdStr,
        resolvedClientId,
        resolvedContractIdStr,
        selectedInvoice,
        selectedInvoiceCurrency,
        selectedInvoiceTotal,
        t,
        validateForm,
    ]);

    const clientDisplay =
        invoiceListClientDisplayName(selectedInvoice) ??
        (resolvedClientId !== undefined ? `#${resolvedClientId}` : "—");

    const contracts = useMemo(() => {
        const items = contractsData?.items ?? [];
        if (items.length > 0) return items;
        if (!selectedInvoice || invoiceContractId === undefined) return [];

        const inv = selectedInvoice as {
            contract?: { id?: number; title?: string; reference?: string };
        };
        const c = inv.contract;
        if (c && typeof c.id === "number" && c.id === invoiceContractId) {
            return [{ id: c.id, title: c.title ?? "", reference: c.reference ?? "" }];
        }
        return [];
    }, [contractsData?.items, invoiceContractId, selectedInvoice]);

    const invoiceSearchOptions = useMemo(
        () =>
            (invoicesData?.items ?? []).map((inv) => {
                const ext = inv as { invoice_ref?: string };
                const primary =
                    pickTruthyString(ext.invoice_ref, inv.invoice_number) ??
                    `#${inv.id}`;
                const clientName = invoiceListClientDisplayName(inv);
                const secondaryParts: string[] = [];
                if (clientName) secondaryParts.push(clientName);
                if (typeof inv.total === "number" && !Number.isNaN(inv.total)) {
                    secondaryParts.push(formatAmount(inv.total, inv.currency));
                }
                return { id: inv.id, primary, secondary: secondaryParts.join(" · ") };
            }),
        [invoicesData?.items],
    );

    const contractOptions = contracts.map((c) => ({
        value: String(c.id),
        label: c.reference || c.title || `#${c.id}`,
    }));
    const channelOptions = channelRefs.map((r) => ({
        value: String(r.id),
        label: r.title || r.code,
    }));
    const methodOptions = methodRefs.map((r) => ({
        value: String(r.id),
        label: r.title || r.code,
    }));

    const channelPlaceHolder = channelsPending
        ? t("form.loadingChannels")
        : channelRefs.length === 0
          ? t("form.noChannels")
          : t("form.channelPlaceholder");
    const methodPlaceHolder = methodsPending
        ? t("form.loadingMethods")
        : methodRefs.length === 0
          ? t("form.noMethods")
          : t("form.methodPlaceholder");

    return {
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
        isProcessing: createPayment.isPending,
        formError,
        invoiceIdStr,
        selectedInvoiceDisplayLabel,
        invoiceSearchOptions,
        invoicesPending,
        invoicesError,
        onSelectInvoice: (id: number) => {
            setInvoiceIdStr(String(id));
            setFormError("");
            const inv = (invoicesData?.items ?? []).find(
                (invItem) => invItem.id === id,
            );
            if (inv?.currency?.trim()) {
                setCurrencyStr(inv.currency.trim().toUpperCase());
            }
            const cid = inv ? (inv as { contract_id?: number }).contract_id : undefined;
            if (!(typeof cid === "number" && cid > 0)) {
                setContractIdStr("");
            }
        },
        clientDisplay,
        resolvedContractIdStr,
        resolvedClientId,
        contracts,
        invoiceContractId,
        contractOptions,
        onContractChange: (v: string) => {
            setContractIdStr(v);
            setFormError("");
        },
        amountStr,
        currencyStr,
        selectedInvoiceTotal,
        selectedInvoiceCurrency,
        amountExceedsInvoice,
        amountExceedsMessage,
        onAmountChange: setAmountStr,
        exchangeRateStr,
        onExchangeRateChange: setExchangeRateStr,
        channelPlaceHolder,
        channelIdStr,
        channelOptions,
        channelsPending,
        channelRefsLength: channelRefs.length,
        onChannelChange: (v: string) => {
            setChannelIdStr(v);
            setFormError("");
        },
        methodPlaceHolder,
        methodIdStr,
        methodOptions,
        methodsPending,
        methodRefsLength: methodRefs.length,
        onMethodChange: (v: string) => {
            setMethodIdStr(v);
            setFormError("");
        },
        handleSubmit,
    };
}
