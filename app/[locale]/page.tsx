"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { z } from "zod";

import Loader from "@/components/loader/Loader";
import { useAuth } from "@/context/AuthContext";

type FormValues = {
    identifier: string;
    password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function getApiErrorMessage(error: unknown): string {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Une erreur est survenue lors de la connexion.";
}

export default function LoginPage() {
    const router = useRouter();
    const t = useTranslations("login");
    const { login } = useAuth();

    const [form, setForm] = useState<FormValues>({
        identifier: "",
        password: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [apiErrorMessage, setApiErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createLoginSchema = () =>
        z.object({
            identifier: z
                .string()
                .trim()
                .min(1, t("validation.identifierRequired")),

            password: z
                .string()
                .min(1, t("validation.passwordRequired")),
        });

    const handleChange = (key: keyof FormValues, value: string) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));

        if (errors[key]) {
            setErrors((prev) => ({
                ...prev,
                [key]: "",
            }));
        }

        if (apiErrorMessage) {
            setApiErrorMessage("");
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const schema = createLoginSchema();
        const result = schema.safeParse(form);

        if (!result.success) {
            const nextErrors: FormErrors = {};

            result.error.issues.forEach((issue) => {
                const key = issue.path[0] as keyof FormValues | undefined;

                if (key && !nextErrors[key]) {
                    nextErrors[key] = issue.message;
                }
            });

            setErrors(nextErrors);
            return;
        }

        try {
            setErrors({});
            setApiErrorMessage("");
            setIsSubmitting(true);

            await login(
                result.data.identifier.trim(),
                result.data.password
            );

            router.replace("/home");
        } catch (error) {
            setApiErrorMessage(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
        }
    };

    return (
        <>
            {isSubmitting ? (
                <Loader variant="overlay" text={t("loading")} />
            ) : null}

            <div className="flex min-h-screen w-full flex-col bg-[#f5f6f8] lg:flex-row">
                <div className="flex min-h-[38vh] w-full items-center justify-center bg-[#1f6a9a] px-6 py-10 lg:min-h-screen lg:w-1/2">
                    <div className="flex flex-col items-center text-center text-white">
                        <Image
                            src="/imglogin.png"
                            alt={t("illustrationAlt")}
                            width={460}
                            height={460}
                            priority
                            className="h-auto w-[260px] sm:w-[340px] lg:w-[460px]"
                        />

                        <p className="mt-4 max-w-[300px] text-xs leading-relaxed text-white/90 sm:text-sm">
                            {t("description")}
                        </p>

                        <div className="mt-4 flex gap-2">
                            <span className="h-2 w-2 bg-white/40" />
                            <span className="h-2 w-2 bg-white" />
                            <span className="h-2 w-2 bg-white/40" />
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16">
                    <div className="w-full max-w-[500px]">
                        <div className="mb-6 flex justify-start">
                            <Image
                                src="/favi.png"
                                alt={t("logoAlt")}
                                width={60}
                                height={60}
                            />
                        </div>

                        <h2 className="mb-6 text-left text-lg font-semibold text-slate-700 sm:text-xl">
                            {t("title")}
                        </h2>

                        {apiErrorMessage ? (
                            <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {apiErrorMessage}
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-5 sm:gap-6">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600 sm:text-sm">
                                    {t("identifier")}
                                </label>

                                <input
                                    type="text"
                                    value={form.identifier}
                                    onChange={(e) =>
                                        handleChange(
                                            "identifier",
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={handleKeyDown}
                                    disabled={isSubmitting}
                                    placeholder={t("identifierPlaceholder")}
                                    autoComplete="username"
                                    className="h-12 w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100 sm:text-base"
                                />

                                {errors.identifier ? (
                                    <p className="mt-1 text-[12px] text-red-600">
                                        {errors.identifier}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600 sm:text-sm">
                                    {t("password")}
                                </label>

                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) =>
                                        handleChange(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={handleKeyDown}
                                    disabled={isSubmitting}
                                    placeholder={t("passwordPlaceholder")}
                                    autoComplete="current-password"
                                    className="h-12 w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100 sm:text-base"
                                />

                                {errors.password ? (
                                    <p className="mt-1 text-[12px] text-red-600">
                                        {errors.password}
                                    </p>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                className="mt-2 h-12 bg-[#1f6a9a] py-2 text-sm font-medium text-white hover:bg-[#18587f] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                                onClick={handleSubmit}
                            >
                                {t("submit")}
                            </button>
                        </div>

                        <p className="mt-4 text-center text-xs text-slate-500 sm:text-sm">
                            {t("noAccount")}{" "}
                            <button
                                type="button"
                                disabled={isSubmitting}
                                className="cursor-pointer text-[#1f6a9a] hover:underline disabled:cursor-not-allowed disabled:opacity-70"
                                onClick={() => router.push("/signup")}
                            >
                                {t("createAccount")}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
