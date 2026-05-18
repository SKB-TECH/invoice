"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

const GRID_ROW =
    "grid grid-cols-[minmax(0,140px)_1fr_minmax(0,120px)_minmax(0,100px)_minmax(0,90px)_minmax(0,90px)_minmax(0,90px)_minmax(0,100px)] gap-px";

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
            className={cn("min-w-[880px]", className)}
        >
            <div
                className={cn(
                    GRID_ROW,
                    "bg-slate-200 px-5 py-3 text-[13px] font-semibold text-slate-600",
                )}
            >
                {COLUMN_KEYS.map((key) => (
                    <span key={key}>{t(`columns.${key}`)}</span>
                ))}
            </div>

            <div className="animate-pulse bg-white">
                {Array.from({ length: rowCount }).map((_, row) => (
                    <div
                        key={row}
                        className={cn(
                            GRID_ROW,
                            "border-t border-slate-200 bg-white px-5 py-3",
                        )}
                    >
                        {COLUMN_KEYS.map((key, col) => (
                            <div
                                key={key}
                                className="flex min-h-[1.25rem] items-center"
                            >
                                <div
                                    className={cn(
                                        "rounded bg-slate-200/90",
                                        barClass(row, col),
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
