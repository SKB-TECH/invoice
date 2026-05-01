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
import {Menu, X, ChevronDown, LogOut} from "lucide-react";

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
            }
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

    return (
        <nav className="top-0 z-50 w-full border-b bg-background/95 backdrop-blur bg-white shadow-sm">
            <div className="flex h-20 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2  px-4 md:px-6">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Logo
                  </span>
                </Link>

                <div className="hidden md:flex md:items-center md:space-x-6">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {menuItems.map((item, index) => (
                                <NavigationMenuItem key={index}>
                                    {item.subItems ? (
                                        <>
                                            <NavigationMenuTrigger className="bg-transparent">
                                                {item.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
                                            <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                                                {item.title}
                                            </NavigationMenuLink>
                                        </Link>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Mobile Navigation */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
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
                                                <ChevronDown
                                                    className={cn(
                                                        "h-4 w-4 transition-transform",
                                                        openMobileSubmenu === item.title && "rotate-180"
                                                    )}
                                                />
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
                <div className="flex flex-col items-center  space-y-4  px-4 md:px-6">
                    <button>
                        <LogOut size={24}/>
                    </button>
                </div>
            </div>
        </nav>
    );
}



const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    {children && (
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {children}
                        </p>
                    )}
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
