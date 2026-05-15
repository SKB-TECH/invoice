"use client";

import React, { useState } from "react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";

type InvoiceTemplate = {
    id: number;
    name: string;
    description: string;
    isDefault: boolean;
};

type TemplateForm = {
    name: string;
    description: string;
};

const INITIAL_TEMPLATES: InvoiceTemplate[] = [
    {
        id: 1,
        name: "Modèle standard",
        description: "Format classique pour les factures ordinaires.",
        isDefault: true,
    },
    {
        id: 2,
        name: "Modèle professionnel",
        description: "Présentation plus détaillée avec informations avancées.",
        isDefault: false,
    },
    {
        id: 3,
        name: "Modèle compact",
        description: "Format condensé pour impression rapide.",
        isDefault: false,
    },
];

const INITIAL_FORM: TemplateForm = {
    name: "",
    description: "",
};

export function InvoiceModelsSection() {
    const [templates, setTemplates] =
        useState<InvoiceTemplate[]>(INITIAL_TEMPLATES);

    const [form, setForm] = useState<TemplateForm>(INITIAL_FORM);

    const handleCancel = () => {
        setForm(INITIAL_FORM);
    };

    const handleSubmit = () => {
        if (!form.name.trim() || !form.description.trim()) {
            return;
        }

        const newTemplate: InvoiceTemplate = {
            id: Date.now(),
            name: form.name.trim(),
            description: form.description.trim(),
            isDefault: templates.length === 0,
        };

        setTemplates((prev) => [newTemplate, ...prev]);
        setForm(INITIAL_FORM);
    };

    const setDefaultTemplate = (id: number) => {
        setTemplates((prev) =>
            prev.map((template) => ({
                ...template,
                isDefault: template.id === id,
            }))
        );
    };

    const removeTemplate = (id: number) => {
        setTemplates((prev) => prev.filter((template) => template.id !== id));
    };

    return (
        <>
            <SectionCard title="Ajouter un modèle de facture">
                <div className="mb-5">
                    <p className="text-[14px] font-semibold text-slate-800">
                        Nouveau modèle
                    </p>

                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                        Créez un modèle qui pourra être utilisé lors de la
                        génération des factures.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                        label="Nom du modèle"
                        value={form.name}
                        placeholder="Ex. Facture officielle"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                name: value,
                            }))
                        }
                    />

                    <InputField
                        label="Description"
                        value={form.description}
                        placeholder="Décrire brièvement le modèle"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                description: value,
                            }))
                        }
                    />
                </div>
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel="Ajouter le modèle"
                submitDisabled={
                    !form.name.trim() || !form.description.trim()
                }
            />

            <SectionCard title="Modèles disponibles">
                <div className="space-y-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="flex flex-col gap-4 border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-[15px] font-semibold text-slate-900">
                                        {template.name}
                                    </h3>

                                    {template.isDefault && (
                                        <span className="bg-[#eef7fc] px-2 py-1 text-[11px] font-semibold text-[#0073C5]">
                                            Par défaut
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                                    {template.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {!template.isDefault && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDefaultTemplate(template.id)
                                        }
                                        className="h-9 border border-slate-200 px-4 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Définir par défaut
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="h-9 border border-slate-200 px-4 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Aperçu
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeTemplate(template.id)
                                    }
                                    className="h-9 border border-red-200 px-4 text-[12px] font-medium text-red-600 hover:bg-red-50"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}

                    {templates.length === 0 && (
                        <div className="py-10 text-center text-[14px] text-slate-500">
                            Aucun modèle disponible.
                        </div>
                    )}
                </div>
            </SectionCard>
        </>
    );
}
