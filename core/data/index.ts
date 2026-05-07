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
    { title: "Accueil", href: "/home" },
    {
        title: "Facture",
        subItems: [
            { title: "Mes factures", href: "/home" },
            { title: "Nouvelle facture", href: "/home/facture/nouveau" },
        ],
    },
    {
        title: "Article",
        subItems: [
            { title: "Nouvel article", href: "/home/fournitures/articles/nouveau" },
            // { title: "Gestion services", href: "/home/fournitures/services" },
            { title: "Visualiser", href: "/home/fournitures/articles" },
        ],
    },
    {
        title: "Client",
        subItems: [
            { title: "Nouveau client", href: "/home/clients/new" },
            { title: "Visualiser", href: "/home/clients" },
        ],
    },
    {
        title: "Contrat",
        subItems: [
            { title: "Nouveau contrat", href: "/home/contrats/new" },
            { title: "Visualiser", href: "/home/contrats" },
        ],
    },
    { title: "Configuration", href: "/home/configuration" },
    { title: "Aide", href: "/home/aide" },
];
