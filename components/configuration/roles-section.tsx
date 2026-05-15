"use client";

import React, { useState } from "react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";

type RoleItem = {
    id: number;
    name: string;
    description: string;
    members: number;
    permissions: number;
};

type RoleForm = {
    name: string;
    description: string;
};

const INITIAL_ROLES: RoleItem[] = [
    {
        id: 1,
        name: "Administrateur",
        description: "Accès complet à toutes les fonctionnalités.",
        members: 2,
        permissions: 18,
    },
    {
        id: 2,
        name: "Comptable",
        description: "Gestion des factures, paiements et rapports.",
        members: 3,
        permissions: 10,
    },
    {
        id: 3,
        name: "Gestionnaire",
        description: "Gestion opérationnelle des informations métiers.",
        members: 4,
        permissions: 7,
    },
];

const INITIAL_FORM: RoleForm = {
    name: "",
    description: "",
};

export function RolesSection() {
    const [roles, setRoles] = useState<RoleItem[]>(INITIAL_ROLES);
    const [form, setForm] = useState<RoleForm>(INITIAL_FORM);

    const handleCancel = () => {
        setForm(INITIAL_FORM);
    };

    const handleSubmit = () => {
        if (!form.name.trim() || !form.description.trim()) {
            return;
        }

        const newRole: RoleItem = {
            id: Date.now(),
            name: form.name.trim(),
            description: form.description.trim(),
            members: 0,
            permissions: 0,
        };

        setRoles((prev) => [newRole, ...prev]);
        setForm(INITIAL_FORM);
    };

    const handleRemove = (id: number) => {
        setRoles((prev) => prev.filter((role) => role.id !== id));
    };

    return (
        <>
            <SectionCard title="Créer un rôle">
                <div className="mb-5">
                    <p className="text-[14px] font-semibold text-slate-800">
                        Nouveau rôle
                    </p>

                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                        Créez un rôle puis attribuez-lui les permissions
                        nécessaires.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                        label="Nom du rôle"
                        value={form.name}
                        placeholder="Ex. Validateur"
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
                        placeholder="Décrire brièvement le rôle"
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
                submitLabel="Créer le rôle"
                submitDisabled={
                    !form.name.trim() || !form.description.trim()
                }
            />

            <SectionCard title="Liste des rôles">
                <div className="space-y-4">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="border border-slate-200 px-4 py-4"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 className="text-[15px] font-semibold text-slate-900">
                                        {role.name}
                                    </h3>

                                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                                        {role.description}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-slate-600">
                                        <span>{role.members} membre(s)</span>
                                        <span>
                                            {role.permissions} permission(s)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="h-9 border border-slate-200 px-4 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRemove(role.id)}
                                        className="h-9 border border-red-200 px-4 text-[12px] font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {roles.length === 0 && (
                        <div className="py-10 text-center text-[14px] text-slate-500">
                            Aucun rôle disponible.
                        </div>
                    )}
                </div>
            </SectionCard>
        </>
    );
}
