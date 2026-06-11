"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown, Loader2 } from "lucide-react";

import { FieldError } from "@/components/invoices/create/Fields";
import { cn } from "@/lib/utils";
import type { Country } from "@/core/schemas/country.schema";
import {
    countryFormValue,
    findCountryByValue,
    formatCountryLabel,
} from "@/core/schemas/country.schema";

type Props = {
    id?: string;
    value: string;
    countries: readonly Country[];
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    loading?: boolean;
    loadError?: boolean;
    placeholder?: string;
    loadingPlaceholder?: string;
    loadErrorMessage?: string;
};

export function CountryAutocomplete({
    id,
    value,
    countries,
    onChange,
    error,
    disabled = false,
    loading = false,
    loadError = false,
    placeholder = "Rechercher un pays…",
    loadingPlaceholder = "Chargement des pays…",
    loadErrorMessage = "Impossible de charger les pays.",
}: Props) {
    const inputId = id ?? "country";
    const listboxId = `${inputId}-listbox`;
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selected = findCountryByValue(countries, value);

    const filteredCountries = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return countries;

        return countries.filter(
            (country) =>
                country.name.toLowerCase().includes(normalized) ||
                (country.fullname ?? "").toLowerCase().includes(normalized) ||
                country.tel.includes(normalized) ||
                country.code.toLowerCase().includes(normalized)
        );
    }, [countries, query]);

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

    const handleSelect = (country: Country) => {
        onChange(countryFormValue(country));
        setOpen(false);
        setQuery("");
    };

    const isDisabled = disabled || loading || loadError;
    const inputValue = open
        ? query
        : selected
          ? formatCountryLabel(selected)
          : "";

    const resolvedPlaceholder = loading
        ? loadingPlaceholder
        : loadError
          ? loadErrorMessage
          : placeholder;

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                {selected && !open ? (
                    <span className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2">
                        <ReactCountryFlag
                            countryCode={selected.code}
                            svg
                            style={{ width: "1.25rem", height: "1.25rem" }}
                            aria-hidden
                        />
                    </span>
                ) : null}

                {loading ? (
                    <Loader2 className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-500" />
                ) : (
                    <ChevronDown
                        className={cn(
                            "pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600 transition-transform",
                            open && "rotate-180"
                        )}
                    />
                )}

                <input
                    ref={inputRef}
                    id={inputId}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    disabled={isDisabled}
                    placeholder={resolvedPlaceholder}
                    value={inputValue}
                    onFocus={() => {
                        if (isDisabled) return;
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
                        isDisabled && "cursor-not-allowed bg-slate-100",
                        error || loadError
                            ? "border-red-400 focus:border-red-500"
                            : "border-slate-300 focus:border-[#0879bd]"
                    )}
                />
            </div>

            {open && !isDisabled ? (
                <ul
                    id={listboxId}
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded border border-slate-200 bg-white py-1 shadow-lg"
                >
                    {filteredCountries.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-slate-500">
                            Aucun pays trouvé
                        </li>
                    ) : (
                        filteredCountries.map((country) => {
                            const optionValue = countryFormValue(country);

                            return (
                                <li key={country.id}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={optionValue === value}
                                        onMouseDown={(event) =>
                                            event.preventDefault()
                                        }
                                        onClick={() => handleSelect(country)}
                                        className={cn(
                                            "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-slate-700 hover:bg-slate-50",
                                            optionValue === value && "bg-slate-50"
                                        )}
                                    >
                                        <ReactCountryFlag
                                            countryCode={country.code}
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
                            );
                        })
                    )}
                </ul>
            ) : null}

            <FieldError message={loadError ? loadErrorMessage : error} />
        </div>
    );
}
