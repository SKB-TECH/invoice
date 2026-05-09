"use client";

import React, { useMemo, useState } from "react";
import {
    Laptop,
    Mail,
    Smartphone,
    User,
} from "lucide-react";

import { ReferentialTauxSection } from "@/components/configuration/referential-taux-section";
import { TaxGroupsSection } from "@/components/configuration/tax-groups-section";

type MenuItem =
    | "Informations de base"
    | "Changer mot de passe"
    | "Référencielles"
    | "Groupe de taxations";


const menuItems: MenuItem[] = [
    "Informations de base",
    "Changer mot de passe",
    "Référencielles",
    "Groupe de taxations",
];

export default function ConfigurationPage() {
    const [activeMenu, setActiveMenu] =
        useState<MenuItem>("Informations de base");

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
        theme: "Mode clair",
        language: "Français",
        timezone: "Kinshasa",
    });

    const passwordError = useMemo(() => {
        if (!passwordForm.newPassword && !passwordForm.confirmPassword) return "";
        if (passwordForm.newPassword.length < 6) {
            return "Le nouveau mot de passe doit contenir au moins 6 caractères.";
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return "Les mots de passe ne correspondent pas.";
        }
        return "";
    }, [passwordForm]);

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

    return (
        <main className="min-h-0 bg-white px-6 py-8 text-slate-800">
            <div className="mx-auto w-full">
                <h1 className="mb-8 text-[28px] font-bold text-slate-900">
                    Configuration
                </h1>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:z-10 lg:w-64 lg:self-start lg:bg-white xl:w-72">
                        <nav className="space-y-1 border border-slate-100 lg:border-0">
                            {menuItems.map((item) => {
                                const isActive = activeMenu === item;

                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setActiveMenu(item)}
                                        className={`block w-full px-4 py-3 text-left text-[15px] font-medium cursor-pointer ${
                                            isActive
                                                ? "font-bold bg-[#0073C5] text-white"
                                                : "text-slate-500 hover:text-slate-800"
                                        }`}
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="min-h-0 w-full flex-1 space-y-5 overflow-y-auto lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto lg:pb-10 lg:pr-2">
                        {activeMenu === "Informations de base" && (
                            <>
                                <div className="border border-slate-200 bg-white">
                                    <div className="border-b border-slate-200 px-5 py-4">
                                        <h2 className="text-[16px] font-semibold">
                                            Informations de base
                                        </h2>
                                    </div>

                                    <div className="px-5 py-5">
                                        <div className="mb-5 flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center bg-slate-100">
                                                <User className="h-6 w-6 text-slate-500" />
                                            </div>

                                            <button className="border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50">
                                                Changer
                                            </button>
                                        </div>

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-[13px] font-medium">
                                                    Nom
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
                                                    Email
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
                                        Enregistrer les modifications
                                    </button>
                                </div>
                            </>
                        )}

                        {activeMenu === "Changer mot de passe" && (
                            <>
                                <div className="border border-slate-200 bg-white">
                                    <div className="border-b border-slate-200 px-5 py-4">
                                        <h2 className="text-[16px] font-semibold">
                                            Changer mot de passe
                                        </h2>
                                    </div>

                                    <div className="grid gap-5 px-5 py-5 md:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium">
                                                Ancien mot de passe
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
                                                placeholder="Entrer votre mot de passe"
                                                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium">
                                                Nouveau mot de passe
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
                                                placeholder="Entrer votre mot de passe"
                                                className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium">
                                                Confirmer le mot de passe
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
                                                placeholder="Entrer votre mot de passe"
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
                                        Modifier le mot de passe
                                    </button>
                                </div>
                            </>
                        )}

                        {activeMenu === "Référencielles" && (
                            <>
                                <div className="border border-slate-200 bg-white">
                                    <div className="border-b border-slate-200 px-5 py-4">
                                        <h2 className="text-[16px] font-semibold">
                                            Préférences
                                        </h2>
                                    </div>

                                    <div className="grid gap-5 px-5 py-5 md:grid-cols-3">
                                        <SelectBox
                                            label="Thème"
                                            value={preferences.theme}
                                            options={["Mode clair", "Mode sombre", "Système"]}
                                            onChange={(value) =>
                                                setPreferences((prev) => ({
                                                    ...prev,
                                                    theme: value,
                                                }))
                                            }
                                        />

                                        <SelectBox
                                            label="Langue"
                                            value={preferences.language}
                                            options={["Français", "English"]}
                                            onChange={(value) =>
                                                setPreferences((prev) => ({
                                                    ...prev,
                                                    language: value,
                                                }))
                                            }
                                        />

                                        <SelectBox
                                            label="Fuseau horaire"
                                            value={preferences.timezone}
                                            options={["Kinshasa", "Lubumbashi", "Goma"]}
                                            onChange={(value) =>
                                                setPreferences((prev) => ({
                                                    ...prev,
                                                    timezone: value,
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
                                                Comptes connectés
                                            </h2>
                                        </div>

                                        <div className="space-y-4 px-5 py-5">
                                            <ConnectedAccount
                                                icon={<Mail className="h-5 w-5 text-red-500" />}
                                                title="Google"
                                                subtitle="Connecté avec benjamin@gmail.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 bg-white">
                                        <div className="border-b border-slate-200 px-5 py-4">
                                            <h2 className="text-[16px] font-semibold">
                                                Appareils
                                            </h2>
                                        </div>

                                        <div className="space-y-4 px-5 py-5">
                                            <Device
                                                icon={<Smartphone className="h-5 w-5" />}
                                                title="iPhone 14 Pro"
                                                subtitle="Dernière utilisation il y a 2 jours"
                                            />

                                            <Device
                                                icon={<Laptop className="h-5 w-5" />}
                                                title="MacBook Pro"
                                                subtitle="Dernière utilisation il y a 1 semaine"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSavePreferences}
                                        className="h-11 bg-[#0073C5] px-8 text-[14px] font-semibold text-white hover:bg-[#005999]"
                                    >
                                        Enregistrer les préférences
                                    </button>
                                </div>
                            </>
                        )}

                        {activeMenu === "Groupe de taxations" && (
                            <TaxGroupsSection />
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

function SelectBox({
                       label,
                       value,
                       options,
                       onChange,
                   }: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="mb-1 block text-[13px] font-medium">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 w-full border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
            >
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}

function ConnectedAccount({
                              icon,
                              title,
                              subtitle,
                          }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
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
                Déconnecter
            </button>
        </div>
    );
}

function Device({
                    icon,
                    title,
                    subtitle,
                }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
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
                Retirer
            </button>
        </div>
    );
}
