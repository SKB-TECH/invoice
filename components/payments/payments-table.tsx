"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { PaymentRecord } from "@/core/schemas/payment.schema";
import {
    formatAmount,
    formatPaymentTableDate,
    paymentDisplayDateIso,
    paymentInvoiceDisplayName,
    paymentRowLabel,
} from "@/components/payments/payments-utils";

type Props = {
    items: PaymentRecord[];
    isLoading: boolean;
    isError: boolean;
    invoiceLabelById: Map<number, string>;
};

export function PaymentsTable({
    items,
    isLoading,
    isError,
    invoiceLabelById,
}: Props) {
    const t = useTranslations("paymentsPage");

    return (
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
                            <TableCell colSpan={4} className="h-40 text-center">
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
                                        invoiceLabelById,
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                                    {formatAmount(row.amount, row.currency)}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-slate-600">
                                    {(() => {
                                        const raw = paymentDisplayDateIso(row);
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
    );
}
