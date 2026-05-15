"use client";

import React, { useState } from "react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";

type LanguageValue = "fr" | "en" | "ln";

type LanguageOption = {
    value: LanguageValue;
    label: string;
    description: string;
};

const LANGUAGES: LanguageOption[] = [
    {
        value: "fr",
        label: "Français",
        description: "Langue principale utilisée dans l’interface.",
    },
    {
        value: "en",
        label: "English",
        description: "Use English as the default application language.",
    },
    {
        value: "ln",
        label: "Lingala",
        description: "Salela Lingala lokola lokota ya liboso.",
    },
];

export function LanguageSection() {
    const [defaultLanguage, setDefaultLanguage] =
        useState<LanguageValue>("fr");

    const handleCancel = () => {
        setDefaultLanguage("fr");
    };

    const handleSubmit = () => {
        console.log("Langue enregistrée :", defaultLanguage);
    };

    return (
        <>
            <SectionCard title="Langue par défaut">
                <div className="mb-5">
                    <p className="text-[14px] font-semibold text-slate-800">
                        Choisir la langue principale
                    </p>

                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                        Cette langue sera utilisée par défaut dans l’interface
                        et certains documents générés.
                    </p>
                </div>

                <div className="space-y-4">
                    {LANGUAGES.map((language) => {
                        const isActive =
                            defaultLanguage === language.value;

                        return (
                            <button
                                key={language.value}
                                type="button"
                                onClick={() =>
                                    setDefaultLanguage(language.value)
                                }
                                className={`flex w-full items-center justify-between border px-4 py-4 text-left transition ${
                                    isActive
                                        ? "border-[#0073C5] bg-[#eef7fc]"
                                        : "border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <div>
                                    <p className="text-[14px] font-semibold text-slate-900">
                                        {language.label}
                                    </p>

                                    <p className="mt-1 text-[13px] text-slate-500">
                                        {language.description}
                                    </p>
                                </div>

                                <span
                                    className={`h-4 w-4 border ${
                                        isActive
                                            ? "border-[#0073C5] bg-[#0073C5]"
                                            : "border-slate-300 bg-white"
                                    }`}
                                />
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel="Enregistrer la langue"
            />
        </>
    );
}
