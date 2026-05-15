import React from "react";

type Props = {
    title: string;
    children: React.ReactNode;
};

export function SectionCard({ title, children }: Props) {
    return (
        <div className="border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-[16px] font-semibold">{title}</h2>
            </div>
            <div className="px-5 py-5">{children}</div>
        </div>
    );
}
