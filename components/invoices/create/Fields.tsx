import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function FieldLabel({ children }: { children: ReactNode }) {
    return (
        <label className="mb-2 block text-[17px] font-semibold text-slate-700">
            {children}
        </label>
    );
}

export function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <p className="mt-2 text-sm font-medium text-red-500">
            {message}
        </p>
    );
}

export function InputField({
                               placeholder,
                               value,
                               type = "text",
                               readOnly = false,
                               error,
                               onChange,
                           }: {
    placeholder?: string;
    value?: string;
    type?: string;
    readOnly?: boolean;
    error?: string;
    onChange?: (value: string) => void;
}) {
    return (
        <>
            <input
                type={type}
                value={value ?? ""}
                readOnly={readOnly}
                placeholder={placeholder}
                onChange={(event) => onChange?.(event.target.value)}
                className={[
                    "h-[50px] w-full rounded border bg-white px-5 text-[17px] font-medium text-slate-700 outline-none",
                    "placeholder:text-slate-400",
                    readOnly ? "bg-slate-50 text-slate-500" : "",
                    error
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0879bd]",
                ].join(" ")}
            />

            <FieldError message={error} />
        </>
    );
}

export function SelectField({
                                placeholder,
                                value,
                                options = [],
                                onChange,
                                disabled = false,
                                error,
                            }: {
    placeholder?: string;
    value?: string;
    options?: Array<{
        label: string;
        value: string;
    }>;
    onChange?: (value: string) => void;
    disabled?: boolean;
    error?: string;
}) {
    return (
        <>
            <div className="relative">
                <select
                    value={value ?? ""}
                    disabled={disabled}
                    onChange={(event) => onChange?.(event.target.value)}
                    className={[
                        "h-[50px] w-full appearance-none rounded border bg-white px-5 pr-12 text-[17px] font-medium outline-none",
                        value ? "text-slate-700" : "text-slate-400",
                        disabled ? "cursor-not-allowed bg-slate-100" : "",
                        error
                            ? "border-red-400 focus:border-red-500"
                            : "border-slate-300 focus:border-[#0879bd]",
                    ].join(" ")}
                >
                    <option value="">{placeholder ?? "Sélectionnez"}</option>

                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
            </div>

            <FieldError message={error} />
        </>
    );
}
