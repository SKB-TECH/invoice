"use client";

import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";
import {
    useAuthProfile,
    useUpdateProfile,
} from "@/core/hooks/auth/useAuthQuery";
import type { AuthProfileData } from "@/core/types/auth";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

function profileToForm(p: AuthProfileData) {
    return {
        firstname: (p.firstname ?? "").trim(),
        lastname: (p.lastname ?? "").trim(),
        email: (p.email ?? "").trim(),
        phone: (p.phone ?? "").trim(),
        userType: (p.userType ?? "").trim(),
    };
}

type FormState = ReturnType<typeof profileToForm>;

function formatUserTypeLabel(t: (key: string) => string, raw: string) {
    const v = raw.trim();
    if (!v) return "—";
    switch (v) {
        case "personal":
            return t("basicInfo.userTypes.personal");
        case "pme":
            return t("basicInfo.userTypes.pme");
        case "corporate":
            return t("basicInfo.userTypes.corporate");
        default:
            return v;
    }
}

function BasicInfoLoaded({
    profile,
}: {
    profile: AuthProfileData;
}) {
    const t = useTranslations("configuration");
    const locale = useLocale();

    const initial = profileToForm(profile);
    const [form, setForm] = useState<FormState>(initial);
    const snapshotRef = useRef<FormState>(initial);
    const [isEditing, setIsEditing] = useState(false);

    const updateMutation = useUpdateProfile();

    const apiLanguage =
        profile.language?.trim() ||
        (locale === "ln" ? "ln" : locale === "en" ? "en" : "fr");

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setForm(snapshotRef.current);
        setIsEditing(false);
    };

    const handleSubmit = () => {
        const firstname = form.firstname.trim();
        const lastname = form.lastname.trim();
        const phone = form.phone.trim();

        if (!firstname || !lastname || !phone) {
            toast.error(t("basicInfo.errors.required"));
            return;
        }

        updateMutation.mutate(
            {
                firstname,
                lastname,
                phone,
                language: apiLanguage,
            },
            {
                onSuccess: (updated) => {
                    toast.success(t("basicInfo.saveSuccess"));
                    const next =
                        updated !== null
                            ? profileToForm(updated)
                            : {
                                  ...form,
                                  email: form.email,
                                  userType: form.userType,
                              };
                    snapshotRef.current = next;
                    setForm(next);
                    setIsEditing(false);
                },
                onError: (err: unknown) => {
                    toast.error(
                        getAxiosErrorMessage(err, t("basicInfo.saveError")),
                    );
                },
            },
        );
    };

    return (
        <>
            <SectionCard title={t("basicInfo.sectionTitle")}>
                {!isEditing ? (
                    <div className="mb-4 flex justify-end">
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            className="border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50"
                        >
                            {t("basicInfo.edit")}
                        </button>
                    </div>
                ) : null}

                <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                        label={t("basicInfo.firstname")}
                        value={form.firstname}
                        readonlyMuted={!isEditing}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                firstname: value,
                            }))
                        }
                    />

                    <InputField
                        label={t("basicInfo.lastname")}
                        value={form.lastname}
                        readonlyMuted={!isEditing}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                lastname: value,
                            }))
                        }
                    />

                    <InputField
                        label={t("basicInfo.email")}
                        type="email"
                        value={form.email}
                        readonlyMuted
                        onChange={() => {}}
                    />

                    <InputField
                        label={t("basicInfo.phone")}
                        type="tel"
                        value={form.phone}
                        readonlyMuted={!isEditing}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                phone: value,
                            }))
                        }
                    />

                    <div className="md:col-span-2">
                        <InputField
                            label={t("basicInfo.userType")}
                            value={formatUserTypeLabel(t, form.userType)}
                            readonlyMuted
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </SectionCard>

            {isEditing ? (
                <FormActions
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                    cancelLabel={t("basicInfo.cancel")}
                    submitLabel={
                        updateMutation.isPending
                            ? t("basicInfo.submitting")
                            : t("basicInfo.saveChanges")
                    }
                    submitDisabled={updateMutation.isPending}
                />
            ) : null}
        </>
    );
}

export function BasicInfoSection() {
    const t = useTranslations("configuration");

    const { data, isPending, isError, refetch, dataUpdatedAt } =
        useAuthProfile();

    if (isPending) {
        return (
            <SectionCard title={t("basicInfo.sectionTitle")}>
                <div className="flex min-h-[120px] items-center justify-center gap-2 text-[14px] text-slate-500">
                    <Loader2 className="size-5 animate-spin" />
                    {t("basicInfo.loading")}
                </div>
            </SectionCard>
        );
    }

    if (isError || !data) {
        return (
            <SectionCard title={t("basicInfo.sectionTitle")}>
                <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 text-center">
                    <p className="text-[14px] text-red-600">
                        {t("basicInfo.loadError")}
                    </p>
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50"
                    >
                        {t("basicInfo.retry")}
                    </button>
                </div>
            </SectionCard>
        );
    }

    return (
        <BasicInfoLoaded
            key={dataUpdatedAt}
            profile={data}
        />
    );
}
