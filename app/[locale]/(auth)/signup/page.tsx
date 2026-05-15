"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

import LanguageSwitcher from "@/components/shared/OtherComponents/LanguageSwitcher";
import { useRegister } from "@/core/hooks/auth/useRegister";
import type {
    AccountType,
    RegisterPayload,
} from "@/core/types/auth";
import Loader from "@/components/loader/Loader";

type ProfileType = "PERSONNEL" | "PME" | "ENTREPRISE";

type FormValues = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;

    companyName: string;
    legalName: string;
    rccm: string;
    nif: string;
    idNat: string;

    companyRole: string;
    businessSector: string;
    companySize: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const NIF_REGEX = /^[A-Z]\d{7}[A-Z]$/;

function mapProfileToAccountType(profile: ProfileType): AccountType {
    if (profile === "PME") return "pme";
    if (profile === "ENTREPRISE") return "corporate";
    return "personal";
}

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

    return "Une erreur est survenue lors de l'inscription.";
}

function getApiFieldErrors(error: unknown): FormErrors {
    if (
        !error ||
        typeof error !== "object" ||
        !("response" in error) ||
        !error.response ||
        typeof error.response !== "object" ||
        !("data" in error.response) ||
        !error.response.data ||
        typeof error.response.data !== "object" ||
        !("errors" in error.response.data) ||
        !error.response.data.errors ||
        typeof error.response.data.errors !== "object"
    ) {
        return {};
    }

    const apiErrors = error.response.data.errors as Record<string, string>;

    return {
        firstName: apiErrors.firstname,
        lastName: apiErrors.lastname,
        email: apiErrors.email,
        phone: apiErrors.phone,
        password: apiErrors.password,
        confirmPassword: apiErrors.password_confirm,

        companyName: apiErrors.company_name,
        legalName: apiErrors.legal_name,
        rccm: apiErrors.rccm,
        nif: apiErrors.nif,
        idNat: apiErrors.idnat,

        companyRole: apiErrors.position,
        businessSector: apiErrors.business_sector,
        companySize: apiErrors.company_size,
    };
}

