"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";

export function ChangePasswordSection() {
    const t = useTranslations("configuration");

    const initialForm = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    };

    const [form, setForm] = useState(initialForm);

    let passwordError = "";

    if (form.newPassword || form.confirmPassword) {
        if (form.newPassword.length < 6) {
            passwordError = t("password.errors.minLength");
        } else if (form.newPassword !== form.confirmPassword) {
            passwordError = t("password.errors.mismatch");
        }
    }

    const handleCancel = () => {
        setForm(initialForm);
    };

    const handleSubmit = () => {
        if (passwordError) return;

        console.log("Mot de passe modifié :", form);

        setForm(initialForm);
    };

    return (
        <>
            <SectionCard title={t("password.sectionTitle")}>
                <div className="grid gap-5 md:grid-cols-3">
                    <InputField
                        type="password"
                        label={t("password.oldPassword")}
                        value={form.oldPassword}
                        placeholder={t("password.placeholder")}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                oldPassword: value,
                            }))
                        }
                    />

                    <InputField
                        type="password"
                        label={t("password.newPassword")}
                        value={form.newPassword}
                        placeholder={t("password.placeholder")}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                newPassword: value,
                            }))
                        }
                    />

                    <InputField
                        type="password"
                        label={t("password.confirmPassword")}
                        value={form.confirmPassword}
                        placeholder={t("password.placeholder")}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                confirmPassword: value,
                            }))
                        }
                    />
                </div>

                {passwordError && (
                    <p className="mt-5 text-[13px] font-medium text-red-500">
                        {passwordError}
                    </p>
                )}
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel={t("password.submit")}
                submitDisabled={!!passwordError}
            />
        </>
    );
}
