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
    {
        title: "Accueil",
        href: "/home",
    },
    {
        title: "Facture",
        subItems: [
            {
                title: "MesFactures",
                href: "/home",
            },
            {
                title: "NouvelleFacture",
                href: "/home/facture/nouveau",
            },
        ],
    },
    {
        title: "Article",
        subItems: [
            {
                title: "NouvelArticle",
                href: "/home/articles/nouveau",
            },
            {
                title: "Visualiser",
                href: "/home/articles",
            },
        ],
    },
    {
        title: "Client",
        subItems: [
            {
                title: "NouveauClient",
                href: "/home/clients/new",
            },
            {
                title: "Visualiser",
                href: "/home/clients",
            },
        ],
    },
    {
        title: "Contrat",
        subItems: [
            {
                title: "NouveauContrat",
                href: "/home/contrats/new",
            },
            {
                title: "Visualiser",
                href: "/home/contrats",
            },
        ],
    },
    {
        title: "Configuration",
        href: "/home/configuration",
    },
    {
        title: "Aide",
        href: "/home/aide",
    },
];
