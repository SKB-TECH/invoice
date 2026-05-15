import React from "react";

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
    disabled?: boolean;
};

export function InputField({
                               label,
                               value,
                               onChange,
                               placeholder,
                               type = "text",
                               disabled = false,
                           }: Props) {
    return (
        <div>
            <label className="mb-1 block text-[13px] font-medium">
                {label}
            </label>

            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
            />
        </div>
    );
}
