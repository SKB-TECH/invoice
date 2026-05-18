"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/routing";

export default function LegacyConfigurationServiceNewRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/home/services/nouveau");
    }, [router]);

    return null;
}
