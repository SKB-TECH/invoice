"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";
import { useChangePassword } from "@/core/hooks/auth/useAuthQuery";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

export function ChangePasswordSection() {
    const t = useTranslations("configuration");

    const initialForm = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    };

    const [form, setForm] = useState(initialForm);

    const passwordMutation = useChangePassword();

    let passwordError = "";

    if (form.newPassword || form.confirmPassword) {
        if (!form.oldPassword.trim()) {
            passwordError = t("password.errors.oldRequired");
        } else if (form.newPassword.length < 6) {
            passwordError = t("password.errors.minLength");
        } else if (form.newPassword !== form.confirmPassword) {
            passwordError = t("password.errors.mismatch");
        }
    }

    const incomplete =
        !form.oldPassword.trim() ||
        !form.newPassword ||
        !form.confirmPassword;

    const handleCancel = () => {
        setForm(initialForm);
    };

    const handleSubmit = () => {
        if (passwordError || incomplete || passwordMutation.isPending) return;

        passwordMutation.mutate(
            {
                current_password: form.oldPassword.trim(),
                new_password: form.newPassword,
                password_confirm: form.confirmPassword,
            },
            {
                onSuccess: (message) => {
                    toast.success(message || t("password.toastSuccess"));
                    setForm(initialForm);
                },
                onError: (err: unknown) => {
                    toast.error(
                        getAxiosErrorMessage(err, t("password.toastError")),
                    );
                },
            },
        );
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
                        autoComplete="current-password"
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
                        autoComplete="new-password"
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
                        autoComplete="new-password"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                confirmPassword: value,
                            }))
                        }
                    />
                </div>

                {passwordError ? (
                    <p className="mt-5 text-[13px] font-medium text-red-500">
                        {passwordError}
                    </p>
                ) : null}
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel={
                    passwordMutation.isPending
                        ? t("password.submitting")
                        : t("password.submit")
                }
                submitDisabled={
                    !!passwordError ||
                    incomplete ||
                    passwordMutation.isPending
                }
            />
        </>
    );
}
