"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    sub?: string;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    sub,
}: StatCardProps) {
    return (
        <div className="relative group overflow-hidden rounded-2xl bg-white dark:bg-brand-dark p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-brand-gray-200 dark:border-brand-gray-800 hover:border-brand-primary/40 hover:shadow-[0_8px_30px_rgba(52,122,249,0.12)] transition-all duration-300 hover:-translate-y-1">

            <div className="flex items-center gap-5">

                <div className="p-4 rounded-[1rem] bg-brand-primary/10 text-brand-primary transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-md">
                    <Icon className="h-6 w-6" />
                </div>


                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest mb-1">
                        {label}
                    </p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {value}
                    </h3>
                </div>
            </div>


            {sub && (
                <div className="mt-5 pt-4 border-t border-brand-gray-200/50 dark:border-brand-gray-800/50">
                    <p className="text-xs font-semibold text-brand-gray-500">
                        {sub}
                    </p>
                </div>
            )}
        </div>
    );
}