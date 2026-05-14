"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";

import Loader from "@/components/loader/Loader";
import {
    useGenerateOtp,
    useVerifyOtp,
} from "@/core/hooks/auth/useOtp";

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

    return "Une erreur est survenue.";
}

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const email = searchParams.get("email")?.trim() ?? "";
    const flow = searchParams.get("flow")?.trim() ?? "register";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const verifyOtpMutation = useVerifyOtp({
        onSuccess: () => {
            setErrorMessage("");
            setSuccessMessage("Compte vérifié avec succès.");

            if (flow === "register") {
                router.push("/");
                return;
            }

            router.push("/home");
        },

        onError: (error) => {
            setSuccessMessage("");
            setErrorMessage(
                getApiErrorMessage(error) || "Code OTP invalide ou expiré."
            );
        },
    });

    const generateOtpMutation = useGenerateOtp({
        onSuccess: () => {
            setErrorMessage("");
            setSuccessMessage("Un nouveau code OTP a été envoyé.");
            setOtp(["", "", "", "", "", ""]);

            const firstInput = document.getElementById("otp-0");
            firstInput?.focus();
        },

        onError: (error) => {
            setSuccessMessage("");
            setErrorMessage(
                getApiErrorMessage(error) ||
                "Impossible de renvoyer le code OTP."
            );
        },
    });

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const nextOtp = [...otp];
        nextOtp[index] = value;
        setOtp(nextOtp);

        if (errorMessage) {
            setErrorMessage("");
        }

        if (successMessage) {
            setSuccessMessage("");
        }

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const pastedValue = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedValue) return;

        const nextOtp = ["", "", "", "", "", ""];

        pastedValue.split("").forEach((digit, index) => {
            nextOtp[index] = digit;
        });

        setOtp(nextOtp);
        setErrorMessage("");
        setSuccessMessage("");

        const nextIndex = Math.min(pastedValue.length, 5);
        const nextInput = document.getElementById(`otp-${nextIndex}`);
        nextInput?.focus();
    };

    const handleSubmit = () => {
        if (verifyOtpMutation.isPending) return;

        if (!email) {
            setSuccessMessage("");
            setErrorMessage("Adresse email introuvable. Veuillez recommencer.");
            return;
        }

        const code = otp.join("");

        if (code.length !== 6) {
            setSuccessMessage("");
            setErrorMessage("Veuillez saisir le code OTP à 6 chiffres.");
            return;
        }

        verifyOtpMutation.mutate({
            email,
            otp: code,
        });
    };

    const handleResendCode = () => {
        if (generateOtpMutation.isPending) return;

        if (!email) {
            setSuccessMessage("");
            setErrorMessage("Adresse email introuvable. Veuillez recommencer.");
            return;
        }

        generateOtpMutation.mutate({
            email,
        });
    };

    const isLoading =
        verifyOtpMutation.isPending || generateOtpMutation.isPending;

    return (
        <>
            {verifyOtpMutation.isPending ? (
                <Loader variant="overlay" text="Vérification du code OTP..." />
            ) : null}

            {generateOtpMutation.isPending ? (
                <Loader variant="overlay" text="Renvoi du code OTP..." />
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
                            Vérifiez votre compte pour sécuriser votre accès à iKwook Invoice.
                        </p>

                        <div className="mt-4 flex gap-2">
                            <span className="h-2 w-2 bg-white" />
                            <span className="h-2 w-2 bg-white/40" />
                            <span className="h-2 w-2 bg-white/40" />
                        </div>
                    </div>
                </section>

                <section className="flex w-full items-center justify-center bg-[#f5f6f8] px-6 py-8 lg:min-h-screen lg:w-1/2">
                    <div className="w-full max-w-[500px] bg-white px-8 py-8">
                        <div className="mb-4 flex justify-start">
                            <Image
                                src="/favi.png"
                                alt="logo"
                                width={52}
                                height={52}
                            />
                        </div>

                        <h1 className="text-[24px] font-bold text-slate-800">
                            Vérification OTP
                        </h1>

                        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                            Entrez le code à 6 chiffres envoyé à votre adresse email.
                        </p>

                        {email ? (
                            <p className="mt-2 text-[13px] font-medium text-[#1f6a9a]">
                                {email}
                            </p>
                        ) : null}

                        {errorMessage ? (
                            <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                                {errorMessage}
                            </div>
                        ) : null}

                        {successMessage ? (
                            <div className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">
                                {successMessage}
                            </div>
                        ) : null}

                        <div className="mt-7 flex justify-between gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) =>
                                        handleChange(e.target.value, index)
                                    }
                                    onKeyDown={(e) =>
                                        handleKeyDown(e, index)
                                    }
                                    onPaste={handlePaste}
                                    disabled={isLoading}
                                    className="h-12 w-full border border-slate-300 text-center text-[18px] font-bold text-slate-800 outline-none focus:border-[#1f6a9a] disabled:cursor-not-allowed disabled:bg-slate-100"
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="mt-7 flex h-12 w-full items-center justify-center gap-2 bg-[#1f6a9a] text-[14px] font-semibold text-white hover:bg-[#18587f] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {verifyOtpMutation.isPending
                                ? "Vérification..."
                                : "Vérifier le compte"}
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isLoading}
                            className="mt-4 flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-[#1f6a9a] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <RotateCcw className="h-4 w-4" />
                            {generateOtpMutation.isPending
                                ? "Renvoi..."
                                : "Renvoyer le code"}
                        </button>

                        <p className="mt-6 text-center text-[13px] text-slate-500">
                            Mauvais email ?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/signup")}
                                disabled={isLoading}
                                className="font-semibold text-[#1f6a9a] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Retour à l’inscription
                            </button>
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Page;
