"use client";

import React, { useEffect, useState } from "react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";

export function LogoSection() {
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (!selectedLogo) {
            setPreviewUrl("");
            return;
        }

        const nextUrl = URL.createObjectURL(selectedLogo);
        setPreviewUrl(nextUrl);

        return () => {
            URL.revokeObjectURL(nextUrl);
        };
    }, [selectedLogo]);

    const handleCancel = () => {
        setSelectedLogo(null);
    };

    const handleSubmit = () => {
        console.log("Logo sauvegardé :", selectedLogo);
    };

    return (
        <>
            <SectionCard title="Logo de l’entreprise">
                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="flex min-h-[180px] items-center justify-center border border-dashed border-slate-300 bg-slate-50">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Aperçu du logo"
                                className="max-h-[140px] max-w-[180px] object-contain"
                            />
                        ) : (
                            <div className="text-center">
                                <p className="text-[14px] font-semibold text-slate-700">
                                    Aucun logo
                                </p>
                                <p className="mt-1 text-[12px] text-slate-500">
                                    JPEG, PNG ou WebP
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[14px] font-semibold text-slate-800">
                                Importer un nouveau logo
                            </p>
                            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-slate-500">
                                Le logo sera affiché dans les documents générés
                                par l’application.
                            </p>
                        </div>

                        <label className="inline-flex cursor-pointer items-center border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50">
                            Choisir un fichier
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) =>
                                    setSelectedLogo(
                                        e.target.files?.[0] ?? null
                                    )
                                }
                            />
                        </label>

                        {selectedLogo && (
                            <p className="text-[13px] text-slate-500">
                                Fichier sélectionné :{" "}
                                <span className="font-medium text-slate-700">
                                    {selectedLogo.name}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel="Enregistrer le logo"
            />
        </>
    );
}
