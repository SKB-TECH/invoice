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
import { ChevronRight, Menu, LogOut, Bell, User, ChevronDown } from "lucide-react";

// Types pour les menus
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
    {
        title: "Factures",
        subItems: [
            {
                title: "Mes factures",
                href: "/home",
            },
            {
                title: "Nouveau facture",
                href: "/facture/nouveau",
            },

        ],
    },
    {
        title: "Gestion clients",
        subItems: [
            {
                title: "Nouveau client",
                href: "/clients/nouveau",
            },
            {
                title: "Visualiser",
                href: "/clients",
            },
        ],
    },
    {
        title: "Gestion contrats",
        subItems: [
            {
                title:"Nouveau contrat",
                href: "/contacts/nouveau",
            },
            {
                title: "Visualiser",
                href: "/contacts",
            },
        ],
    },
    {
        title: "Fournitures",
        subItems: [
            {
                title:"Gestion articles",
                href: "/fournitures/article",
            },
            {
                title:"Gestion services",
                href: "/fournitures/services",
            },
            {
                title: "Visualiser",
                href: "/fournitures/visualiser",
            },
        ],
    },

];

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [openMobileSubmenu, setOpenMobileSubmenu] = React.useState<string | null>(null);

    const navTriggerClass =
        "h-10 min-h-10 md:h-12 md:min-h-12 bg-transparent px-4 py-0 text-sm font-medium text-primary-foreground shadow-none hover:bg-white/10 hover:text-primary data-open:bg-white data-open:font-semibold data-open:text-primary data-popup-open:bg-white data-popup-open:font-semibold data-popup-open:text-primary data-open:hover:bg-white data-popup-open:hover:bg-white data-open:focus:bg-white data-popup-open:focus:bg-white";

    return (
        <nav className="sticky top-0 z-50 w-full overflow-visible shadow-md">
            <div className="flex h-16 w-full md:h-16">
                <Link
                    href="/"
                    className="flex shrink-0 items-center border-r border-primary/15 bg-white px-4 md:px-8"
                >
                    <span className="text-xl font-bold tracking-tight text-primary">Logo</span>
                </Link>

                <div className="relative flex min-w-0 flex-1 items-center bg-primary text-primary-foreground">
                    <div className="hidden flex-1 justify-center md:flex">
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
                                                    className={cn(navTriggerClass, "flex items-center")}
                                                >
                                                    {item.title}
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent
                                                    className={cn(
                                                        "!bg-white !p-0",
                                                        "left-0 z-50 max-w-[min(92vw,22rem)] min-w-[max(100%,17.5rem)]",
                                                        "overflow-hiddentext-foreground"
                                                    )}
                                                >
                                                    <ul className="flex w-full min-w-0 flex-col divide-y">
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
                                                        "group inline-flex w-max items-center justify-center hover:bg-white/10"
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

                    <div className="ml-auto flex min-h-full items-center gap-2 pr-3 md:pr-6">
                {/* Mobile Navigation */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary-foreground hover:bg-white/15 hover:text-white"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <div className="flex flex-col space-y-4 mt-8">
                            {menuItems.map((item, index) => (
                                <div key={index} className="flex flex-col">
                                    {item.subItems ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    setOpenMobileSubmenu(
                                                        openMobileSubmenu === item.title ? null : item.title
                                                    )
                                                }
                                                className="flex items-center justify-between py-2 text-lg font-medium transition-colors hover:text-primary"
                                            >
                                                {item.title}

                                            </button>
                                            {openMobileSubmenu === item.title && (
                                                <div className="ml-4 mt-2 flex flex-col space-y-3">
                                                    {item.subItems.map((subItem, subIndex) => (
                                                        <Link
                                                            key={subIndex}
                                                            href={subItem.href}
                                                            onClick={() => setIsOpen(false)}
                                                            className="py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                                                        >
                                                            {subItem.title}
                                                            {subItem.description && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {subItem.description}
                                                                </p>
                                                            )}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href={item.href || "#"}
                                            onClick={() => setIsOpen(false)}
                                            className="py-2 text-lg font-medium transition-colors hover:text-primary"
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </div>
                            ))}
                            <div className="flex flex-col space-y-2 pt-4 border-t">
                                <Button variant="ghost" className="justify-start">
                                    Se connecter
                                </Button>
                                <Button>
                                    Commencer
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                    <div className="flex items-center justify-center gap-10 px-1 md:px-2">
                        <div className="flex items-center space-x-2 relative">
                            <Bell size={24} className="text-primary-foreground" />
                            <span className="text-sm font-medium text-primary absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white">
                                <span className="text-xs">10</span>
                            </span>
                        </div>
                        <div className="flex items-center relative bg-white rounded-full px-4 py-2 gap-2">
                            <User size={24} className="text-gray-300" />
                            <ChevronDown size={24} className="text-gray-300" />
                        </div>
                    </div>
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
                            "flex w-full select-none items-start gap-3 rounded-none px-4 py-3.5 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
                            className
                        )}
                        {...props}
                    >
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-sm font-medium leading-snug text-foreground">{title}</div>
                            {children && (
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {children}
                                </p>
                            )}
                        </div>
                        {showChevron ? (
                            <ChevronRight
                                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                aria-hidden
                            />
                        ) : null}
                    </a>
                </NavigationMenuLink>
            </li>
        );
    }
);
ListItem.displayName = "ListItem";
