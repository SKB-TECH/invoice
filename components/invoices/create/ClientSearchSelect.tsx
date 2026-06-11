"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Client } from "./types";
import { FieldError } from "./Fields";

export function ClientSearchSelect({
    clients,
    value,
    error,
    placeholder,
    emptyLabel,
    disabled,
    inputId = "client-search-select",
    onSelect,
}: {
    clients: Client[];
    value: string;
    error?: string;
    placeholder?: string;
    emptyLabel?: string;
    disabled?: boolean;
    inputId?: string;
    onSelect: (client: Client) => void;
}) {
    const t = useTranslations("createInvoice");
    const containerRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value);

    const resolvedPlaceholder =
        placeholder ?? t("client.searchPlaceholder");
    const resolvedEmpty = emptyLabel ?? t("client.empty");

    useEffect(() => {
        setSearch(value);
    }, [value]);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [open]);

    const filteredClients = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return clients;

        return clients.filter((client) => {
            return (
                client.name.toLowerCase().includes(q) ||
                client.nif.toLowerCase().includes(q) ||
                client.rccm.toLowerCase().includes(q) ||
                client.phone.toLowerCase().includes(q)
            );
        });
    }, [clients, search]);

    const handleSelectClient = (client: Client) => {
        setSearch(client.name);
        setOpen(false);
        onSelect(client);
    };

    return (
        <>
            <div ref={containerRef} className="relative">
                <div className="relative">
                    <input
                        id={inputId}
                        value={search}
                        disabled={disabled}
                        onFocus={() => {
                            if (!disabled) setOpen(true);
                        }}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setOpen(true);
                        }}
                        placeholder={resolvedPlaceholder}
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

                    <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
                </div>

                {open && !disabled ? (
                    <div className="absolute left-0 right-0 top-[56px] z-50 max-h-[260px] overflow-y-auto rounded border border-slate-200 bg-white shadow-lg">
                        {filteredClients.length === 0 ? (
                            <div className="px-5 py-4 text-sm font-medium text-slate-500">
                                {resolvedEmpty}
                            </div>
                        ) : (
                            filteredClients.map((client) => (
                                <button
                                    key={client.id}
                                    type="button"
                                    onClick={() => handleSelectClient(client)}
                                    className="flex w-full flex-col items-start border-b border-slate-100 px-5 py-3 text-left hover:bg-slate-50"
                                >
                                    <span className="text-[15px] font-semibold text-slate-800">
                                        {client.name}
                                    </span>

                                    <span className="mt-1 text-xs text-slate-500">
                                        NIF: {client.nif} / RCCM:{" "}
                                        {client.rccm}
                                    </span>
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
