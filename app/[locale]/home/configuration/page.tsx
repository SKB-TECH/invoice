"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { BasicInfoSection } from "@/components/configuration/basic-info-section";
import { LogoSection } from "@/components/configuration/logo-section";
import { ChangePasswordSection } from "@/components/configuration/change-password-section";
import { ReferentialsSection } from "@/components/configuration/referentials-section";
import { BankInformationSection } from "@/components/configuration/bank-information-section";
import { MembersSection } from "@/components/configuration/members-section";
import { RolesSection } from "@/components/configuration/roles-section";
import { PermissionsSection } from "@/components/configuration/permissions-section";
import { LanguageSection } from "@/components/configuration/language-section";
import { InvoiceModelsSection } from "@/components/configuration/invoice-models-section";

type ConfigMenuId =
    | "basicInfo"
    | "logo"
    | "changePassword"
    | "referentials"
    | "bank"
    | "members"
    | "roles"
    | "permissions"
    | "language"
    | "modelFactures";

const MENU_IDS: ConfigMenuId[] = [
    "basicInfo",
    "logo",
    "changePassword",
    "referentials",
    "bank",
    "members",
    "roles",
    "permissions",
    "language",
    "modelFactures",
];

export default function ConfigurationPage() {
    const t = useTranslations("configuration");
    const [activeMenu, setActiveMenu] =
        useState<ConfigMenuId>("basicInfo");

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
                                        className={`block w-full cursor-pointer px-2 py-3 text-left text-[15px] font-medium ${
                                            isActive
                                                ? "bg-[#0073C5] font-bold text-white"
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
                        {activeMenu === "basicInfo" && <BasicInfoSection />}
                        {activeMenu === "logo" && <LogoSection />}
                        {activeMenu === "changePassword" && (
                            <ChangePasswordSection />
                        )}
                        {activeMenu === "referentials" && (
                            <ReferentialsSection />
                        )}
                        {activeMenu === "bank" && (
                            <BankInformationSection />
                        )}
                        {activeMenu === "members" && <MembersSection />}
                        {activeMenu === "roles" && <RolesSection />}
                        {activeMenu === "permissions" && (
                            <PermissionsSection />
                        )}
                        {activeMenu === "language" && <LanguageSection />}
                        {activeMenu === "modelFactures" && (
                            <InvoiceModelsSection />
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
