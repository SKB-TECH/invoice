import { useMemo, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Option = {
    value: string;
    label: string;
};

type Props = {
    label?: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    value: string;
    onChange: (value: string) => void;
    options: readonly Option[] | Option[];
    error?: string;
    allowCustomValue?: boolean;
    customValuePlaceholder?: string;
    searchable?: boolean;
};

const CUSTOM_VALUE = "__custom__";

export function CustomSelect({
                                 label = "",
                                 required = true,
                                 placeholder = "Sélectionner",
                                 disabled = false,
                                 value,
                                 onChange,
                                 options = [],
                                 error,
                                 allowCustomValue = false,
                                 customValuePlaceholder = "Saisir une valeur personnalisée",
                                 searchable = false,
                             }: Props) {
    const [customRequested, setCustomRequested] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const optionsArray = useMemo(() => [...options], [options]);

    const existsInOptions = useMemo(
        () => optionsArray.some((opt) => opt.value === value),
        [optionsArray, value]
    );

    const isCustomMode =
        allowCustomValue &&
        (customRequested || (value !== "" && !existsInOptions));

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchTerm) return optionsArray;

        return optionsArray.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opt.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [optionsArray, searchTerm, searchable]);

    const finalOptions = useMemo(() => {
        const baseOptions = searchable ? filteredOptions : optionsArray;

        if (!allowCustomValue) return baseOptions;

        const hasCustomOption = baseOptions.some((opt) => opt.value === CUSTOM_VALUE);
        if (hasCustomOption) return baseOptions;

        // Ajouter l'option "Autre" seulement si la recherche ne filtre pas tous les résultats
        if (searchable && searchTerm && filteredOptions.length === 0) {
            return [{ value: CUSTOM_VALUE, label: `Ajouter "${searchTerm}"` }];
        }

        return [...baseOptions, { value: CUSTOM_VALUE, label: "Autre..." }];
    }, [allowCustomValue, optionsArray, searchable, filteredOptions, searchTerm]);

    const selectValue = isCustomMode ? CUSTOM_VALUE : value || "";

    const handleSelectChange = (newValue: string) => {
        if (newValue === CUSTOM_VALUE) {
            setCustomRequested(true);
            onChange("");
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
            return;
        }

        setCustomRequested(false);
        onChange(newValue);
        setSearchTerm("");
    };

    const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
    };

    const handleBlur = () => {
        // Si l'utilisateur quitte le champ sans rien saisir, retourner à la sélection
        if (isCustomMode && value === "") {
            setCustomRequested(false);
        }
    };

    return (
        <div className="space-y-2 w-full h-12 mb-2">
            {label ? (
                <Label className="text-[16px]">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            ) : null}

            {!isCustomMode ? (
                <div className="relative">
                    {searchable && (
                        <div className="relative">
                            <Input
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mb-2 h-12 rounded shadow-none"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <Select
                        disabled={disabled}
                        value={selectValue}
                        onValueChange={handleSelectChange}
                        onOpenChange={(open) => {
                            if (!open) setSearchTerm("");
                        }}
                    >
                        <SelectTrigger
                            className={`rounded h-12 shadow-none ${
                                disabled ? "bg-gray-100" : ""
                            } ${error ? "border-red-500" : ""}`}
                            aria-invalid={!!error}
                        >
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>

                        <SelectContent className="max-h-[300px] overflow-y-auto">
                            {searchable && searchTerm && filteredOptions.length === 0 && (
                                <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                    Aucun résultat
                                </div>
                            )}
                            {finalOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="space-y-2">
                    <Input
                        ref={inputRef}
                        value={value}
                        disabled={disabled}
                        placeholder={customValuePlaceholder}
                        onChange={handleCustomInputChange}
                        onBlur={handleBlur}
                        className={`rounded h-12  shadow-none ${
                            disabled ? "bg-gray-100" : ""
                        } ${error ? "border-red-500" : ""}`}
                        aria-invalid={!!error}
                    />

                </div>
            )}

            {error ? <p className="text-xs text-red-500">{error}</p> : null}
        </div>
    );
}
