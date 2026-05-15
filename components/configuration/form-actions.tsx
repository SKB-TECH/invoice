import React from "react";

type Props = {
    onCancel?: () => void;
    onSubmit?: () => void;
    cancelLabel?: string;
    submitLabel?: string;
    submitDisabled?: boolean;
};

export function FormActions({
                                onCancel,
                                onSubmit,
                                cancelLabel = "Annuler",
                                submitLabel = "Enregistrer",
                                submitDisabled = false,
                            }: Props) {
    return (
        <div className="flex justify-end gap-3">
            <button
                type="button"
                onClick={onCancel}
                className="h-11 border border-slate-200 px-6 text-[14px] font-semibold text-slate-700 hover:bg-slate-50"
            >
                {cancelLabel}
            </button>

            <button
                type="button"
                onClick={onSubmit}
                disabled={submitDisabled}
                className="h-11 bg-[#0073C5] px-8 text-[14px] font-semibold text-white hover:bg-[#005999] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
                {submitLabel}
            </button>
        </div>
    );
}
