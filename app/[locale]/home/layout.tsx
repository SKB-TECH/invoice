"use client";

import React, {useEffect} from 'react';
import {Navbar} from "@/components/shared/OtherComponents/Navbar";
import Footer from "@/components/shared/OtherComponents/Footer";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";

type Props = {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {

    const {token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        router.push(token ? "/home" : "/");
    }, [token, router]);
    return (
        <div className="">
            <Navbar />
            <main className="min-h-screen mx-auto px-4 md:px-16 lg:px-24 pt-8 mb-3">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
