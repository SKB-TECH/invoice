import * as React from "react";
import Link from "next/link";
import Image from "next/image";

interface SubMenuItem {
    title: string;
    href: string;
    description?: string;
}

interface MenuItem {
    title: string;
    href?: string;
    subItems?: SubMenuItem[];
}

export const menuItems: MenuItem[] = [
    { title: "Accueil", href: "/" },
    {
        title: "Facture",
        subItems: [
            { title: "Mes factures", href: "/home" },
            { title: "Nouvelle facture", href: "/facture/nouveau" },
        ],
    },
    {
        title: "Article",
        subItems: [
            { title: "Gestion articles", href: "/fournitures/article" },
            { title: "Gestion services", href: "/fournitures/services" },
            { title: "Visualiser", href: "/fournitures/visualiser" },
        ],
    },
    {
        title: "Client",
        subItems: [
            { title: "Nouveau client", href: "/clients/new" },
            { title: "Visualiser", href: "/clients" },
        ],
    },
    {
        title: "Contrat",
        subItems: [
            { title: "Nouveau contrat", href: "/contrats/new" },
            { title: "Visualiser", href: "/contrats" },
        ],
    },
    { title: "Configuration", href: "/configuration" },
    { title: "Aide", href: "/aide" },
];
