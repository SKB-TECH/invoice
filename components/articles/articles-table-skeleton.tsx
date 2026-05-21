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
    "title",
    "referential",
    "taxGroup",
    "priceHt",
    "priceTtc",
    "status",
    "period",
] as const;

const TABLE_HEAD_CLASS =
    "h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700";

type Props = {
    rowCount?: number;
    className?: string;
};

function cellWidths(row: number, col: number): string {
    const offsets = (row * 2 + col * 5 + (row % 3) * 7) % 24;
    switch (col) {
        case 0:
            return cn("h-3.5", offsets % 2 ? "w-[4.5rem]" : "w-20");
        case 1:
            return cn("h-3.5", offsets % 3 === 0 ? "w-[88%]" : "w-[72%]");
        case 2:
            return cn("h-3.5", offsets % 2 ? "w-[70%]" : "w-[80%]");
        case 3:
            return cn("h-3.5", offsets % 3 === 0 ? "w-16" : "w-[9rem]");
        case 4:
            return cn("h-3.5", offsets % 2 ? "w-24" : "w-28");
        case 5:
            return cn("h-3.5", offsets % 2 ? "w-24" : "w-28");
        case 6:
            return "h-6 w-20 rounded-sm";
        case 7:
            return cn("h-3.5", offsets % 2 ? "w-[4.25rem]" : "w-24");
        default:
            return "h-3.5 w-16";
    }
}

export function ArticlesTableSkeleton({
    rowCount = 8,
    className,
}: Props) {
    const t = useTranslations("articles.list");

    return (
        <div
            role="status"
            aria-busy="true"
            aria-label={t("loading")}
            className={cn(
                "overflow-hidden border border-slate-200/80 bg-white",
                className,
            )}
        >
            <Table>
                <TableHeader className="bg-[#F4F4F4BB]">
                    <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                        {COLUMN_KEYS.map((key) => (
                            <TableHead key={key} className={TABLE_HEAD_CLASS}>
                                {t(`columns.${key}`)}
                            </TableHead>
                        ))}
                        <TableHead
                            className={cn(
                                TABLE_HEAD_CLASS,
                                "text-right",
                            )}
                        >
                            {t("action")}
                        </TableHead>
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
                                            cellWidths(row, col),
                                        )}
                                    />
                                </TableCell>
                            ))}
                            <TableCell className="px-4 py-3 text-right">
                                <div className="ml-auto h-8 w-8 rounded bg-slate-200/90" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
