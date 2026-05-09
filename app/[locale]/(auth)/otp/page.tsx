"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";

const Page = () => {
    const router = useRouter();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const nextOtp = [...otp];
        nextOtp[index] = value;
        setOtp(nextOtp);

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

    const handleSubmit = () => {
        const code = otp.join("");
        if (code.length !== 6) return;

        router.push("/home");
    };

    return (
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
                        <Image src="/favi.png" alt="logo" width={52} height={52} />
                    </div>

                    <h1 className="text-[24px] font-bold text-slate-800">
                        Vérification OTP
                    </h1>

                    <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                        Entrez le code à 6 chiffres envoyé à votre adresse email ou à votre
                        numéro de téléphone.
                    </p>

                    <div className="mt-7 flex justify-between gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="h-12 w-full border border-slate-300 text-center text-[18px] font-bold text-slate-800 outline-none focus:border-[#1f6a9a]"
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="mt-7 flex h-12 w-full items-center justify-center gap-2 bg-[#1f6a9a] text-[14px] font-semibold text-white hover:bg-[#18587f]"
                    >
                        Vérifier le compte
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        className="mt-4 flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-[#1f6a9a]"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Renvoyer le code
                    </button>

                    <p className="mt-6 text-center text-[13px] text-slate-500">
                        Mauvais email ?{" "}
                        <button
                            type="button"
                            onClick={() => router.push("/signup")}
                            className="font-semibold text-[#1f6a9a] "
                        >
                            Retour à l’inscription
                        </button>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Page;
