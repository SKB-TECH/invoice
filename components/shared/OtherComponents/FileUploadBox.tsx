"use client";

import { Label } from "@/components/ui/label";
import { FileText, Upload } from "lucide-react";
import { useState } from "react";

type Props = {
    label: string;
    required?: boolean;
    file?: File | null;
    error?: string;
    accept?: string;
    disabled?: boolean;
    onChange: (f: File | null) => void;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Mo

export default function FileUploadBox({
                                          label,
                                          required,
                                          file,
                                          error,
                                          accept = ".pdf,.png,.jpg,.jpeg",
                                          disabled = false,
                                          onChange,
                                      }: Props) {
    const [sizeError, setSizeError] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] ?? null;

        if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
            setSizeError(`Cette image dépasse la taille maximale de 2 Mo (${(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo)`);
            onChange(null);
            return;
        }

        setSizeError("");
        onChange(selectedFile);
    };

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">
                {label} {required ? <span className="text-red-500">*</span> : null}
            </Label>

            <label className="flex min-h-[48px] cursor-pointer items-center justify-between rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition hover:bg-gray-100">
                <div className="flex items-center gap-3">
                    <div className="rounded bg-white p-2 border">
                        <Upload className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="text-sm text-gray-700">
                        {file ? (
                            <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                                {file.name}
              </span>
                        ) : (
                            <span>Choisir un fichier</span>
                        )}
                    </div>
                </div>

                <span className="text-xs text-gray-500">PDF, JPG, PNG</span>

                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    disabled={disabled}
                    onChange={handleChange}
                />
            </label>

            {error ? <p className="text-xs text-red-500">{error}</p> : null}
            {sizeError ? <p className="text-xs text-red-500">{sizeError}</p> : null}
        </div>
    );
}
