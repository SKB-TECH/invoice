"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { FieldError } from "./Fields";

export type InvoiceSearchOption = {
    id: number;
    primary: string;
    secondary: string;
};

export function InvoiceSearchSelect({
    options,
    value,
    error,
    placeholder,
    emptyLabel,
    disabled,
    onSelect,
}: {
    options: InvoiceSearchOption[];
    value: string;
    error?: string;
    placeholder: string;
    emptyLabel: string;
    disabled?: boolean;
    onSelect: (id: number) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return options;

        return options.filter((opt) => {
            return (
                opt.primary.toLowerCase().includes(q) ||
                opt.secondary.toLowerCase().includes(q)
            );
        });
    }, [options, search]);

    const handlePick = (opt: InvoiceSearchOption) => {
        setSearch(opt.primary);
        setOpen(false);
        onSelect(opt.id);
    };

    return (
        <>
            <div className="relative">
                <div className="relative">
                    <input
                        value={search}
                        disabled={disabled}
                        onFocus={() => {
                            if (!disabled) setOpen(true);
                        }}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setOpen(true);
                        }}
                        placeholder={placeholder}
                        className={[
                            "h-[50px] w-full rounded border bg-white px-5 pr-12 text-[17px] font-medium text-slate-700 outline-none placeholder:text-slate-400",
                            disabled
                                ? "cursor-not-allowed bg-slate-50 opacity-70"
                                : "",
                            error
                                ? "border-red-400 focus:border-red-500"
                                : "border-slate-300 focus:border-[#0879bd]",
                        ].join(" ")}
                    />

                    <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
                </div>

                {open && !disabled ? (
                    <div className="absolute left-0 right-0 top-[56px] z-30 max-h-[260px] overflow-y-auto border border-slate-200 bg-white shadow-lg">
                        {filtered.length === 0 ? (
                            <div className="px-5 py-4 text-sm font-medium text-slate-500">
                                {emptyLabel}
                            </div>
                        ) : (
                            filtered.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handlePick(opt)}
                                    className="flex w-full flex-col items-start border-b border-slate-100 px-5 py-3 text-left hover:bg-slate-50"
                                >
                                    <span className="text-[15px] font-semibold text-slate-800">
                                        {opt.primary}
                                    </span>

                                    {opt.secondary ? (
                                        <span className="mt-1 text-xs text-slate-500">
                                            {opt.secondary}
                                        </span>
                                    ) : null}
                                </button>
                            ))
                        )}
                    </div>
                ) : null}
            </div>

            <FieldError message={error} />
        </>
    );
}
