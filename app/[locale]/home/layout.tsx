import React from 'react';
import {Navbar} from "@/components/shared/OtherComponents/Navbar";
import Footer from "@/components/shared/OtherComponents/Footer";


type Props = {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
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
