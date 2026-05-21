"use client";

import { useTranslations } from "next-intl";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const COLUMN_KEYS = [
    "code",
    "name",
    "sector",
    "unitPrice",
    "currency",
    "taxRate",
    "taxGroup",
    "billingType",
] as const;

const TABLE_HEAD_CLASS =
    "h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700";

type Props = {
    rowCount?: number;
    className?: string;
};

function barClass(row: number, col: number): string {
    const n = (row * 7 + col * 11) % 17;
    switch (col) {
        case 0:
            return cn("h-3.5", n % 2 ? "w-24" : "w-28");
        case 1:
            return cn("h-3.5", n % 3 === 0 ? "w-[92%]" : "w-[75%]");
        case 2:
            return cn("h-3.5", n % 2 ? "w-[70%]" : "w-28");
        case 3:
            return cn("h-3.5", "w-20");
        case 4:
            return cn("h-3.5", "w-10");
        case 5:
            return cn("h-3.5", "w-12");
        case 6:
            return cn("h-3.5", "w-8");
        case 7:
            return cn("h-3.5", n % 2 ? "w-16" : "w-24");
        default:
            return "h-3.5 w-16";
    }
}

export function BillableServicesTableSkeleton({
    rowCount = 10,
    className,
}: Props) {
    const t = useTranslations("configuration.services");

    return (
        <div
            role="status"
            aria-busy="true"
            aria-label={t("loading")}
            className={cn(className)}
        >
            <Table>
                <TableHeader className="bg-[#F4F4F4BB]">
                    <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                        {COLUMN_KEYS.map((key) => (
                            <TableHead key={key} className={TABLE_HEAD_CLASS}>
                                {t(`columns.${key}`)}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody className="animate-pulse">
                    {Array.from({ length: rowCount }).map((_, row) => (
                        <TableRow
                            key={row}
                            className="border-slate-200 hover:bg-transparent"
                        >
                            {COLUMN_KEYS.map((key, col) => (
                                <TableCell key={key} className="px-4 py-3">
                                    <div
                                        className={cn(
                                            "rounded bg-slate-200/90",
                                            barClass(row, col),
                                        )}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
