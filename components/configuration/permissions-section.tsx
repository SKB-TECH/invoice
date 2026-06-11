"use client";

import React, { useMemo, useState } from "react";
import {
    CheckSquare,
    Loader2,
    Search,
    ShieldCheck,
    Square,
    ChevronDown,
    ChevronRight,
    X,
} from "lucide-react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { SelectBox } from "@/components/configuration/select-box";

import { usePermissions } from "@/core/hooks/permissions/usePermissions";
import {
    useRoles,
    useSyncRolePermissions,
} from "@/core/hooks/roles/useRoles";

import type { PermissionItem } from "@/core/types/permission";

type PermissionGroup = {
    module: string;
    permissions: PermissionItem[];
};

const PERMISSIONS_LIMIT = 500;
const ROLES_LIMIT = 100;

export function PermissionsSection() {
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<
        number[]
    >([]);
    const [search, setSearch] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<"grouped" | "list">("grouped");

    const {
        data: rolesData,
        isPending: isLoadingRoles,
        isError: isRolesError,
    } = useRoles({
        page: 1,
        limit: ROLES_LIMIT,
    });

    const {
        data: permissionsData,
        isPending: isLoadingPermissions,
        isError: isPermissionsError,
    } = usePermissions({
        page: 1,
        limit: PERMISSIONS_LIMIT,
    });

    const { mutate: syncRolePermissions, isPending: isSyncing } =
        useSyncRolePermissions({
            onSuccess: () => {
                console.log("Permissions synchronisées avec succès.");
            },
            onError: (error) => {
                console.error(
                    "Erreur lors de la synchronisation des permissions :",
                    error
                );
            },
        });

    const roleOptions = useMemo(() => {
        return (rolesData?.data ?? []).map((role) => ({
            value: String(role.Id_0),
            label: role.Name_7,
        }));
    }, [rolesData?.data]);

    const filteredPermissions = useMemo(() => {
        const permissions = permissionsData?.data ?? [];
        const query = search.trim().toLowerCase();

        if (!query) {
            return permissions;
        }

        return permissions.filter((permission) => {
            return (
                permission.Module_7.toLowerCase().includes(query) ||
                permission.Resource_8.toLowerCase().includes(query) ||
                permission.Action_9.toLowerCase().includes(query) ||
                permission.LongCode_10.toLowerCase().includes(query)
            );
        });
    }, [permissionsData?.data, search]);

    const permissionGroups: PermissionGroup[] = useMemo(() => {
        const groups = new Map<string, PermissionItem[]>();

        filteredPermissions.forEach((permission) => {
            const moduleName = permission.Module_7 || "Autres";

            const current = groups.get(moduleName) ?? [];
            current.push(permission);

            groups.set(moduleName, current);
        });

        return Array.from(groups.entries())
            .map(([moduleName, modulePermissions]) => ({
                module: moduleName,
                permissions: modulePermissions.sort((a, b) =>
                    a.LongCode_10.localeCompare(b.LongCode_10)
                ),
            }))
            .sort((a, b) => a.module.localeCompare(b.module));
    }, [filteredPermissions]);

    const isPermissionSelected = (permissionId: number) => {
        return selectedPermissionIds.includes(permissionId);
    };

    const togglePermission = (permissionId: number) => {
        setSelectedPermissionIds((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const selectAllInGroup = (group: PermissionGroup) => {
        const groupIds = group.permissions.map(
            (permission) => permission.Id_0
        );

        setSelectedPermissionIds((prev) =>
            Array.from(new Set([...prev, ...groupIds]))
        );
    };

    const clearAllInGroup = (group: PermissionGroup) => {
        const groupIds = new Set(
            group.permissions.map((permission) => permission.Id_0)
        );

        setSelectedPermissionIds((prev) =>
            prev.filter((id) => !groupIds.has(id))
        );
    };

    const isGroupFullySelected = (group: PermissionGroup) => {
        return group.permissions.length > 0 && group.permissions.every((permission) =>
            selectedPermissionIds.includes(permission.Id_0)
        );
    };

    const isGroupPartiallySelected = (group: PermissionGroup) => {
        const selectedCount = group.permissions.filter((permission) =>
            selectedPermissionIds.includes(permission.Id_0)
        ).length;
        return selectedCount > 0 && selectedCount < group.permissions.length;
    };

    const toggleGroup = (module: string) => {
        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(module)) {
                newSet.delete(module);
            } else {
                newSet.add(module);
            }
            return newSet;
        });
    };

    const expandAllGroups = () => {
        setExpandedGroups(new Set(permissionGroups.map(g => g.module)));
    };

    const collapseAllGroups = () => {
        setExpandedGroups(new Set());
    };

    const handleRoleChange = (roleId: string) => {
        setSelectedRoleId(roleId);
        setSelectedPermissionIds([]);
        setSearch("");
    };

    const handleCancel = () => {
        setSelectedRoleId("");
        setSelectedPermissionIds([]);
        setSearch("");
        setExpandedGroups(new Set());
    };

    const handleSubmit = () => {
        if (!selectedRoleId) {
            return;
        }

        syncRolePermissions({
            roleId: Number(selectedRoleId),
            permission_ids: selectedPermissionIds,
        });
    };

    const clearSearch = () => {
        setSearch("");
    };

    return (
        <>
            <SectionCard title="Gestion des permissions">
                <div className="mb-8 grid gap-6">
                    <div className={"w-full"}>
                        <SelectBox
                            label="Rôle concerné"
                            value={selectedRoleId}
                            options={roleOptions}
                            onChange={handleRoleChange}
                        />

                        {isLoadingRoles && (
                            <p className="mt-2 flex items-center gap-2 text-[13px] text-slate-500">
                                <Loader2 className="size-3.5 animate-spin" />
                                Chargement des rôles...
                            </p>
                        )}

                        {isRolesError && (
                            <p className="mt-2 text-[13px] text-red-500">
                                Impossible de charger les rôles.
                            </p>
                        )}
                    </div>
                </div>

                {/* Barre de recherche et contrôles */}
                {selectedRoleId && (
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="relative flex-1 md:max-w-md">
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Rechercher une permission par module, ressource, action..."
                                    className="h-11 w-full rounded border border-slate-300 bg-white px-4 pr-11 text-[14px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0879bd] focus:ring-1 focus:ring-[#0879bd]"
                                />
                                {search ? (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="size-4" />
                                    </button>
                                ) : (
                                    <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Vue groupée/Liste */}
                                <div className="flex rounded border border-slate-200 bg-white p-1">
                                    <button
                                        onClick={() => setViewMode("grouped")}
                                        className={`px-3 py-1 text-[13px] font-medium transition rounded-md ${
                                            viewMode === "grouped"
                                                ? "bg-[#0879bd] text-white"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        Groupé
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`px-3 py-1 text-[13px] font-medium transition rounded-md ${
                                            viewMode === "list"
                                                ? "bg-[#0879bd] text-white"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        Liste
                                    </button>
                                </div>

                                {viewMode === "grouped" && permissionGroups.length > 0 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={expandAllGroups}
                                            className="text-[12px] text-[#0879bd] hover:text-[#065a86]"
                                        >
                                            Tout déplier
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                            onClick={collapseAllGroups}
                                            className="text-[12px] text-[#0879bd] hover:text-[#065a86]"
                                        >
                                            Tout replier
                                        </button>
                                    </div>
                                )}

                                <div className="text-[13px] text-slate-500">
                                    <span className="font-semibold">{filteredPermissions.length}</span> permission(s)
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Liste des permissions */}
                {!selectedRoleId ? (
                    <div className="flex h-64 items-center justify-center rounded border-2 border-dashed border-slate-200 bg-slate-50">
                        <div className="text-center">
                            <ShieldCheck className="mx-auto mb-3 size-12 text-slate-300" />
                            <p className="text-[14px] text-slate-500">
                                Sélectionnez un rôle pour commencer
                            </p>
                        </div>
                    </div>
                ) : isLoadingPermissions ? (
                    <div className="flex h-64 items-center justify-center gap-3 rounded border border-slate-200 bg-white">
                        <Loader2 className="size-5 animate-spin text-[#0879bd]" />
                        <span className="text-[14px] text-slate-500">
                            Chargement des permissions...
                        </span>
                    </div>
                ) : isPermissionsError ? (
                    <div className="flex h-64 items-center justify-center rounded border border-red-200 bg-red-50">
                        <p className="text-[14px] text-red-500">
                            Impossible de charger les permissions.
                        </p>
                    </div>
                ) : permissionGroups.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
                        <p className="text-[14px] text-slate-500">
                            {search ? "Aucune permission ne correspond à votre recherche" : "Aucune permission disponible"}
                        </p>
                    </div>
                ) : viewMode === "grouped" ? (
                    <div className="space-y-4">
                        {permissionGroups.map((group) => {
                            const fullySelected = isGroupFullySelected(group);
                            const partiallySelected = isGroupPartiallySelected(group);
                            const isExpanded = expandedGroups.has(group.module);

                            return (
                                <div
                                    key={group.module}
                                    className="overflow-hidden rounded border border-slate-200 bg-white shadow-none transition-shadow hover:shadow-md"
                                >
                                    {/* En-tête du groupe */}
                                    <div
                                        className="flex cursor-pointer items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4 transition hover:bg-slate-50"
                                        onClick={() => toggleGroup(group.module)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="size-4 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="size-4 text-slate-400" />
                                            )}
                                            <div>
                                                <h3 className="text-[15px] font-semibold uppercase tracking-wide text-slate-900">
                                                    {group.module}
                                                </h3>
                                                <p className="mt-1 text-[12px] text-slate-500">
                                                    {group.permissions.length} permission(s)
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                            {/* Sélecteur partiple/tout */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => selectAllInGroup(group)}
                                                    className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                    disabled={fullySelected}
                                                >
                                                    <CheckSquare className="size-3.5" />
                                                    Tout
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => clearAllInGroup(group)}
                                                    className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                                                >
                                                    <Square className="size-3.5" />
                                                    Rien
                                                </button>
                                            </div>

                                            {/* Indicateur de sélection */}
                                            {(fullySelected || partiallySelected) && (
                                                <div className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${
                                                    fullySelected
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}>
                                                    {fullySelected ? (
                                                        <>
                                                            <CheckSquare className="size-3" />
                                                            Complet
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="font-bold">{group.permissions.filter(p => selectedPermissionIds.includes(p.Id_0)).length}</span>
                                                            <span>/ {group.permissions.length}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contenu du groupe */}
                                    {isExpanded && (
                                        <div className="divide-y divide-slate-100">
                                            {group.permissions.map((permission) => {
                                                const checked = isPermissionSelected(permission.Id_0);

                                                return (
                                                    <label
                                                        key={permission.Id_0}
                                                        className={`group flex cursor-pointer items-start gap-4 px-5 py-4 transition ${
                                                            checked
                                                                ? "bg-[#F3F8FC]"
                                                                : "bg-white hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => togglePermission(permission.Id_0)}
                                                            className="mt-[3px] h-4 w-4 shrink-0 rounded border-slate-300 text-[#0879bd] focus:ring-[#0879bd]"
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[14px] font-semibold text-slate-900">
                                                                {permission.LongCode_10}
                                                            </p>

                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                                    <span className="text-slate-400">Resource:</span>
                                                                    {permission.Description_12}
                                                                </span>

                                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                                    <span className="text-slate-400">Action:</span>
                                                                    {permission.Action_9}
                                                                </span>

                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Vue en liste
                    <div className="overflow-hidden rounded border border-slate-200 bg-white">
                        <div className="divide-y divide-slate-100">
                            {filteredPermissions.map((permission) => {
                                const checked = isPermissionSelected(permission.Id_0);

                                return (
                                    <label
                                        key={permission.Id_0}
                                        className={`group flex cursor-pointer items-start gap-4 px-5 py-4 transition ${
                                            checked
                                                ? "bg-[#F3F8FC]"
                                                : "bg-white hover:bg-slate-50"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => togglePermission(permission.Id_0)}
                                            className="mt-[3px] h-4 w-4 shrink-0 rounded border-slate-300 text-[#0879bd] focus:ring-[#0879bd]"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">
                                                    {permission.Module_7 || "Autres"}
                                                </span>
                                                <p className="text-[14px] font-semibold text-slate-900">
                                                    {permission.LongCode_10}
                                                </p>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                    <span className="text-slate-400">Resource:</span>
                                                    {permission.Resource_8}
                                                </span>

                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                    <span className="text-slate-400">Action:</span>
                                                    {permission.Action_9}
                                                </span>

                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                    <span className="text-slate-400">ID:</span>
                                                    {permission.Id_0}
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* Actions du formulaire */}
            {selectedRoleId && (
                <FormActions
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                    submitLabel={
                        isSyncing
                            ? "Enregistrement en cours..."
                            : "Enregistrer les permissions"
                    }
                    submitDisabled={!selectedRoleId || isSyncing}
                />
            )}
        </>
    );
}
