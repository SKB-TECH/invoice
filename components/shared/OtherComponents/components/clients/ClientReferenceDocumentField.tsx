"use client";

import { useState } from "react";
import { FileText, Upload } from "lucide-react";

import { FieldError } from "@/components/invoices/create/Fields";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type Props = {
    file: File | null;
    existingLabel?: string;
    onChange: (file: File | null) => void;
    error?: string;
    disabled?: boolean;
    accept?: string;
};

export function ClientReferenceDocumentField({
    file,
    existingLabel,
    onChange,
    error,
    disabled = false,
    accept = ".pdf,.png,.jpg,.jpeg,.doc,.docx",
}: Props) {
    const [sizeError, setSizeError] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0] ?? null;

        if (selected && selected.size > MAX_FILE_SIZE) {
            setSizeError(
                `Le fichier dépasse la taille maximale de 5 Mo (${(selected.size / (1024 * 1024)).toFixed(2)} Mo).`
            );
            onChange(null);
            return;
        }

        setSizeError("");
        onChange(selected);
    };

    const displayName =
        file?.name ??
        (existingLabel?.trim() ? existingLabel : "Choisir un document");

    return (
        <div>
            <label
                className={cn(
                    "flex min-h-[50px] w-full cursor-pointer items-center justify-between gap-3 rounded border bg-white px-5 py-3 transition",
                    disabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-100"
                        : "border-slate-300 hover:border-[#0879bd]",
                    error || sizeError
                        ? "border-red-400"
                        : "border-slate-300"
                )}
            >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="rounded border border-slate-200 bg-slate-50 p-2">
                        {file || existingLabel ? (
                            <FileText className="h-4 w-4 text-[#0879bd]" />
                        ) : (
                            <Upload className="h-4 w-4 text-slate-600" />
                        )}
                    </span>
                    <span className="truncate text-[15px] font-medium text-slate-700">
                        {displayName}
                    </span>
                </span>
                <span className="shrink-0 text-xs text-slate-500">
                    PDF, JPG, PNG, DOC
                </span>
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    disabled={disabled}
                    onChange={handleChange}
                />
            </label>

            <FieldError message={sizeError || error} />
        </div>
    );
}
