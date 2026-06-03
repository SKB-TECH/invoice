"use client";

import { FieldLabel } from "./Fields";
import type {
    InvoiceForm,
    InvoiceFormErrors,
    SetInvoiceErrors,
    SetInvoiceForm,
} from "./types";

const COMMENT_FIELDS = [
    { code: "A", label: "Réf. Exo." },
    { code: "B", label: "Réf. Paiement" },
    { code: "C", label: "Réf. Contrat" },
    { code: "D", label: "Réf. Bon commande" },
    { code: "E", label: "Réf. Livraison" },
    { code: "F", label: "Note interne" },
    { code: "G", label: "Observation" },
    { code: "H", label: "Autre commentaire" },
] as const;

type CommentCode = (typeof COMMENT_FIELDS)[number]["code"];

function getEmptyComments(): Record<CommentCode, string> {
    return {
        A: "",
        B: "",
        C: "",
        D: "",
        E: "",
        F: "",
        G: "",
        H: "",
    };
}

export function StepInvoiceComments({
                                        form,
                                        errors,
                                        setForm,
                                        setErrors,
                                    }: {
    form: InvoiceForm;
    errors: InvoiceFormErrors;
    setForm: SetInvoiceForm;
    setErrors: SetInvoiceErrors;
}) {
    const comments = {
        ...getEmptyComments(),
        ...(form.comments ?? {}),
    };

    const handleChangeComment = (code: CommentCode, value: string) => {
        setForm((prev) => ({
            ...prev,
            comments: {
                ...getEmptyComments(),
                ...(prev.comments ?? {}),
                [code]: value,
            },
        }));

        setErrors((prev) => ({
            ...prev,
            comments: undefined,
        }));
    };

    return (
        <div className="bg-white p-8">
            <div className="mb-6">
                <h2 className="text-[25px] font-semibold text-slate-700">
                    Commentaires facture
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-400">
                    Renseignez les lignes de commentaires exigées pour la facture normalisée.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {COMMENT_FIELDS.map((field) => (
                    <div key={field.code}>
                        <FieldLabel>
                            {field.code} - {field.label}
                        </FieldLabel>

                        <input
                            value={comments[field.code]}
                            placeholder={`Saisir ${field.label}`}
                            onChange={(event) =>
                                handleChangeComment(
                                    field.code,
                                    event.target.value
                                )
                            }
                            className="h-12 w-full rounded border border-slate-300 px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0879bd]"
                        />
                    </div>
                ))}
            </div>

            {errors.comments && (
                <p className="mt-4 text-sm font-medium text-red-500">
                    {errors.comments}
                </p>
            )}
        </div>
    );
}
