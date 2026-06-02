
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
                href: "/home/factures",
            },
            {
                title: "NouvelleFacture",
                href: "/home/factures/new",
            },
        ],
    },
    {
        title: "Catalogue",
        subItems: [
            {
                title: "Article",
                href: "/home/articles",
            },
            {
                title: "Service",
                href: "/home/services",
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
        title: "Reports",
        href: "/home/reports",
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
