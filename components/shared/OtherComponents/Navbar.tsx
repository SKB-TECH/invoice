"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Bell,
    ChevronDown,
    ChevronRight,
    Grid3X3,
    Menu,
    User,
    WalletCards,
} from "lucide-react";
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

const menuItems: MenuItem[] = [
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
            { title: "Nouveau client", href: "/clients/nouveau" },
            { title: "Visualiser", href: "/clients" },
        ],
    },
    {
        title: "Contrat",
        subItems: [
            { title: "Nouveau contrat", href: "/contacts/nouveau" },
            { title: "Visualiser", href: "/contacts" },
        ],
    },
    { title: "Configuration", href: "/configuration" },
    { title: "Aide", href: "/aide" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [openMobileSubmenu, setOpenMobileSubmenu] =
        React.useState<string | null>(null);

    const navTriggerClass = "h-16 bg-transparent px-4 py-0 text-[14px] font-semibold text-white shadow-none hover:bg-white/10 hover:text-white data-[state=open]:bg-white data-[state=open]:text-[#0879bd] data-[state=open]:font-semibold";
    return (
        <nav className="sticky top-0 z-50 w-full overflow-visible bg-[#0879bd]">
            <div className="mx-auto flex h-20 w-full px-8 items-center">
                <Link
                    href="/"
                    className="flex h-20 shrink-0 items-center gap-2 bg-[#0879bd] px-5 md:px-8"
                >
                <Image alt={"logo"} src={"/invoiceb.png"} width={200} height={200} />
                </Link>

                <div className="relative flex min-w-0 flex-1 items-center bg-[#0879bd] text-white">
                    <div className="hidden flex-1 justify-center lg:flex">
                        <NavigationMenu
                            viewport={false}
                            className="relative flex max-w-none flex-1 items-stretch justify-center"
                        >
                            <NavigationMenuList className="flex-nowrap justify-center gap-0">
                                {menuItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="flex">
                                        {item.subItems ? (
                                            <>
                                                <NavigationMenuTrigger
                                                    className={cn(
                                                        navTriggerClass,
                                                        "flex items-center gap-1"
                                                    )}
                                                >
                                                    {item.title}
                                                </NavigationMenuTrigger>

                                                <NavigationMenuContent
                                                    className={cn(
                                                        "!z-[9999] !border !border-slate-200 !bg-white !p-0 !shadow-none",
                                                        "left-0 mt-0 min-w-[15rem] overflow-hidden"
                                                    )}
                                                >
                                                    <ul className="flex w-full min-w-0 flex-col divide-y divide-slate-200">
                                                        {item.subItems.map((subItem, subIndex) => (
                                                            <ListItem
                                                                key={subIndex}
                                                                title={subItem.title}
                                                                href={subItem.href}
                                                            >
                                                                {subItem.description}
                                                            </ListItem>
                                                        ))}
                                                    </ul>
                                                </NavigationMenuContent>
                                            </>
                                        ) : (
                                            <Link href={item.href || "#"} legacyBehavior passHref>
                                                <NavigationMenuLink
                                                    className={cn(
                                                        navTriggerClass,
                                                        "group inline-flex w-max items-center justify-center"
                                                    )}
                                                >
                                                    {item.title}
                                                </NavigationMenuLink>
                                            </Link>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex min-h-full items-center gap-4 pr-4 md:pr-8">
                        <button className="hidden text-white/90 transition hover:text-white md:inline-flex">
                            <Grid3X3 className="h-5 w-5" />
                        </button>

                        <button className="relative hidden text-white/90 transition hover:text-white md:inline-flex">
                            <WalletCards className="h-5 w-5" />
                            <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0879bd]" />
                        </button>

                        <button className="relative text-white/90 transition hover:text-white">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0879bd]" />
                        </button>
                        <button className="hidden items-center gap-2 bg-white px-3 py-1.5 transition hover:bg-slate-100 md:flex rounded-full">
                          <span className="flex h-6 w-6 items-center justify-center">
                            <User className="h-5 w-5 text-slate-500" />
                          </span>
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                        </button>

                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white shadow-none hover:bg-white/10 hover:text-white"
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Ouvrir le menu</span>
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="right" className="w-[310px] p-0 sm:w-[380px]">
                                <div className="flex h-full flex-col bg-white">
                                    <div className="flex h-16 items-center gap-2 bg-[#0879bd] px-5">
                                        <Image alt={"logo"} src={"/invoiceb.png"} width={200} height={200} />
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-4 py-5">
                                        <div className="flex flex-col gap-1">
                                            {menuItems.map((item, index) => (
                                                <div key={index} className="flex flex-col">
                                                    {item.subItems ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setOpenMobileSubmenu(
                                                                        openMobileSubmenu === item.title
                                                                            ? null
                                                                            : item.title
                                                                    )
                                                                }
                                                                className="flex items-center justify-between px-3 py-3 text-left text-[14px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#0879bd]"
                                                            >
                                                                {item.title}
                                                                <ChevronRight
                                                                    className={cn(
                                                                        "h-4 w-4 transition-transform",
                                                                        openMobileSubmenu === item.title &&
                                                                        "rotate-90"
                                                                    )}
                                                                />
                                                            </button>

                                                            {openMobileSubmenu === item.title && (
                                                                <div className="ml-3 mt-1 flex flex-col border-l border-slate-200 pl-3">
                                                                    {item.subItems.map((subItem, subIndex) => (
                                                                        <Link
                                                                            key={subIndex}
                                                                            href={subItem.href}
                                                                            onClick={() => setIsOpen(false)}
                                                                            className="px-3 py-2 text-sm md:text-[14px] text-slate-500 transition hover:bg-slate-100 hover:text-[#0879bd]"
                                                                        >
                                                                            {subItem.title}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Link
                                                            href={item.href || "#"}
                                                            onClick={() => setIsOpen(false)}
                                                            className="px-3 py-3 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#0879bd]"
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}

type ListItemProps = Omit<React.ComponentPropsWithoutRef<"a">, "title"> & {
    title: string;
    showChevron?: boolean;
};

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
    ({ className, title, children, showChevron = true, ...props }, ref) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <a
                        ref={ref}
                        className={cn(
                            "flex w-full select-none items-start gap-3 px-4 py-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100",
                            className
                        )}
                        {...props}
                    >
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-[14px] font-semibold leading-snug text-slate-800">
                                {title}
                            </div>

                            {children && (
                                <p className="line-clamp-2 text-[14px] leading-snug text-slate-500">
                                    {children}
                                </p>
                            )}
                        </div>

                        {showChevron && (
                            <ChevronRight
                                className="mt-0.5 size-4 shrink-0 text-slate-400"
                                aria-hidden
                            />
                        )}
                    </a>
                </NavigationMenuLink>
            </li>
        );
    }
);

ListItem.displayName = "ListItem";
