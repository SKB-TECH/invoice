"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
    value: string | number;
    onChange: (value: string) => void;

    error?: string;
    required?: boolean;
    className?: string;
    title?: string;
    isDisabled?: boolean;

    name: string;
    placeholder?: string;

    min?: number;
    max?: number;

    disableCopyPaste?: boolean;
};

export function NumberField({
                                value,
                                onChange,

                                error,
                                title = "",
                                required = true,
                                className = "",
                                isDisabled = false,

                                name = "",
                                placeholder,

                                min,
                                max,

                                disableCopyPaste = false,
                            }: Props) {
    const [localError, setLocalError] = React.useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // autorise vide (si required, l'erreur sera gérée par ta validation globale)
        if (inputValue === "") {
            setLocalError("");
            onChange("");
            return;
        }

        // digits only
        if (!/^\d+$/.test(inputValue)) {
            setLocalError("Veuillez entrer uniquement des chiffres.");
            return;
        }

        // OK
        setLocalError("");
        onChange(inputValue);
    };

    const displayError = error || localError;

    return (
        <div className={`space-y-2 w-full ${className}`}>
            {title ? (
                <Label>
                    {title} {required && <span className="text-red-500">*</span>}
                </Label>
            ) : null}

            <Input
                name={name}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                placeholder={placeholder}
                disabled={isDisabled}
                value={value}
                onChange={handleChange}
                className={`
          h-12 shadow-none rounded
          ${isDisabled ? "bg-gray-100" : ""}
          ${displayError ? "border-red-500" : ""}
        `}
                onCopy={disableCopyPaste ? (e) => e.preventDefault() : undefined}
                onPaste={disableCopyPaste ? (e) => e.preventDefault() : undefined}
                onCut={disableCopyPaste ? (e) => e.preventDefault() : undefined}
            />

            {displayError ? (
                <p className="text-xs text-red-500">{displayError}</p>
            ) : null}
        </div>
    );
}
