"use client";

import React, { useState } from "react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { SelectBox } from "@/components/configuration/select-box";

type RoleValue = "admin" | "accountant" | "manager";

type PermissionGroup = {
    title: string;
    items: string[];
};

const ROLE_OPTIONS: { value: RoleValue; label: string }[] = [
    { value: "admin", label: "Administrateur" },
    { value: "accountant", label: "Comptable" },
    { value: "manager", label: "Gestionnaire" },
];

const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        title: "Factures",
        items: [
            "Voir les factures",
            "Créer une facture",
            "Modifier une facture",
            "Supprimer une facture",
        ],
    },
    {
        title: "Paiements",
        items: [
            "Voir les paiements",
            "Valider un paiement",
            "Annuler un paiement",
        ],
    },
    {
        title: "Clients",
        items: [
            "Voir les clients",
            "Ajouter un client",
            "Modifier un client",
            "Supprimer un client",
        ],
    },
    {
        title: "Configuration",
        items: [
            "Modifier les informations générales",
            "Gérer les groupes de taxation",
            "Gérer les modèles de factures",
            "Gérer les informations bancaires",
        ],
    },
];

const INITIAL_PERMISSIONS = [
    "Voir les factures",
    "Créer une facture",
    "Voir les paiements",
    "Voir les clients",
];

export function PermissionsSection() {
    const [selectedRole, setSelectedRole] =
        useState<RoleValue>("accountant");

    const [selectedPermissions, setSelectedPermissions] =
        useState<string[]>(INITIAL_PERMISSIONS);

    const handleCancel = () => {
        setSelectedRole("accountant");
        setSelectedPermissions(INITIAL_PERMISSIONS);
    };

    const togglePermission = (permission: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((item) => item !== permission)
                : [...prev, permission]
        );
    };

    const handleSubmit = () => {
        console.log("Permissions enregistrées :", {
            role: selectedRole,
            permissions: selectedPermissions,
        });
    };

    return (
        <>
            <SectionCard title="Gestion des permissions">
                <div className="mb-6 max-w-md">
                    <SelectBox
                        label="Rôle concerné"
                        value={selectedRole}
                        options={ROLE_OPTIONS}
                        onChange={setSelectedRole}
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    {PERMISSION_GROUPS.map((group) => (
                        <div
                            key={group.title}
                            className="border border-slate-200 px-4 py-4"
                        >
                            <h3 className="mb-4 text-[14px] font-semibold text-slate-900">
                                {group.title}
                            </h3>

                            <div className="space-y-3">
                                {group.items.map((permission) => {
                                    const checked =
                                        selectedPermissions.includes(
                                            permission
                                        );

                                    return (
                                        <label
                                            key={permission}
                                            className="flex cursor-pointer items-start gap-3 text-[13px] text-slate-700"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    togglePermission(permission)
                                                }
                                                className="mt-[2px] h-4 w-4 border-slate-300"
                                            />

                                            <span>{permission}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel="Enregistrer les permissions"
            />
        </>
    );
}
