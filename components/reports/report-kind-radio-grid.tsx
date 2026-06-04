"use client";

import { cn } from "@/lib/utils";

export type ReportKindOption = {
  value: string;
  label: string;
};

interface ReportKindRadioGridProps {
  title: string;
  options: ReportKindOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ReportKindRadioGrid({
  title,
  options,
  value,
  onChange,
  className,
}: ReportKindRadioGridProps) {
  return (
    <fieldset className="w-full space-y-3">
      <legend className="text-[13px] font-semibold text-slate-700">
        {title}
      </legend>

      <div className={cn("grid w-full gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5", className)}>
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                "flex h-[50px] w-full cursor-pointer items-center gap-3 border bg-white px-5 transition-all",
                isSelected
                  ? "border-2 border-[#0073C5] text-[#0073C5]"
                  : "border border-slate-300 text-slate-600 hover:border-slate-400"
              )}
            >
              <input
                type="radio"
                name="report-kind"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 accent-[#0073C5]"
              />

              <span className="text-sm font-medium">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}