import { FieldError } from "./Fields";
import type { InvoiceTemplateId } from "./types";

export function TemplateSelector({
                                     selectedTemplate,
                                     error,
                                     onSelect,
                                 }: {
    selectedTemplate: InvoiceTemplateId | null;
    error?: string;
    onSelect: (template: InvoiceTemplateId) => void;
}) {
    return (
        <div className="mb-6 border border-slate-200 bg-slate-50 p-5">
            <p className="mb-4 text-[17px] font-semibold text-slate-700">
                Modèle PDF de la facture
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                    type="button"
                    onClick={() => onSelect(1)}
                    className={[
                        "h-20 rounded border px-6 text-left transition",
                        selectedTemplate === 1
                            ? "border-[#0879bd] bg-[#E8EFFB]"
                            : "border-slate-300 bg-white hover:bg-slate-50",
                    ].join(" ")}
                >
                    <p className="text-base font-bold text-slate-800">
                        Template A
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => onSelect(2)}
                    className={[
                        "h-20 rounded border px-6 text-left transition",
                        selectedTemplate === 2
                            ? "border-[#0879bd] bg-[#E8EFFB]"
                            : "border-slate-300 bg-white hover:bg-slate-50",
                    ].join(" ")}
                >
                    <p className="text-base font-bold text-slate-800">
                        Template B
                    </p>
                </button>
            </div>

            <FieldError message={error} />
        </div>
    );
}