export default function RegisterPage() {
    const router = useRouter();
    const t = useTranslations("register");

    const profiles = [
        {
            type: "ENTREPRISE" as ProfileType,
            title: t("profiles.company"),
        },
        {
            type: "PME" as ProfileType,
            title: t("profiles.sme"),
        },
        {
            type: "PERSONNEL" as ProfileType,
            title: t("profiles.personal"),
        },
    ];

    const companyRoles = [
        {
            value: "IT_SPECIALIST",
            label: t("companyRoles.it"),
        },
        {
            value: "SALES",
            label: t("companyRoles.sales"),
        },
        {
            value: "OWNER",
            label: t("companyRoles.owner"),
        },
        {
            value: "MANAGER",
            label: t("companyRoles.manager"),
        },
        {
            value: "OTHER",
            label: t("companyRoles.other"),
        },
    ];

    const businessSectors = [
        {
            value: "BANKING_INSURANCE",
            label: t("businessSectors.bankingInsurance"),
        },
        {
            value: "RESTAURANTS_HOTELS",
            label: t("businessSectors.restaurantsHotels"),
        },
        {
            value: "TRADE_DISTRIBUTION",
            label: t("businessSectors.tradeDistribution"),
        },
        {
            value: "TECHNOLOGY_IT",
            label: t("businessSectors.technologyIt"),
        },
        {
            value: "HEALTHCARE",
            label: t("businessSectors.health"),
        },
        {
            value: "EDUCATION",
            label: t("businessSectors.education"),
        },
        {
            value: "CONSTRUCTION_REAL_ESTATE",
            label: t("businessSectors.constructionRealEstate"),
        },
        {
            value: "TRANSPORT_LOGISTICS",
            label: t("businessSectors.transportLogistics"),
        },
        {
            value: "INDUSTRY",
            label: t("businessSectors.industry"),
        },
        {
            value: "OTHER",
            label: t("businessSectors.other"),
        },
    ];

    const companySizes = [
        {
            value: "1_10",
            label: t("companySizes.oneToTen"),
        },
        {
            value: "11_50",
            label: t("companySizes.elevenToFifty"),
        },
        {
            value: "51_200",
            label: t("companySizes.fiftyOneToTwoHundred"),
        },
        {
            value: "201_500",
            label: t("companySizes.twoHundredOneToFiveHundred"),
        },
        {
            value: "500_PLUS",
            label: t("companySizes.moreThanFiveHundred"),
        },
    ];

    const [profile, setProfile] = useState<ProfileType>("PERSONNEL");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiErrorMessage, setApiErrorMessage] = useState("");

    const [form, setForm] = useState<FormValues>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",

        companyName: "",
        legalName: "",
        rccm: "",
        nif: "",
        idNat: "",

        companyRole: "",
        businessSector: "",
        companySize: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const isBusiness = profile === "PME" || profile === "ENTREPRISE";

    const registerMutation = useRegister({
        onSuccess: (_, variables) => {
            setApiErrorMessage("");

            router.push(
                `/otp?email=${encodeURIComponent(
                    variables.email
                )}&flow=register`
            );
        },

        onError: (error) => {
            const backendErrors = getApiFieldErrors(error);
            const backendMessage = getApiErrorMessage(error);

            if (Object.keys(backendErrors).length > 0) {
                setErrors((prev) => ({
                    ...prev,
                    ...backendErrors,
                }));
            }

            setApiErrorMessage(backendMessage);
        },
    });

    const createRegisterSchema = () => {
        const baseSchema = z
            .object({
                firstName: z
                    .string()
                    .trim()
                    .min(1, t("validation.firstNameRequired")),

                lastName: z
                    .string()
                    .trim()
                    .min(1, t("validation.lastNameRequired")),

                email: z
                    .string()
                    .trim()
                    .min(1, t("validation.emailRequired"))
                    .regex(EMAIL_REGEX, t("validation.emailInvalid")),

                phone: z
                    .string()
                    .trim()
                    .min(1, t("validation.phoneRequired"))
                    .min(8, t("validation.phoneInvalid")),

                password: z
                    .string()
                    .min(1, t("validation.passwordRequired"))
                    .min(8, t("validation.passwordMin")),

                confirmPassword: z
                    .string()
                    .min(1, t("validation.confirmPasswordRequired")),

                companyName: z.string().trim(),
                legalName: z.string().trim(),
                rccm: z.string().trim(),
                nif: z.string().trim(),
                idNat: z.string().trim(),

                companyRole: z.string().trim(),
                businessSector: z.string().trim(),
                companySize: z.string().trim(),
            })
            .refine((data) => data.password === data.confirmPassword, {
                message: t("validation.passwordsMismatch"),
                path: ["confirmPassword"],
            });

        return baseSchema.superRefine((data, ctx) => {
            if (!isBusiness) return;

            if (!data.companyName) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["companyName"],
                    message: t("validation.companyNameRequired"),
                });
            }

            if (!data.legalName) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["legalName"],
                    message: "La dénomination légale est obligatoire.",
                });
            }

            if (!data.rccm) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["rccm"],
                    message: t("validation.rccmRequired"),
                });
            }

            if (!data.nif) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["nif"],
                    message: t("validation.nifRequired"),
                });
            } else if (!NIF_REGEX.test(data.nif)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["nif"],
                    message: t("validation.nifInvalid"),
                });
            }

            if (!data.idNat) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["idNat"],
                    message: t("validation.idNatRequired"),
                });
            }

            if (!data.companyRole) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["companyRole"],
                    message: t("validation.companyRoleRequired"),
                });
            }

            if (!data.businessSector) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["businessSector"],
                    message: t("validation.businessSectorRequired"),
                });
            }

            if (!data.companySize) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["companySize"],
                    message: t("validation.companySizeRequired"),
                });
            }
        });
    };

    const handleChange = (key: keyof FormValues, value: string) => {
        let nextValue = value;

        if (key === "nif") {
            nextValue = value
                .toUpperCase()
                .replace(/\s/g, "")
                .slice(0, 9);
        }

        setForm((prev) => ({
            ...prev,
            [key]: nextValue,
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

    const handleProfileChange = (nextProfile: ProfileType) => {
        setProfile(nextProfile);
        setErrors({});
        setApiErrorMessage("");

        if (nextProfile === "PERSONNEL") {
            setForm((prev) => ({
                ...prev,
                companyName: "",
                legalName: "",
                rccm: "",
                nif: "",
                idNat: "",
                companyRole: "",
                businessSector: "",
                companySize: "",
            }));
        }
    };

    const buildRegisterPayload = (data: FormValues): RegisterPayload => {
        const accountType = mapProfileToAccountType(profile);

        const basePayload = {
            email: data.email.trim(),
            firstname: data.firstName.trim(),
            lastname: data.lastName.trim(),
            phone: data.phone.trim(),
            password: data.password,
            password_confirm: data.confirmPassword,
        };

        if (accountType === "personal") {
            return {
                ...basePayload,
                type: "personal",
            };
        }

        return {
            ...basePayload,
            type: accountType,

            company_name: data.companyName.trim(),
            legal_name: data.legalName.trim(),
            rccm: data.rccm.trim(),
            nif: data.nif.trim(),
            idnat: data.idNat.trim(),
            position: data.companyRole.trim(),
            business_sector: data.businessSector.trim(),
            company_size: data.companySize.trim(),
        };
    };

    const handleSubmit = () => {
        if (registerMutation.isPending) return;

        const schema = createRegisterSchema();
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

        setErrors({});
        setApiErrorMessage("");

        const payload = buildRegisterPayload(result.data);

        registerMutation.mutate(payload);
    };

    return (
        <>
            {registerMutation.isPending ? (
                <Loader variant="overlay" text={t("loading")} />
            ) : null}

            <main className="flex min-h-screen w-full flex-col bg-[#f5f6f8] lg:flex-row">
                <section className="flex min-h-[38vh] w-full items-center justify-center bg-[#1f6a9a] px-6 py-8 lg:min-h-screen lg:w-1/2">
                    <div className="flex flex-col items-center text-center text-white">
                        <Image
                            src="/imglogin.png"
                            alt="illustration"
                            width={460}
                            height={460}
                            priority
                            className="h-auto w-[250px] sm:w-[340px] lg:w-[430px]"
                        />

                        <p className="mt-4 max-w-[320px] text-[13px] leading-relaxed text-white/90">
                            {t("heroText")}
                        </p>

                        <div className="mt-4 flex gap-2">
                            <span className="h-2 w-2 bg-white" />
                            <span className="h-2 w-2 bg-white/40" />
                            <span className="h-2 w-2 bg-white/40" />
                        </div>
                    </div>
                </section>

                <section className="flex w-full flex-col items-center bg-[#f5f6f8] px-6 py-3 lg:min-h-screen lg:w-1/2">
                    <div className="flex w-full justify-end py-3">
                        <LanguageSwitcher />
                    </div>

                    <div className="w-full max-w-[680px] bg-white px-6 py-8 sm:px-8">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <Image
                                src="/favi.png"
                                alt="logo"
                                width={52}
                                height={52}
                            />
                        </div>

                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-800 sm:text-[24px]">
                                {t("title")}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 sm:text-[14px]">
                                {t("subtitle")}
                            </p>
                        </div>

                        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {profiles.map((item) => {
                                const active = profile === item.type;

                                return (
                                    <button
                                        key={item.type}
                                        type="button"
                                        onClick={() =>
                                            handleProfileChange(item.type)
                                        }
                                        disabled={registerMutation.isPending}
                                        className={`relative flex h-12 w-full items-center justify-between rounded-none border-[0.09px] px-4 transition ${
                                            active
                                                ? "border-[#1f6a9a] bg-[#eef7fc]"
                                                : "border-slate-200 bg-white hover:border-[#1f6a9a]"
                                        } disabled:cursor-not-allowed disabled:opacity-70`}
                                    >
                                        <span className="text-sm font-semibold text-slate-800">
                                            {item.title}
                                        </span>

                                        <span
                                            className={`h-4 w-4 rounded-none border ${
                                                active
                                                    ? "border-[#1f6a9a] bg-[#1f6a9a]"
                                                    : "border-slate-300 bg-white"
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        {apiErrorMessage ? (
                            <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                                {apiErrorMessage}
                            </div>
                        ) : null}

                        <div className="space-y-4">
                            {isBusiness && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                                {t("fields.companyName")}
                                            </label>

                                            <input
                                                type="text"
                                                value={form.companyName}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "companyName",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={t(
                                                    "placeholders.companyName"
                                                )}
                                                disabled={
                                                    registerMutation.isPending
                                                }
                                                className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                            />

                                            {errors.companyName ? (
                                                <p className="mt-1 text-[12px] text-red-600">
                                                    {errors.companyName}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                                Dénomination légale
                                            </label>

                                            <input
                                                type="text"
                                                value={form.legalName}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "legalName",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Dénomination légale complète"
                                                disabled={
                                                    registerMutation.isPending
                                                }
                                                className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                            />

                                            {errors.legalName ? (
                                                <p className="mt-1 text-[12px] text-red-600">
                                                    {errors.legalName}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                                {t("fields.rccm")}
                                            </label>

                                            <input
                                                type="text"
                                                value={form.rccm}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "rccm",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={t(
                                                    "placeholders.rccm"
                                                )}
                                                disabled={
                                                    registerMutation.isPending
                                                }
                                                className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                            />

                                            {errors.rccm ? (
                                                <p className="mt-1 text-[12px] text-red-600">
                                                    {errors.rccm}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                                {t("fields.nif")}
                                            </label>

                                            <input
                                                type="text"
                                                value={form.nif}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "nif",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={t(
                                                    "placeholders.nif"
                                                )}
                                                disabled={
                                                    registerMutation.isPending
                                                }
                                                className="h-11 w-full border border-slate-300 px-3 text-[13px] uppercase outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                            />

                                            {errors.nif ? (
                                                <p className="mt-1 text-[12px] text-red-600">
                                                    {errors.nif}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                            ID NAT
                                        </label>

                                        <input
                                            type="text"
                                            value={form.idNat}
                                            onChange={(e) =>
                                                handleChange(
                                                    "idNat",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={t(
                                                "placeholders.idNat"
                                            )}
                                            disabled={
                                                registerMutation.isPending
                                            }
                                            className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                        />

                                        {errors.idNat ? (
                                            <p className="mt-1 text-[12px] text-red-600">
                                                {errors.idNat}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                                {t("fields.companyRole")}
                                            </label>

                                            <select
                                                value={form.companyRole}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "companyRole",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    registerMutation.isPending
                                                }
                                                className="h-11 w-full border border-slate-300 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                            >
                                                <option value="">
                                                    {t(
                                                        "placeholders.companyRole"
                                                    )}
                                                </option>

                                                {companyRoles.map((role) => (
                                                    <option
                                                        key={role.value}
                                                        value={role.value}
                                                    >
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.companyRole ? (
                                                <p className="mt-1 text-[12px] text-red-600">
                                                    {errors.companyRole}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                                {t("fields.businessSector")}
                                            </label>

                                            <select
                                                value={form.businessSector}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "businessSector",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    registerMutation.isPending
                                                }
                                                className="h-11 w-full border border-slate-300 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                            >
                                                <option value="">
                                                    {t(
                                                        "placeholders.businessSector"
                                                    )}
                                                </option>

                                                {businessSectors.map(
                                                    (sector) => (
                                                        <option
                                                            key={sector.value}
                                                            value={sector.value}
                                                        >
                                                            {sector.label}
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            {errors.businessSector ? (
                                                <p className="mt-1 text-[12px] text-red-600">
                                                    {errors.businessSector}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                            {t("fields.companySize")}
                                        </label>

                                        <select
                                            value={form.companySize}
                                            onChange={(e) =>
                                                handleChange(
                                                    "companySize",
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                registerMutation.isPending
                                            }
                                            className="h-11 w-full border border-slate-300 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                        >
                                            <option value="">
                                                {t(
                                                    "placeholders.companySize"
                                                )}
                                            </option>

                                            {companySizes.map((size) => (
                                                <option
                                                    key={size.value}
                                                    value={size.value}
                                                >
                                                    {size.label}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.companySize ? (
                                            <p className="mt-1 text-[12px] text-red-600">
                                                {errors.companySize}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                        {t("fields.firstName")}
                                    </label>

                                    <input
                                        type="text"
                                        value={form.firstName}
                                        onChange={(e) =>
                                            handleChange(
                                                "firstName",
                                                e.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "placeholders.firstName"
                                        )}
                                        disabled={registerMutation.isPending}
                                        className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />

                                    {errors.firstName ? (
                                        <p className="mt-1 text-[12px] text-red-600">
                                            {errors.firstName}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                        {t("fields.lastName")}
                                    </label>

                                    <input
                                        type="text"
                                        value={form.lastName}
                                        onChange={(e) =>
                                            handleChange(
                                                "lastName",
                                                e.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "placeholders.lastName"
                                        )}
                                        disabled={registerMutation.isPending}
                                        className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />

                                    {errors.lastName ? (
                                        <p className="mt-1 text-[12px] text-red-600">
                                            {errors.lastName}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                        {t("fields.email")}
                                    </label>

                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            handleChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        placeholder={t("placeholders.email")}
                                        disabled={registerMutation.isPending}
                                        className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />

                                    {errors.email ? (
                                        <p className="mt-1 text-[12px] text-red-600">
                                            {errors.email}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                        {t("fields.phone")}
                                    </label>

                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) =>
                                            handleChange(
                                                "phone",
                                                e.target.value
                                            )
                                        }
                                        placeholder={t("placeholders.phone")}
                                        disabled={registerMutation.isPending}
                                        className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />

                                    {errors.phone ? (
                                        <p className="mt-1 text-[12px] text-red-600">
                                            {errors.phone}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                        {t("fields.password")}
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={form.password}
                                            onChange={(e) =>
                                                handleChange(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={t(
                                                "placeholders.password"
                                            )}
                                            disabled={
                                                registerMutation.isPending
                                            }
                                            className="h-11 w-full border border-slate-300 px-3 pr-10 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                            disabled={
                                                registerMutation.isPending
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {errors.password ? (
                                        <p className="mt-1 text-[12px] text-red-600">
                                            {errors.password}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                        {t("fields.confirmPassword")}
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={form.confirmPassword}
                                            onChange={(e) =>
                                                handleChange(
                                                    "confirmPassword",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={t(
                                                "placeholders.confirmPassword"
                                            )}
                                            disabled={
                                                registerMutation.isPending
                                            }
                                            className="h-11 w-full border border-slate-300 px-3 pr-10 text-[13px] outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                            disabled={
                                                registerMutation.isPending
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {errors.confirmPassword ? (
                                        <p className="mt-1 text-[12px] text-red-600">
                                            {errors.confirmPassword}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={registerMutation.isPending}
                            className="mt-8 flex h-11 w-full items-center justify-center gap-2 bg-[#1f6a9a] text-sm font-semibold text-white transition hover:bg-[#18587f] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {t("continue")}
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <p className="mt-6 text-center text-[13px] text-slate-500">
                            {t("alreadyHaveAccount")}{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                disabled={registerMutation.isPending}
                                className="font-semibold text-[#1f6a9a] transition hover:text-[#18587f] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {t("login")}
                            </button>
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
