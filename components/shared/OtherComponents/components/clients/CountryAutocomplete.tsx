"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown } from "lucide-react";

import { FieldError } from "@/components/invoices/create/Fields";
import { cn } from "@/lib/utils";
import {
    CLIENT_COUNTRIES,
    findCountryByCode,
    formatCountryLabel,
    type ClientCountry,
} from "./countries";

type Props = {
    id?: string;
    value: string;
    onChange: (code: string) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
};

export function CountryAutocomplete({
    id,
    value,
    onChange,
    error,
    disabled = false,
    placeholder = "Rechercher un pays…",
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selected = findCountryByCode(value);

    const filteredCountries = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return CLIENT_COUNTRIES;

        return CLIENT_COUNTRIES.filter(
            (country) =>
                country.name.toLowerCase().includes(normalized) ||
                country.code.includes(normalized) ||
                country.iso.toLowerCase().includes(normalized)
        );
    }, [query]);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    const handleSelect = (country: ClientCountry) => {
        onChange(country.code);
        setOpen(false);
        setQuery("");
    };

    const inputValue = open
        ? query
        : selected
          ? formatCountryLabel(selected)
          : "";

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                {selected && !open ? (
                    <span className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2">
                        <ReactCountryFlag
                            countryCode={selected.iso}
                            svg
                            style={{ width: "1.25rem", height: "1.25rem" }}
                            aria-hidden
                        />
                    </span>
                ) : null}

                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    disabled={disabled}
                    placeholder={placeholder}
                    value={inputValue}
                    onFocus={() => {
                        if (disabled) return;
                        setOpen(true);
                        setQuery("");
                    }}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        if (!open) setOpen(true);
                    }}
                    className={cn(
                        "h-[50px] w-full rounded border bg-white pr-12 text-[17px] font-medium text-slate-700 outline-none",
                        "placeholder:text-slate-400",
                        selected && !open ? "pl-12" : "px-5",
                        disabled && "cursor-not-allowed bg-slate-100",
                        error
                            ? "border-red-400 focus:border-red-500"
                            : "border-slate-300 focus:border-[#0879bd]"
                    )}
                />

                <ChevronDown
                    className={cn(
                        "pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600 transition-transform",
                        open && "rotate-180"
                    )}
                />
            </div>

            {open && !disabled ? (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded border border-slate-200 bg-white py-1 shadow-lg"
                >
                    {filteredCountries.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-slate-500">
                            Aucun pays trouvé
                        </li>
                    ) : (
                        filteredCountries.map((country) => (
                            <li key={`${country.iso}-${country.code}`}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={country.code === value}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => handleSelect(country)}
                                    className={cn(
                                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-slate-700 hover:bg-slate-50",
                                        country.code === value && "bg-slate-50"
                                    )}
                                >
                                    <ReactCountryFlag
                                        countryCode={country.iso}
                                        svg
                                        style={{
                                            width: "1.25rem",
                                            height: "1.25rem",
                                        }}
                                        aria-hidden
                                    />
                                    <span>{formatCountryLabel(country)}</span>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            ) : null}

            <FieldError message={error} />
        </div>
    );
}
