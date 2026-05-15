"use client";

import React, { useState } from "react";
import {
    Laptop,
    Mail,
    Smartphone,
    User,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { ReferentialTauxSection } from "@/components/configuration/referential-taux-section";
import { TaxGroupsSection } from "@/components/configuration/tax-groups-section";

type ConfigMenuId =
    | "basicInfo"
    | "logo"
    | "changePassword"
    | "referentials"
    | "taxGroups"
    | "bank"
    | "members"
    | "roles"
    | "permissions"
    | "language"
    | "modelFactures"


const MENU_IDS: ConfigMenuId[] = [
    "basicInfo",
    "logo",
    "changePassword",
    "referentials",
    "taxGroups",
    "bank",
    "members",
    "roles",
    "permissions",
    "language",
    "modelFactures",
];

type ThemePref = "light" | "dark" | "system";
type LanguagePref = "fr" | "en";
type TimezonePref = "kinshasa" | "lubumbashi" | "goma";

export default function ConfigurationPage() {
    const t = useTranslations("configuration");
    const [activeMenu, setActiveMenu] =
        useState<ConfigMenuId>("basicInfo");

    const [profileForm, setProfileForm] = useState({
        name: "Benjamin Shako",
        email: "hello@ikwook.cd",
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [preferences, setPreferences] = useState({
        theme: "light" as ThemePref,
        language: "fr" as LanguagePref,
        timezone: "kinshasa" as TimezonePref,
    });

    let passwordError = "";
    if (passwordForm.newPassword || passwordForm.confirmPassword) {
        if (passwordForm.newPassword.length < 6) {
            passwordError = t("password.errors.minLength");
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            passwordError = t("password.errors.mismatch");
        }
    }

    const handleSaveProfile = () => {
        console.log("Profil sauvegardé", profileForm);
    };

    const handleChangePassword = () => {
        if (passwordError) return;

        console.log("Mot de passe changé", passwordForm);

        setPasswordForm({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const handleSavePreferences = () => {
        console.log("Préférences sauvegardées", preferences);
    };

    const themeOptions: { value: ThemePref; label: string }[] = [
        { value: "light", label: t("referentials.themeOptions.light") },
        { value: "dark", label: t("referentials.themeOptions.dark") },
        { value: "system", label: t("referentials.themeOptions.system") },
    ];

    const languageOptions: { value: LanguagePref; label: string }[] = [
        { value: "fr", label: t("referentials.languageOptions.fr") },
        { value: "en", label: t("referentials.languageOptions.en") },
    ];

    const timezoneOptions: { value: TimezonePref; label: string }[] = [
        { value: "kinshasa", label: t("referentials.timezoneOptions.kinshasa") },
        { value: "lubumbashi", label: t("referentials.timezoneOptions.lubumbashi") },
        { value: "goma", label: t("referentials.timezoneOptions.goma") },
    ];

    return (
        <main className="min-h-0 bg-white px-6 py-8 text-slate-800">
            <div className="mx-auto w-full">
                <h1 className="mb-8 px-2 text-[28px] font-bold text-slate-900">
                    {t("pageTitle")}
                </h1>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:z-10 lg:w-64 lg:self-start lg:bg-white xl:w-72">
                        <nav className="space-y-1 border border-slate-100 lg:border-0">
                            {MENU_IDS.map((id) => {
                                const isActive = activeMenu === id;

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setActiveMenu(id)}
                                        className={`block w-full px-2 py-3 text-left text-[15px] font-medium cursor-pointer ${
                                            isActive
                                                ? "font-bold bg-[#0073C5] text-white"
                                                : "text-slate-500 hover:text-slate-800"
                                        }`}
                                    >
                                        {t(`menu.${id}`)}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="min-h-0 w-full flex-1 space-y-5 overflow-y-auto lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto lg:pb-10 lg:pr-2">
                        {activeMenu === "basicInfo" && (
                            <>
                                <div className="border border-slate-200 bg-white">
                                    <div className="border-b border-slate-200 px-5 py-4">
                                        <h2 className="text-[16px] font-semibold">
                                            {t("basicInfo.sectionTitle")}
                                        </h2>
                                    </div>

                                    <div className="px-5 py-5">
                                        <div className="mb-5 flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center bg-slate-100">
                                                <User className="h-6 w-6 text-slate-500" />
                                            </div>

                                            <button className="border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50">
                                                {t("basicInfo.changePhoto")}
                                            </button>
                                        </div>

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-[13px] font-medium">
                                                    {t("basicInfo.name")}
                                                </label>
                                                <input
                                                    value={profileForm.name}
                                                    onChange={(e) =>
                                                        setProfileForm((prev) => ({
                                                            ...prev,
                                                            name: e.target.value,
                                                        }))
                                                    }
                                                    className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-[13px] font-medium">
                                                    {t("basicInfo.email")}
                                                </label>
                                                <input
                                                    value={profileForm.email}
                                                    onChange={(e) =>
                                                        setProfileForm((prev) => ({
                                                            ...prev,
                                                            email: e.target.value,
                                                        }))
                                                    }
                                                    className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="h-11 bg-[#0073C5] px-8 text-[14px] font-semibold text-white hover:bg-[#005999]"
                                    >
                                        {t("basicInfo.saveChanges")}
                                    </button>
                                </div>
                            </>
                        )}

                        {activeMenu === "changePassword" && (
                            <>
                                <div className="border border-slate-200 bg-white">
                                    <div className="border-b border-slate-200 px-5 py-4">
                                        <h2 className="text-[16px] font-semibold">
                                            {t("password.sectionTitle")}
                                        </h2>
                                    </div>

                                    <div className="grid gap-5 px-5 py-5 md:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium">
                                                {t("password.oldPassword")}
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.oldPassword}
                                                onChange={(e) =>
                                                    setPasswordForm((prev) => ({
                                                        ...prev,
                                                        oldPassword: e.target.value,
                                                    }))
                                                }
                                                placeholder={t("password.placeholder")}
                                                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium">
                                                {t("password.newPassword")}
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) =>
                                                    setPasswordForm((prev) => ({
                                                        ...prev,
                                                        newPassword: e.target.value,
                                                    }))
                                                }
                                                placeholder={t("password.placeholder")}
                                                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium">
                                                {t("password.confirmPassword")}
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) =>
                                                    setPasswordForm((prev) => ({
                                                        ...prev,
                                                        confirmPassword: e.target.value,
                                                    }))
                                                }
                                                placeholder={t("password.placeholder")}
                                                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                            />
                                        </div>
                                    </div>

                                    {passwordError && (
                                        <p className="px-5 pb-5 text-[13px] font-medium text-red-500">
                                            {passwordError}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={!!passwordError}
                                        className="h-11 bg-[#0073C5] px-8 text-[14px] font-semibold text-white hover:bg-[#005999] disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                        {t("password.submit")}
                                    </button>
                                </div>
                            </>
                        )}

                        {activeMenu === "referentials" && (
                            <>
                                <div className="border border-slate-200 bg-white">
                                    <div className="border-b border-slate-200 px-5 py-4">
                                        <h2 className="text-[16px] font-semibold">
                                            {t("referentials.preferencesTitle")}
                                        </h2>
                                    </div>

                                    <div className="grid gap-5 px-5 py-5 md:grid-cols-3">
                                        <SelectBox
                                            label={t("referentials.theme")}
                                            value={preferences.theme}
                                            options={themeOptions}
                                            onChange={(value) =>
                                                setPreferences((prev) => ({
                                                    ...prev,
                                                    theme: value as ThemePref,
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
                                                    language: value as LanguagePref,
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
                                                    timezone: value as TimezonePref,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <ReferentialTauxSection />

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="border border-slate-200 bg-white">
                                        <div className="border-b border-slate-200 px-5 py-4">
                                            <h2 className="text-[16px] font-semibold">
                                                {t("referentials.connectedAccounts")}
                                            </h2>
                                        </div>

                                        <div className="space-y-4 px-5 py-5">
                                            <ConnectedAccount
                                                disconnectLabel={t("referentials.disconnect")}
                                                icon={<Mail className="h-5 w-5 text-red-500" />}
                                                title={t("referentials.google")}
                                                subtitle={t("referentials.connectedWith", {
                                                    email: "benjamin@gmail.com",
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 bg-white">
                                        <div className="border-b border-slate-200 px-5 py-4">
                                            <h2 className="text-[16px] font-semibold">
                                                {t("referentials.devices")}
                                            </h2>
                                        </div>

                                        <div className="space-y-4 px-5 py-5">
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
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSavePreferences}
                                        className="h-11 bg-[#0073C5] px-8 text-[14px] font-semibold text-white hover:bg-[#005999]"
                                    >
                                        {t("referentials.savePreferences")}
                                    </button>
                                </div>
                            </>
                        )}

                        {activeMenu === "taxGroups" && (
                            <TaxGroupsSection />
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

function SelectBox<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    return (
        <div>
            <label className="mb-1 block text-[13px] font-medium">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="h-11 w-full border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
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
