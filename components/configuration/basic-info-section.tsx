"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";

export function BasicInfoSection() {
    const t = useTranslations("configuration");

    const initialForm = {
        name: "Benjamin Shako",
        email: "hello@ikwook.cd",
    };

    const [form, setForm] = useState(initialForm);

    const handleCancel = () => {
        setForm(initialForm);
    };

    const handleSubmit = () => {
        console.log("Informations de base sauvegardées :", form);
    };

    return (
        <>
            <SectionCard title={t("basicInfo.sectionTitle")}>
                <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-slate-100">
                        <User className="h-6 w-6 text-slate-500" />
                    </div>

                    <button className="border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50">
                        {t("basicInfo.changePhoto")}
                    </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                        label={t("basicInfo.name")}
                        value={form.name}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                name: value,
                            }))
                        }
                    />

                    <InputField
                        label={t("basicInfo.email")}
                        value={form.email}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                email: value,
                            }))
                        }
                    />
                </div>
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel={t("basicInfo.saveChanges")}
            />
        </>
    );
}
