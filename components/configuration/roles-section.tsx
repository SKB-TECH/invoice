"use client";

import React, { useMemo, useState } from "react";
import {
    Loader2,
    Pencil,
    Search,
    Trash2,
    X,
} from "lucide-react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";
import {
    useCreateRole,
    useDeleteRole,
    useRoles,
    useUpdateRole,
} from "@/core/hooks/roles/useRoles";

import type { RoleItem } from "@/core/types/role";

type RoleForm = {
    name: string;
    description: string;
};

const INITIAL_FORM: RoleForm = {
    name: "",
    description: "",
};

const LIMIT = 10;

export function RolesSection() {
    const [form, setForm] = useState<RoleForm>(INITIAL_FORM);
    const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const rolesParams = useMemo(
        () => ({
            page,
            limit: LIMIT,
            search: search.trim() || undefined,
        }),
        [page, search]
    );

    const {
        data: rolesData,
        isPending: isLoadingRoles,
        isError: isRolesError,
    } = useRoles(rolesParams);

    const roles = rolesData?.data ?? [];
    const total = rolesData?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));

    const { mutate: createRole, isPending: isCreating } = useCreateRole({
        onSuccess: () => {
            setForm(INITIAL_FORM);
            setPage(1);
        },
    });

    const { mutate: updateRole, isPending: isUpdating } = useUpdateRole({
        onSuccess: () => {
            setForm(INITIAL_FORM);
            setEditingRole(null);
        },
    });

    const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

    const isSubmitting = isCreating || isUpdating;

    const handleCancel = () => {
        setForm(INITIAL_FORM);
        setEditingRole(null);
    };

    const handleSubmit = () => {
        const name = form.name.trim();
        const description = form.description.trim();

        if (!name || !description) {
            return;
        }

        if (editingRole) {
            updateRole({
                id: editingRole.Id_0,
                name,
                description,
            });

            return;
        }

        createRole({
            name,
            description,
        });
    };

    const handleEdit = (role: RoleItem) => {
        setEditingRole(role);

        setForm({
            name: role.Name_7,
            description: role.Description_8,
        });
    };

    const handleDelete = (role: RoleItem) => {
        const confirmed = window.confirm(
            `Voulez-vous vraiment supprimer le rôle « ${role.Name_7} » ?`
        );

        if (!confirmed) {
            return;
        }

        deleteRole({
            id: role.Id_0,
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handlePreviousPage = () => {
        setPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setPage((prev) => Math.min(totalPages, prev + 1));
    };

    return (
        <>
            <SectionCard
                title={editingRole ? "Modifier un rôle" : "Créer un rôle"}
            >
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[14px] font-semibold text-slate-800">
                            {editingRole ? "Modification du rôle" : "Nouveau rôle"}
                        </p>

                        <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                            {editingRole
                                ? "Mettez à jour le nom et la description du rôle."
                                : "Créez un rôle puis attribuez-lui les permissions nécessaires."}
                        </p>
                    </div>

                    {editingRole && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex size-9 items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50"
                            aria-label="Annuler la modification"
                        >
                            <X className="size-4" />
                        </button>
                    )}
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
                submitLabel={
                    isSubmitting
                        ? "Traitement..."
                        : editingRole
                            ? "Modifier le rôle"
                            : "Créer le rôle"
                }
                submitDisabled={
                    isSubmitting ||
                    !form.name.trim() ||
                    !form.description.trim()
                }
            />

            <SectionCard title="Liste des rôles">
                <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="relative w-full md:max-w-sm">
                        <input
                            value={search}
                            onChange={(event) =>
                                handleSearchChange(event.target.value)
                            }
                            placeholder="Rechercher un rôle..."
                            className="h-11 w-full border border-slate-300 bg-white px-4 pr-11 text-[14px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0879bd]"
                        />

                        <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    <p className="text-[13px] font-medium text-slate-500">
                        {total} rôle{total > 1 ? "s" : ""}
                    </p>
                </div>

                <div className="overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <div className="min-w-[860px]">
                            <div className="grid grid-cols-[90px_220px_1fr_170px] bg-slate-100 px-5 py-3 text-[13px] font-semibold text-slate-600">
                                <div>ID</div>
                                <div>Nom</div>
                                <div>Description</div>
                                <div className="text-right">Actions</div>
                            </div>

                            {isLoadingRoles ? (
                                <div className="flex h-40 items-center justify-center gap-2 text-[14px] text-slate-500">
                                    <Loader2 className="size-4 animate-spin" />
                                    Chargement des rôles...
                                </div>
                            ) : isRolesError ? (
                                <div className="flex h-40 items-center justify-center text-[14px] text-red-500">
                                    Impossible de charger les rôles.
                                </div>
                            ) : roles.length === 0 ? (
                                <div className="flex h-40 items-center justify-center text-[14px] text-slate-500">
                                    Aucun rôle disponible.
                                </div>
                            ) : (
                                roles.map((role) => (
                                    <div
                                        key={role.Id_0}
                                        className="grid grid-cols-[90px_220px_1fr_170px] items-center border-t border-slate-200 px-5 py-4 text-[14px] text-slate-700 hover:bg-slate-50"
                                    >
                                        <div className="font-semibold text-slate-500">
                                            {role.Id_0}
                                        </div>

                                        <div className="font-semibold text-slate-900">
                                            {role.Name_7}
                                        </div>

                                        <div className="pr-4 text-slate-600">
                                            {role.Description_8 || "—"}
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(role)}
                                                className="flex h-9 items-center gap-2 border border-slate-200 px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                <Pencil className="size-3.5" />
                                                Modifier
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(role)}
                                                disabled={isDeleting}
                                                className="flex h-9 items-center gap-2 border border-red-200 px-3 text-[12px] font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <Trash2 className="size-3.5" />
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-[13px] text-slate-500">
                        Page {page} sur {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePreviousPage}
                            disabled={page <= 1 || isLoadingRoles}
                            className="h-10 border border-slate-200 px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Précédent
                        </button>

                        <button
                            type="button"
                            onClick={handleNextPage}
                            disabled={
                                page >= totalPages ||
                                isLoadingRoles ||
                                total === 0
                            }
                            className="h-10 border border-slate-200 px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            </SectionCard>
        </>
    );
}
