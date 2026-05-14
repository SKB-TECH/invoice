'use client';

import React from 'react';

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>
        </div>
    );
}

export function TableSkeleton({
                                  rows = 5,
                                  cols = 4,
                              }: {
    rows?: number;
    cols?: number;
}) {
    return (
        <div className="animate-pulse">
            {/* Header */}
            <div
                className="grid gap-4 border-b border-gray-200 bg-gray-50 p-4 dark:border-slate-600 dark:bg-slate-800/60"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="h-4 rounded bg-gray-200 dark:bg-slate-600" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="grid gap-4 border-b border-gray-100 p-4 dark:border-slate-700/80"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: cols }).map((_, colIndex) => {
                        const w = 55 + ((rowIndex * 3 + colIndex * 7) % 37);
                        return (
                            <div
                                key={colIndex}
                                className="h-4 rounded bg-gray-100 dark:bg-slate-700/80"
                                style={{ width: `${w}%` }}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-3 bg-gray-200 rounded w-20" />
                        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    </div>
                    <div className="h-7 bg-gray-200 rounded w-16 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
            ))}
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4" />
                <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-20 mb-4" />
                <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded-full w-16" />
                    <div className="h-4 bg-gray-200 rounded-full w-16" />
                </div>
            </div>
        </div>
    );
}
