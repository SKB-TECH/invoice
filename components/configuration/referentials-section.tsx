"use client";

import React, { useState } from "react";
import { Laptop, Mail, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { SelectBox } from "@/components/configuration/select-box";
import { ReferentialTauxSection } from "@/components/configuration/referential-taux-section";

type ThemePref = "light" | "dark" | "system";
type LanguagePref = "fr" | "en" | "ln";
type TimezonePref = "kinshasa" | "lubumbashi" | "goma";

export function ReferentialsSection() {
    const t = useTranslations("configuration");

    const initialPreferences = {
        theme: "light" as ThemePref,
        language: "fr" as LanguagePref,
        timezone: "kinshasa" as TimezonePref,
    };

    const [preferences, setPreferences] = useState(initialPreferences);

    const themeOptions = [
        { value: "light" as ThemePref, label: t("referentials.themeOptions.light") },
        { value: "dark" as ThemePref, label: t("referentials.themeOptions.dark") },
        { value: "system" as ThemePref, label: t("referentials.themeOptions.system") },
    ];

    const languageOptions = [
        { value: "fr" as LanguagePref, label: t("referentials.languageOptions.fr") },
        { value: "en" as LanguagePref, label: t("referentials.languageOptions.en") },
        { value: "ln" as LanguagePref, label: "Lingala" },
    ];

    const timezoneOptions = [
        {
            value: "kinshasa" as TimezonePref,
            label: t("referentials.timezoneOptions.kinshasa"),
        },
        {
            value: "lubumbashi" as TimezonePref,
            label: t("referentials.timezoneOptions.lubumbashi"),
        },
        {
            value: "goma" as TimezonePref,
            label: t("referentials.timezoneOptions.goma"),
        },
    ];

    const handleCancel = () => {
        setPreferences(initialPreferences);
    };

    const handleSubmit = () => {
        console.log("Préférences sauvegardées :", preferences);
    };

    return (
        <>
            <SectionCard title={t("referentials.preferencesTitle")}>
                <div className="grid gap-5 md:grid-cols-3">
                    <SelectBox
                        label={t("referentials.theme")}
                        value={preferences.theme}
                        options={themeOptions}
                        onChange={(value) =>
                            setPreferences((prev) => ({
                                ...prev,
                                theme: value,
                            }))
                        }
                    />

                    <SelectBox
                        label={t("referentials.language")}
                        value={preferences.language}
                        options={languageOptions}
                        onChange={(value) =>
                            setPreferences((prev) => ({
                                ...prev,
                                language: value,
                            }))
                        }
                    />

                    <SelectBox
                        label={t("referentials.timezone")}
                        value={preferences.timezone}
                        options={timezoneOptions}
                        onChange={(value) =>
                            setPreferences((prev) => ({
                                ...prev,
                                timezone: value,
                            }))
                        }
                    />
                </div>
            </SectionCard>

            <ReferentialTauxSection />

            <div className="grid gap-5 md:grid-cols-2">
                <SectionCard title={t("referentials.connectedAccounts")}>
                    <ConnectedAccount
                        disconnectLabel={t("referentials.disconnect")}
                        icon={<Mail className="h-5 w-5 text-red-500" />}
                        title={t("referentials.google")}
                        subtitle={t("referentials.connectedWith", {
                            email: "benjamin@gmail.com",
                        })}
                    />
                </SectionCard>

                <SectionCard title={t("referentials.devices")}>
                    <div className="space-y-4">
                        <Device
                            removeLabel={t("referentials.remove")}
                            icon={<Smartphone className="h-5 w-5" />}
                            title={t("referentials.deviceIphone")}
                            subtitle={t("referentials.lastUsed2Days")}
                        />

                        <Device
                            removeLabel={t("referentials.remove")}
                            icon={<Laptop className="h-5 w-5" />}
                            title={t("referentials.deviceMacbook")}
                            subtitle={t("referentials.lastUsed1Week")}
                        />
                    </div>
                </SectionCard>
            </div>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel={t("referentials.savePreferences")}
            />
        </>
    );
}

function ConnectedAccount({
                              icon,
                              title,
                              subtitle,
                              disconnectLabel,
                          }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    disconnectLabel: string;
}) {
    const [connected, setConnected] = useState(true);

    if (!connected) return null;

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {icon}

                <div>
                    <p className="text-[14px] font-semibold">{title}</p>
                    <p className="text-[12px] text-slate-500">{subtitle}</p>
                </div>
            </div>

            <button
                onClick={() => setConnected(false)}
                className="border border-slate-200 px-3 py-2 text-[12px] font-medium hover:bg-slate-50"
            >
                {disconnectLabel}
            </button>
        </div>
    );
}

function Device({
                    icon,
                    title,
                    subtitle,
                    removeLabel,
                }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    removeLabel: string;
}) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {icon}

                <div>
                    <p className="text-[14px] font-semibold">{title}</p>
                    <p className="text-[12px] text-slate-500">{subtitle}</p>
                </div>
            </div>

            <button
                onClick={() => setVisible(false)}
                className="border border-slate-200 px-3 py-2 text-[12px] font-medium hover:bg-slate-50"
            >
                {removeLabel}
            </button>
        </div>
    );
}
