"use client";
import { ReactNode, useMemo } from "react";
import { ChevronsLeft, ChevronsRight, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type RTColumn<T> = {
    key: string;
    header: string;
    render: (row: T) => ReactNode;
    mobileLabel?: string;
    mobileSpan?: 1 | 2;
    mobileHidden?: boolean;
    className?: string;
    cellClassName?: string;
};

export type StatusOption = {
    value: string;
    label: string;
    badgeClassName?: string;
};

export type ServerPagination = {
    page: number;
    totalPages: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
};

export type TableSelection<T> = {
    enabled?: boolean;
    getRowId: (row: T, index: number) => string | number;
    selectedIds: Array<string | number>;
    onChangeSelectedIds: (ids: Array<string | number>) => void;
};

type FiltersValue = {
    query: string;
    status: string; // "all" ou un status
};

type Props<T> = {
    title: string;
    description?: string;
    data: T[];
    columns: RTColumn<T>[];
    filters?: {
        enabledQuery?: boolean;
        enabledStatus?: boolean;
        statusLabel?: string;
        statusOptions?: StatusOption[];
        value: FiltersValue;
        onChange: (next: FiltersValue) => void;
    };
    rightFilters?: ReactNode;
    actions?: {
        header?: string;
        render: (row: T) => ReactNode;
        mobileRender?: (row: T) => ReactNode;
    };
    loading?: boolean;
    error?: string;
    pagination?: ServerPagination;
    selection?: TableSelection<T>;
    getRowId?: (r: any) => any;
};

function TableSkeleton({ cols, rows = 8 }: { cols: number; rows?: number }) {
    return (
        <div className="w-full animate-pulse">
            {Array.from({ length: rows }).map((_, r) => (
                <div
                    key={r}
                    className={cn(
                        "grid gap-3 py-3 px-4 border-b",
                        r % 2 === 0 ? "bg-white" : "bg-[#f6f6f6]",
                    )}
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: cols }).map((__, c) => (
                        <div
                            key={c}
                            className="h-4 rounded bg-gray-200/80"
                            style={{ width: `${60 + (c % 3) * 10}%` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default function ResponsiveTable<T>({
                                               title,
                                               description,
                                               data,
                                               columns,
                                               filters,
                                               rightFilters,
                                               actions,
                                               loading = false,
                                               error,
                                               pagination,
                                               selection,
                                               getRowId,
                                           }: Props<T>) {
    const selectionEnabled = !!selection?.enabled;
    const rowIdsOnPage = useMemo(() => {
        if (!selectionEnabled || !selection) return [];
        return data.map((row, idx) => selection.getRowId(row, idx));
    }, [data, selectionEnabled, selection]);

    const allOnPageSelected =
        selectionEnabled &&
        rowIdsOnPage.length > 0 &&
        rowIdsOnPage.every((id) => selection!.selectedIds.includes(id));

    const toggleSelectAllOnPage = () => {
        if (!selectionEnabled || !selection) return;
        if (allOnPageSelected) {
            selection.onChangeSelectedIds(
                selection.selectedIds.filter((id) => !rowIdsOnPage.includes(id)),
            );
        } else {
            selection.onChangeSelectedIds(
                Array.from(new Set([...selection.selectedIds, ...rowIdsOnPage])),
            );
        }
    };

    const toggleRow = (id: string | number) => {
        if (!selectionEnabled || !selection) return;
        if (selection.selectedIds.includes(id)) {
            selection.onChangeSelectedIds(
                selection.selectedIds.filter((x) => x !== id),
            );
        } else {
            selection.onChangeSelectedIds([...selection.selectedIds, id]);
        }
    };

    const colsCount =
        columns.length + (actions ? 1 : 0) + (selectionEnabled ? 1 : 0);

    const showEmpty = !loading && !error && data.length === 0;

    return (
        <div className="space-y-6">
            <div className="rounded shadow-none">
                {title ? (
                    <div className="pb-3">
                        <h3 className="text-base text-primary font-semibold">{title}</h3>
                        {description ? (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        ) : null}
                    </div>
                ) : null}

                <div className={"rounded shadow-none"}>
                    {(filters?.enabledQuery ||
                        filters?.enabledStatus ||
                        rightFilters) && (
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded shadow-none">
                            <div className="relative w-full md:max-w-sm">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={filters?.value.query ?? ""}
                                    onChange={(e) =>
                                        filters?.onChange({
                                            ...(filters.value ?? { query: "", status: "all" }),
                                            query: e.target.value,
                                        })
                                    }
                                    placeholder="Recherche"
                                    className="pl-9 shadow-none rounded"
                                    disabled={!filters?.enabledQuery}
                                />
                            </div>

                            <div className="flex items-center gap-2 justify-end">
                                {filters?.enabledStatus ? (
                                    <Select
                                        value={filters.value.status}
                                        onValueChange={(v) =>
                                            filters.onChange({ ...filters.value, status: v })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-[180px] rounded-sm shadow-none">
                                            <SelectValue
                                                placeholder={filters.statusLabel ?? "Statut"}
                                            />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="all">Tous</SelectItem>
                                            {(filters.statusOptions ?? []).map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                          <span
                              className={cn(
                                  "px-2 py-1 rounded text-xs",
                                  opt.badgeClassName,
                              )}
                          >
                            {opt.label}
                          </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : null}

                                {rightFilters}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error ? (
                        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    <div className="mt-4 bg-white overflow-hidden rounded shadow-sm">
                        <Table>
                            <TableHeader className="bg-[#f3f4f6]">
                                <TableRow>
                                    {selectionEnabled ? (
                                        <TableHead className="w-[44px]">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 accent-primary"
                                                checked={allOnPageSelected}
                                                onChange={toggleSelectAllOnPage}
                                            />
                                        </TableHead>
                                    ) : null}

                                    {columns.map((c) => (
                                        <TableHead
                                            key={c.key}
                                            className={cn(
                                                "text-gray-900 text-xs font-semibold",
                                                c.className,
                                            )}
                                        >
                                            {c.header}
                                        </TableHead>
                                    ))}

                                    {actions ? (
                                        <TableHead className="text-right text-gray-900 text-xs font-semibold">
                                            {actions.header ?? "Action"}
                                        </TableHead>
                                    ) : null}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={colsCount} className="p-0">
                                            <TableSkeleton cols={colsCount} />
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {!loading &&
                                    data.map((row, index) => {
                                        const id =
                                            selectionEnabled && selection
                                                ? selection.getRowId(row, index)
                                                : index;
                                        const isSelected = selectionEnabled
                                            ? selection!.selectedIds.includes(id as any)
                                            : false;

                                        return (
                                            <TableRow
                                                key={String(id)}
                                                className={cn(
                                                    "transition-colors",
                                                    index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]",
                                                    "hover:bg-primary/5",
                                                    isSelected ? "ring-1 ring-primary/30" : "",
                                                )}
                                            >
                                                {selectionEnabled ? (
                                                    <TableCell className="w-[44px]">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 accent-primary"
                                                            checked={isSelected}
                                                            onChange={() => toggleRow(id as any)}
                                                        />
                                                    </TableCell>
                                                ) : null}

                                                {columns.map((c) => (
                                                    <TableCell
                                                        key={c.key}
                                                        className={cn("text-xs", c.cellClassName)}
                                                    >
                                                        {c.render(row)}
                                                    </TableCell>
                                                ))}

                                                {actions ? (
                                                    <TableCell className="text-right">
                                                        {actions.render(row)}
                                                    </TableCell>
                                                ) : null}
                                            </TableRow>
                                        );
                                    })}

                                {showEmpty ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={colsCount}
                                            className="text-center text-sm text-muted-foreground py-10"
                                        >
                                            Aucun résultat.
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </div>
                    {pagination ? (
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                            <p>
                                Page <span className="font-semibold">{pagination.page}</span> /{" "}
                                <span className="font-semibold">{pagination.totalPages}</span>
                                {typeof pagination.totalItems === "number" ? (
                                    <> — Total: {pagination.totalItems}</>
                                ) : null}
                            </p>

                            <div className="flex items-center gap-2">
                                <Button
                                    className="shadow-none"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => pagination.onPageChange(1)}
                                    disabled={pagination.page === 1 || loading}
                                >
                                    <ChevronsLeft size={18} />
                                </Button>

                                <Button
                                    className="shadow-none"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        pagination.onPageChange(Math.max(1, pagination.page - 1))
                                    }
                                    disabled={pagination.page === 1 || loading}
                                >
                                    Avant
                                </Button>

                                <Button
                                    className="shadow-none"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        pagination.onPageChange(
                                            Math.min(pagination.totalPages, pagination.page + 1),
                                        )
                                    }
                                    disabled={
                                        pagination.page === pagination.totalPages || loading
                                    }
                                >
                                    Suivant
                                </Button>

                                <Button
                                    className="shadow-none"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => pagination.onPageChange(pagination.totalPages)}
                                    disabled={
                                        pagination.page === pagination.totalPages || loading
                                    }
                                >
                                    <ChevronsRight size={18} />
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
