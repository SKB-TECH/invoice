import React from 'react';
import {Navbar} from "@/components/shared/OtherComponents/Navbar";


type Props = {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
