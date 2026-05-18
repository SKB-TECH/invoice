"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { useAuth } from "@/context/AuthContext";
import { useUploadAvatar } from "@/core/hooks/auth/useUploadAvatar";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";
import { resolvePublicFileUrl } from "@/core/utils/resolvePublicFileUrl";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function isAllowedImage(file: File): boolean {
    if (file.type && ALLOWED_MIME.has(file.type)) return true;
    const lower = file.name.toLowerCase();
    return (
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png") ||
        lower.endsWith(".webp")
    );
}

export function LogoSection() {
    const t = useTranslations("configuration.logo");
    const { user, profile } = useAuth();
    const uploadMutation = useUploadAvatar();

    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);

    const previewObjectUrl = useMemo(() => {
        if (!selectedLogo) return null;
        return URL.createObjectURL(selectedLogo);
    }, [selectedLogo]);

    useEffect(() => {
        return () => {
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        };
    }, [previewObjectUrl]);

    const profilePhoto =
        profile &&
        typeof profile === "object" &&
        "Photo_16" in profile &&
        typeof (profile as { Photo_16?: unknown }).Photo_16 === "string"
            ? ((profile as { Photo_16: string }).Photo_16 as string)
            : null;

    const existingSrc = resolvePublicFileUrl(
        user?.photo ?? profilePhoto ?? undefined,
    );

    const displaySrc =
        previewObjectUrl ?? (existingSrc && existingSrc !== "" ? existingSrc : null);

    const handlePickFile = (file: File | null) => {
        setSelectedLogo(null);

        if (!file) return;

        if (!isAllowedImage(file)) {
            toast.error(t("invalidFormat"));
            return;
        }

        if (file.size > MAX_BYTES) {
            toast.error(t("fileTooLarge"));
            return;
        }

        setSelectedLogo(file);
    };

    const handleCancel = () => {
        setSelectedLogo(null);
    };

    const handleSubmit = () => {
        if (!selectedLogo || uploadMutation.isPending) return;

        uploadMutation.mutate(selectedLogo, {
            onSuccess: () => {
                toast.success(t("toastSaved"));
                setSelectedLogo(null);
            },
            onError: (err: unknown) => {
                toast.error(
                    getAxiosErrorMessage(err, t("toastError")),
                );
            },
        });
    };

    return (
        <>
            <SectionCard title={t("sectionTitle")}>
                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="flex min-h-[180px] items-center justify-center border border-dashed border-slate-300 bg-slate-50">
                        {displaySrc ? (
                            
                            <img
                                src={displaySrc}
                                alt={t("previewAlt")}
                                className="max-h-[140px] max-w-[180px] object-contain"
                            />
                        ) : (
                            <div className="text-center">
                                <p className="text-[14px] font-semibold text-slate-700">
                                    {t("noLogo")}
                                </p>
                                <p className="mt-1 text-[12px] text-slate-500">
                                    {t("formatsHint")}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[14px] font-semibold text-slate-800">
                                {t("introTitle")}
                            </p>
                            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-slate-500">
                                {t("introBody")}{" "}
                                <span className="text-slate-600">
                                    {t("formatsHint")}
                                </span>
                            </p>
                        </div>

                        <label className="inline-flex cursor-pointer items-center border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50">
                            {t("chooseFile")}
                            <input
                                type="file"
                                accept={ACCEPT}
                                className="hidden"
                                disabled={uploadMutation.isPending}
                                onChange={(e) =>
                                    handlePickFile(e.target.files?.[0] ?? null)
                                }
                            />
                        </label>

                        {selectedLogo ? (
                            <p className="text-[13px] text-slate-500">
                                {t("selectedFile")}{" "}
                                <span className="font-medium text-slate-700">
                                    {selectedLogo.name}
                                </span>
                            </p>
                        ) : null}
                    </div>
                </div>
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={() => {
                    if (!selectedLogo) {
                        toast.error(t("noFileSelected"));
                        return;
                    }
                    handleSubmit();
                }}
                cancelLabel={t("cancel")}
                submitLabel={
                    uploadMutation.isPending ? t("saving") : t("save")
                }
                submitDisabled={uploadMutation.isPending || !selectedLogo}
            />
        </>
    );
}
