import React from "react";

import { cn } from "@/lib/utils";

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
    disabled?: boolean;
    readonlyMuted?: boolean;
};

export function InputField({
                               label,
                               value,
                               onChange,
                               placeholder,
                               type = "text",
                               disabled = false,
                               readonlyMuted = false,
                           }: Props) {
    const effectiveDisabled = disabled && !readonlyMuted;

    return (
        <div>
            <label className="mb-1 block text-[13px] font-medium">
                {label}
            </label>

            <input
                type={type}
                value={value}
                disabled={effectiveDisabled}
                readOnly={readonlyMuted}
                tabIndex={readonlyMuted ? -1 : undefined}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]",
                    readonlyMuted
                        ? "h-12 cursor-default rounded-none bg-slate-50 text-slate-800"
                        : "h-11 disabled:cursor-not-allowed disabled:bg-slate-100",
                )}
            />
        </div>
    );
}
