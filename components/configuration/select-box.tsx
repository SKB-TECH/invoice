type Props<T extends string> = {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
};

export function SelectBox<T extends string>({
                                                label,
                                                value,
                                                options,
                                                onChange,
                                            }: Props<T>) {
    return (
        <div>
            <label className="mb-1 block text-[13px] font-medium">
                {label}
            </label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="h-11 w-full border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
