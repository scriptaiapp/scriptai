"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StatsPageSkeleton() {
    return (
        <div className="space-y-8">

            <div className="relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white dark:bg-brand-dark p-6 sm:p-8 rounded-[2rem] border border-brand-gray-200 dark:border-brand-gray-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <Skeleton className="h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full shrink-0" />
                        <div className="flex flex-col justify-center gap-2">
                            <Skeleton className="h-8 w-48 sm:w-64" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Skeleton className="h-6 w-16 rounded-md" />
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-6 w-24 rounded-md" />
                        <Skeleton className="h-3 w-36" />
                    </div>
                </div>
                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-5 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    <Skeleton className="h-11 w-full md:w-40 rounded-xl" />
                    <div className="flex flex-col md:items-end w-full">
                        <div className="flex justify-between md:justify-end gap-3 w-full text-xs mb-1.5">
                            <Skeleton className="h-5 w-16 rounded-md" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="w-full md:w-48 h-1.5 rounded-full" />
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl bg-white dark:bg-brand-dark p-6 border border-brand-gray-200 dark:border-brand-gray-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                    >
                        <div className="flex items-center gap-5">
                            <Skeleton className="h-14 w-14 rounded-[1rem] shrink-0" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="rounded-[2rem] bg-white dark:bg-brand-dark border border-brand-gray-200 dark:border-brand-gray-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="pb-6 pt-6 px-8">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </div>
                    <div className="px-8 pb-8">
                        <Skeleton className="h-[280px] w-full rounded-2xl" />
                    </div>
                </div>
                <div className="rounded-[2rem] bg-white dark:bg-brand-dark border border-brand-gray-200 dark:border-brand-gray-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-5 w-40" />
                        </div>
                    </div>
                    <div className="p-6 sm:p-8 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <div className="rounded-[2rem] bg-white dark:bg-brand-dark border border-brand-gray-200 dark:border-brand-gray-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-20 w-36 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
