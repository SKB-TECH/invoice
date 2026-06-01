"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { useAuthProfile } from "@/core/hooks/auth/useAuthQuery";
import { useUploadAvatar } from "@/core/hooks/auth/useUploadAvatar";
import type { AuthProfileData } from "@/core/types/auth";
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

function LogoSectionSkeleton() {
    const t = useTranslations("configuration");

    return (
        <SectionCard title={t("logo.sectionTitle")}>
            <div
                role="status"
                aria-busy="true"
                aria-label={t("basicInfo.loading")}
                className="grid animate-pulse gap-6 lg:grid-cols-[220px_1fr]"
            >
                <div className="min-h-[180px] border border-dashed border-slate-200 bg-slate-100" />
                <div className="space-y-4">
                    <div className="h-5 w-48 rounded bg-slate-200/90" />
                    <div className="h-12 w-full max-w-xl rounded bg-slate-200/90" />
                    <div className="h-9 w-36 rounded bg-slate-200/90" />
                </div>
            </div>
        </SectionCard>
    );
}

function LogoPreview({
    src,
    alt,
    noLogoLabel,
    formatsHint,
}: {
    src: string | null;
    alt: string;
    noLogoLabel: string;
    formatsHint: string;
}) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-700">
                    {noLogoLabel}
                </p>
                <p className="mt-1 text-[12px] text-slate-500">{formatsHint}</p>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="max-h-[140px] max-w-[180px] object-contain"
            onError={() => setFailed(true)}
        />
    );
}

function LogoSectionLoaded({ profile }: { profile: AuthProfileData }) {
    const t = useTranslations("configuration.logo");
    const uploadMutation = useUploadAvatar();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);

    const isEditing = selectedLogo !== null;

    const previewObjectUrl = useMemo(() => {
        if (!selectedLogo) return null;
        return URL.createObjectURL(selectedLogo);
    }, [selectedLogo]);

    useEffect(() => {
        return () => {
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        };
    }, [previewObjectUrl]);

    const existingSrc = resolvePublicFileUrl(profile.avatar ?? undefined);

    const displaySrc =
        previewObjectUrl ??
        (existingSrc && existingSrc !== "" ? existingSrc : null);

    const resetFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePickFile = (file: File | null) => {
        resetFileInput();
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
        resetFileInput();
        setSelectedLogo(null);
    };

    const handleSubmit = () => {
        if (!selectedLogo || uploadMutation.isPending) return;

        uploadMutation.mutate(selectedLogo, {
            onSuccess: () => {
                toast.success(t("toastSaved"));
                resetFileInput();
                setSelectedLogo(null);
            },
            onError: (err: unknown) => {
                toast.error(getAxiosErrorMessage(err, t("toastError")));
            },
        });
    };

    return (
        <>
            <SectionCard title={t("sectionTitle")}>
                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="flex min-h-[180px] items-center justify-center border border-dashed border-slate-300 bg-slate-50">
                        <LogoPreview
                            key={displaySrc ?? "empty"}
                            src={displaySrc}
                            alt={t("previewAlt")}
                            noLogoLabel={t("noLogo")}
                            formatsHint={t("formatsHint")}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[14px] font-semibold text-slate-800">
                                {isEditing ? t("introTitle") : t("currentLogoTitle")}
                            </p>
                            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-slate-500">
                                {isEditing ? t("introBody") : t("currentLogoBody")}{" "}
                                <span className="text-slate-600">
                                    {t("formatsHint")}
                                </span>
                            </p>
                        </div>

                        <label className="inline-flex cursor-pointer items-center border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50">
                            {isEditing ? t("chooseFile") : t("changeLogo")}
                            <input
                                ref={fileInputRef}
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

            {isEditing ? (
                <FormActions
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                    cancelLabel={t("cancel")}
                    submitLabel={
                        uploadMutation.isPending ? t("saving") : t("save")
                    }
                    submitDisabled={uploadMutation.isPending}
                />
            ) : null}
        </>
    );
}

export function LogoSection() {
    const t = useTranslations("configuration");

    const { data, isPending, isError, refetch, dataUpdatedAt } =
        useAuthProfile();

    if (isPending) {
        return <LogoSectionSkeleton />;
    }

    if (isError || !data) {
        return (
            <SectionCard title={t("logo.sectionTitle")}>
                <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 text-center">
                    <p className="text-[14px] text-red-600">
                        {t("basicInfo.loadError")}
                    </p>
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="border border-slate-200 px-4 py-2 text-[13px] font-medium hover:bg-slate-50"
                    >
                        {t("basicInfo.retry")}
                    </button>
                </div>
            </SectionCard>
        );
    }

    return (
        <LogoSectionLoaded key={dataUpdatedAt} profile={data} />
    );
}
