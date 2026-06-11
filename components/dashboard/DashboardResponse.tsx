"use client"

import React from "react";

export function DashboardSkeleton() {
    return (
        <div className="min-h-full w-full text-[#4E5866]">
            <div className="mx-auto w-full animate-pulse">
                <div className="mb-4 h-[58px] border border-[#F3B35E] bg-[#FFF3E3]" />
                <div className="grid grid-cols-12 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="col-span-12 h-[140px] border border-[#E2E5E9] bg-white xl:col-span-3"
                        >
                            <div className="flex h-full items-center px-5">
                                <div className="grid w-full grid-cols-[42px_1fr] items-center gap-5">
                                    <div className="h-10 w-10 rounded-full bg-slate-200" />

                                    <div>
                                        <div className="h-4 w-36 bg-slate-200" />
                                        <div className="mt-4 h-6 w-28 bg-slate-200" />
                                        <div className="mt-5 h-3 w-32 bg-slate-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="col-span-12 h-[450px] border border-[#E2E5E9] bg-white xl:col-span-7">
                        <div className="border-b border-[#E7EBEF] px-5 py-5">
                            <div className="h-4 w-44 bg-slate-200" />
                        </div>

                        <div className="grid grid-cols-3 border-b border-[#E7EBEF] px-8 py-5">
                            <div className="mx-auto h-3 w-24 bg-slate-200" />
                            <div className="mx-auto h-3 w-24 bg-slate-200" />
                            <div className="mx-auto h-3 w-24 bg-slate-200" />
                        </div>

                        <div className="px-5 py-6">
                            <div className="h-[280px] w-full bg-slate-100" />
                        </div>
                    </div>

                    <div className="col-span-12 h-[450px] border border-[#E2E5E9] bg-white xl:col-span-5">
                        <div className="border-b border-[#E7EBEF] px-5 py-5">
                            <div className="h-4 w-36 bg-slate-200" />
                        </div>

                        <div className="flex justify-center py-6">
                            <div className="h-[180px] w-[180px] rounded-full bg-slate-100" />
                        </div>

                        <div className="space-y-4 px-8">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[1fr_55px_95px] items-center gap-3"
                                >
                                    <div className="h-3 w-28 bg-slate-200" />
                                    <div className="h-3 w-8 bg-slate-200" />
                                    <div className="h-3 w-20 bg-slate-200" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-12 h-[355px] border border-[#E2E5E9] bg-white xl:col-span-7">
                        <div className="border-b border-[#E7EBEF] px-5 py-5">
                            <div className="h-4 w-40 bg-slate-200" />
                        </div>

                        <div className="space-y-5 px-5 py-6">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-6 gap-4"
                                >
                                    {Array.from({ length: 6 }).map(
                                        (_, itemIndex) => (
                                            <div
                                                key={itemIndex}
                                                className="h-3 bg-slate-200"
                                            />
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-12 h-[355px] border border-[#E2E5E9] bg-white xl:col-span-5">
                        <div className="border-b border-[#E7EBEF] px-5 py-5">
                            <div className="h-4 w-48 bg-slate-200" />
                        </div>

                        <div className="space-y-5 px-5 py-6">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-4 gap-4"
                                >
                                    {Array.from({ length: 4 }).map(
                                        (_, itemIndex) => (
                                            <div
                                                key={itemIndex}
                                                className="h-3 bg-slate-200"
                                            />
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
