"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Client } from "./types";
import { FieldError } from "./Fields";

export function ClientSearchSelect({
                                       clients,
                                       value,
                                       error,
                                       onSelect,
                                   }: {
    clients: Client[];
    value: string;
    error?: string;
    onSelect: (client: Client) => void;
}) {
    const t = useTranslations("createInvoice");

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value);

    useEffect(() => {
        setSearch(value);
    }, [value]);

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
            <div className="relative">
                <div className="relative">
                    <input
                        value={search}
                        onFocus={() => setOpen(true)}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setOpen(true);
                        }}
                        placeholder={t("client.searchPlaceholder")}
                        className={[
                            "h-[50px] w-full rounded border bg-white px-5 pr-12 text-[17px] font-medium text-slate-700 outline-none placeholder:text-slate-400",
                            error
                                ? "border-red-400 focus:border-red-500"
                                : "border-slate-300 focus:border-[#0879bd]",
                        ].join(" ")}
                    />

                    <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
                </div>

                {open && (
                    <div className="absolute left-0 right-0 top-[56px] z-30 max-h-[260px] overflow-y-auto border border-slate-200 bg-white shadow-lg">
                        {filteredClients.length === 0 ? (
                            <div className="px-5 py-4 text-sm font-medium text-slate-500">
                                {t("client.empty")}
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
                                        NIF: {client.nif} / RCCM: {client.rccm}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            <FieldError message={error} />
        </>
    );
}
