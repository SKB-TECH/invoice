import { ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const createFormSelectClassName =
    "h-[50px] w-full appearance-none rounded border border-slate-300 bg-white px-5 pr-12 text-[17px] font-medium text-slate-700 outline-none focus:border-[#0879bd] disabled:cursor-not-allowed disabled:bg-slate-100";

export const createFormTextareaClassName =
    "min-h-[120px] w-full rounded border border-slate-300 bg-white px-5 py-3 text-[17px] font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0879bd]";

export function FieldLabel({ children }: { children: ReactNode }) {
    return (
        <label className="mb-2 block text-[17px] font-semibold text-slate-700">
            {children}
        </label>
    );
}

export const readOnlyFieldClassName =
    "flex min-h-[50px] w-full items-center rounded border border-slate-300 bg-slate-50 px-5 text-[17px] font-medium text-slate-700";

export const readOnlyTextareaClassName =
    "min-h-[120px] w-full rounded border border-slate-300 bg-slate-50 px-5 py-3 text-[17px] font-medium leading-relaxed text-slate-700";

export function ReadOnlyField({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn(readOnlyFieldClassName, className)}>{children}</div>
    );
}

export function ReadOnlyTextarea({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn(readOnlyTextareaClassName, className)}>
            {children}
        </div>
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

type InputFieldProps = {
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    type?: string;
    readOnly?: boolean;
    error?: string;
    id?: string;
    name?: string;
    required?: boolean;
    inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
    onChange?: (value: string) => void;
    onBlur?: InputHTMLAttributes<HTMLInputElement>["onBlur"];
};

export function InputField({
    placeholder,
    value,
    defaultValue,
    type = "text",
    readOnly = false,
    error,
    id,
    name,
    required,
    inputMode,
    onChange,
    onBlur,
}: InputFieldProps) {
    const isControlled = value !== undefined;

    return (
        <>
            <input
                id={id}
                name={name}
                type={type}
                required={required}
                inputMode={inputMode}
                readOnly={readOnly}
                placeholder={placeholder}
                onBlur={onBlur}
                {...(isControlled
                    ? { value }
                    : defaultValue !== undefined
                      ? { defaultValue }
                      : {})}
                onChange={(event) => onChange?.(event.target.value)}
                className={[
                    "h-[50px] w-full rounded border bg-white px-5 text-[17px] font-medium text-slate-700 outline-none",
                    "placeholder:text-slate-400",
                    readOnly ? "cursor-default bg-slate-50 text-slate-500" : "",
                    error
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0879bd]",
                ].join(" ")}
            />

            <FieldError message={error} />
        </>
    );
}

export function TextareaField({
    id,
    name,
    placeholder,
    rows = 3,
    required,
    defaultValue,
    value,
    onChange,
}: {
    id?: string;
    name?: string;
    placeholder?: string;
    rows?: number;
    required?: boolean;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
}) {
    const isControlled = value !== undefined;

    return (
        <textarea
            id={id}
            name={name}
            rows={rows}
            required={required}
            placeholder={placeholder}
            {...(isControlled
                ? { value }
                : defaultValue !== undefined
                  ? { defaultValue }
                  : {})}
            onChange={(event) => onChange?.(event.target.value)}
            className={createFormTextareaClassName}
        />
    );
}

export function NativeSelectField({
    id,
    name,
    value,
    defaultValue,
    required,
    disabled,
    onChange,
    children,
    error,
    "aria-label": ariaLabel,
}: {
    id?: string;
    name?: string;
    value?: string;
    defaultValue?: string;
    required?: boolean;
    disabled?: boolean;
    onChange?: (value: string) => void;
    children: ReactNode;
    error?: string;
    "aria-label"?: string;
}) {
    const isControlled = value !== undefined;

    return (
        <>
            <div className="relative">
                <select
                    id={id}
                    name={name}
                    required={required}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    {...(isControlled
                        ? { value, onChange: (e) => onChange?.(e.target.value) }
                        : defaultValue !== undefined
                          ? { defaultValue }
                          : {})}
                    className={[
                        createFormSelectClassName,
                        !isControlled && !defaultValue
                            ? "text-slate-400"
                            : "",
                    ].join(" ")}
                >
                    {children}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
            </div>
            <FieldError message={error} />
        </>
    );
}

export function CreateFormFooter({
    cancelLabel,
    submitLabel,
    onCancel,
    onSubmit,
    submitDisabled = false,
    submitType = "button",
    className,
}: {
    cancelLabel: string;
    submitLabel: string;
    onCancel: () => void;
    onSubmit?: () => void;
    submitDisabled?: boolean;
    submitType?: "button" | "submit";
    className?: string;
}) {
    const buttonClass =
        "inline-flex h-[50px] w-52 items-center justify-center rounded text-[14px] font-semibold leading-none";

    return (
        <div
            className={cn(
                "mt-6 flex flex-wrap items-center justify-end gap-5",
                className,
            )}
        >
            <button
                type="button"
                onClick={onCancel}
                className={cn(
                    buttonClass,
                    "bg-slate-400 text-white hover:bg-slate-500",
                )}
            >
                {cancelLabel}
            </button>
            <button
                type={submitType}
                disabled={submitDisabled}
                onClick={
                    submitType === "button" ? onSubmit : undefined
                }
                className={cn(
                    buttonClass,
                    "bg-[#0879bd] text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:opacity-60",
                )}
            >
                {submitLabel}
            </button>
        </div>
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
