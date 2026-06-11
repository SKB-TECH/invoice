"use client";

import React, { useEffect } from "react";
import { Navbar } from "@/components/shared/OtherComponents/Navbar";
import Footer from "@/components/shared/OtherComponents/Footer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Props = {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
    const { token, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (loading) return;
        if (!token) {
            router.replace("/");
        }
    }, [token, loading, router]);

    if (loading) {
        return null;
    }

    if (!token) {
        return null;
    }

    return (
        <div>
            <Navbar />

            <main className="mx-auto mb-3 min-h-screen px-4 pt-8 md:px-16 lg:px-24">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default Layout;
