"use client";

import React, { useState } from "react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";
import { SelectBox } from "@/components/configuration/select-box";

type MemberStatus = "active" | "pending";

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: MemberStatus;
};

type MemberForm = {
    name: string;
    email: string;
    role: string;
};

const INITIAL_MEMBERS: Member[] = [
    {
        id: 1,
        name: "Benjamin Shako",
        email: "benjamin@ikwook.cd",
        role: "Administrateur",
        status: "active",
    },
    {
        id: 2,
        name: "Sarah Kalala",
        email: "sarah@ikwook.cd",
        role: "Comptable",
        status: "active",
    },
    {
        id: 3,
        name: "Junior Mbayo",
        email: "junior@ikwook.cd",
        role: "Gestionnaire",
        status: "pending",
    },
];

const INITIAL_FORM: MemberForm = {
    name: "",
    email: "",
    role: "",
};

const ROLE_OPTIONS = [
    { value: "", label: "Sélectionner un rôle" },
    { value: "Administrateur", label: "Administrateur" },
    { value: "Comptable", label: "Comptable" },
    { value: "Gestionnaire", label: "Gestionnaire" },
];

export function MembersSection() {
    const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
    const [form, setForm] = useState<MemberForm>(INITIAL_FORM);

    const handleCancel = () => {
        setForm(INITIAL_FORM);
    };

    const handleSubmit = () => {
        if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
            return;
        }

        const newMember: Member = {
            id: Date.now(),
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            status: "pending",
        };

        setMembers((prev) => [newMember, ...prev]);
        setForm(INITIAL_FORM);
    };

    const handleRemove = (id: number) => {
        setMembers((prev) => prev.filter((member) => member.id !== id));
    };

    return (
        <>
            <SectionCard title="Ajouter un membre">
                <div className="mb-5">
                    <p className="text-[14px] font-semibold text-slate-800">
                        Inviter un nouveau membre
                    </p>

                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                        Ajoutez une personne à votre espace et attribuez-lui un
                        rôle.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    <InputField
                        label="Nom complet"
                        value={form.name}
                        placeholder="Ex. John Doe"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                name: value,
                            }))
                        }
                    />

                    <InputField
                        label="Adresse email"
                        type="email"
                        value={form.email}
                        placeholder="email@exemple.com"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                email: value,
                            }))
                        }
                    />

                    <SelectBox
                        label="Rôle"
                        value={form.role}
                        options={ROLE_OPTIONS}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                role: value,
                            }))
                        }
                    />
                </div>
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel="Inviter le membre"
                submitDisabled={
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !form.role.trim()
                }
            />

            <SectionCard title="Liste des membres">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse">
                        <thead>
                        <tr className="border-b border-slate-200 text-left">
                            <th className="pb-3 text-[13px] font-semibold text-slate-500">
                                Nom
                            </th>
                            <th className="pb-3 text-[13px] font-semibold text-slate-500">
                                Email
                            </th>
                            <th className="pb-3 text-[13px] font-semibold text-slate-500">
                                Rôle
                            </th>
                            <th className="pb-3 text-[13px] font-semibold text-slate-500">
                                Statut
                            </th>
                            <th className="pb-3 text-right text-[13px] font-semibold text-slate-500">
                                Action
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {members.map((member) => (
                            <tr
                                key={member.id}
                                className="border-b border-slate-100 last:border-b-0"
                            >
                                <td className="py-4 text-[14px] font-medium text-slate-800">
                                    {member.name}
                                </td>

                                <td className="py-4 text-[14px] text-slate-600">
                                    {member.email}
                                </td>

                                <td className="py-4 text-[14px] text-slate-600">
                                    {member.role}
                                </td>

                                <td className="py-4">
                                    <StatusBadge status={member.status} />
                                </td>

                                <td className="py-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemove(member.id)
                                        }
                                        className="h-9 border border-slate-200 px-4 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Retirer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {members.length === 0 && (
                        <div className="py-10 text-center text-[14px] text-slate-500">
                            Aucun membre disponible.
                        </div>
                    )}
                </div>
            </SectionCard>
        </>
    );
}

function StatusBadge({ status }: { status: MemberStatus }) {
    const isActive = status === "active";

    return (
        <span
            className={`inline-flex px-2 py-1 text-[11px] font-semibold ${
                isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
            }`}
        >
            {isActive ? "Actif" : "En attente"}
        </span>
    );
}
