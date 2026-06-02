"use client";

import React from "react";

import { ReportPeriodFields } from "@/components/reports/report-filter-fields";
import { cn } from "@/lib/utils";

type Props = {
    children: React.ReactNode;
    className?: string;
};

function flattenGridChildren(children: React.ReactNode): React.ReactNode[] {
    const items: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
        if (child == null || child === false) return;

        if (React.isValidElement(child) && child.type === React.Fragment) {
            const fragmentChild = child as React.ReactElement<{
                children?: React.ReactNode;
            }>;
            items.push(...flattenGridChildren(fragmentChild.props.children));
            return;
        }

        items.push(child);
    });

    return items;
}

function getGridSlotCount(child: React.ReactNode): number {
    if (React.isValidElement(child) && child.type === ReportPeriodFields) {
        return 2;
    }
    return 1;
}

export function ReportFiltersGrid({ children, className }: Props) {
    const items = flattenGridChildren(children);
    const totalSlots = items.reduce<number>(
        (count, child) => count + getGridSlotCount(child),
        0,
    );

    return (
        <div className={cn("grid gap-5 md:grid-cols-2", className)}>
            {items.map((child, index) => {
                const isLastAlone =
                    index === items.length - 1 && totalSlots % 2 === 1;

                return (
                    <div
                        key={index}
                        className={cn(
                            isLastAlone ? "md:col-span-2" : "contents",
                        )}
                    >
                        {child}
                    </div>
                );
            })}
        </div>
    );
}
