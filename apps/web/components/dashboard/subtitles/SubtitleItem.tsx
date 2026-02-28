"use client";

import React, { memo, useCallback, useState } from 'react';
import { Trash2, Edit2, Check, Minus, Plus, Save } from 'lucide-react';
import { SubtitleLine } from '@repo/validation';
import { cn } from "@/lib/utils";
import { timeToSeconds, secondsToTime } from '@/utils/timeUtils';

type SubtitleItemProps = {
    subtitle: SubtitleLine;
    index: number;
    isCurrent: boolean;
    isEditing: boolean;
    onUpdate: (idx: number, field: keyof SubtitleLine, val: string) => void;
    onDelete: (idx: number) => void;
    onSetEditing: (idx: number | null) => void;
    onSeek: (time: string) => void;
};

export const SubtitleItem = memo(function SubtitleItem({
    subtitle,
    index,
    isCurrent,
    isEditing,
    onUpdate,
    onDelete,
    onSetEditing,
    onSeek
}: SubtitleItemProps) {
    const handleSave = useCallback(() => onSetEditing(null), [onSetEditing]);
    const handleEdit = useCallback(() => onSetEditing(index), [onSetEditing, index]);
    const handleSeek = useCallback(() => onSeek(subtitle.start), [onSeek, subtitle.start]);

    const adjustTime = useCallback((field: 'start' | 'end', delta: number) => {
        const currentSeconds = timeToSeconds(subtitle[field]);
        const newSeconds = Math.max(0, currentSeconds + delta);
        onUpdate(index, field, secondsToTime(newSeconds));
    }, [subtitle, index, onUpdate]);


    if (isEditing) {
        return (
            <div className="relative bg-white dark:bg-dark-brand-primary shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 my-3 mx-2 sm:mx-4 rounded-[1.5rem] border border-brand-primary/30 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
                <div className="p-4 sm:p-5">
                    <EditMode
                        subtitle={subtitle}
                        index={index}
                        onUpdate={onUpdate}
                        onSave={handleSave}
                        onAdjustTime={adjustTime}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "group relative border-b border-slate-100 dark:border-slate-800/60 transition-colors duration-300",
                isCurrent ? "bg-brand-primary/[0.03] dark:bg-brand-primary/[0.05]" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
            )}
        >

            {isCurrent && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-r-full" />
            )}

            <div className="p-4 sm:p-5 flex flex-col justify-center min-h-[5rem]">
                <div className="flex items-start justify-between gap-4 mb-1.5">


                    <button
                        onClick={handleSeek}
                        className={cn(
                            "font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 border",
                            isCurrent
                                ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                                : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-brand-primary/30 hover:text-brand-primary"
                        )}
                    >
                        {subtitle.start} &rarr; {subtitle.end}
                    </button>


                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={handleEdit}
                            className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                            title="Edit Subtitle"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(index)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Subtitle"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>


                <p
                    onClick={handleEdit}
                    className={cn(
                        "text-[15px] leading-relaxed cursor-text transition-colors pr-8",
                        isCurrent
                            ? "text-slate-900 dark:text-white font-bold"
                            : "text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white"
                    )}
                >
                    {subtitle.text}
                </p>
            </div>
        </div>
    );
}, (prev, next) =>
    prev.subtitle.text === next.subtitle.text &&
    prev.subtitle.start === next.subtitle.start &&
    prev.subtitle.end === next.subtitle.end &&
    prev.isCurrent === next.isCurrent &&
    prev.isEditing === next.isEditing
);

const EditMode = memo(({
    subtitle,
    index,
    onUpdate,
    onSave,
    onAdjustTime
}: {
    subtitle: SubtitleLine;
    index: number;
    onUpdate: (idx: number, field: keyof SubtitleLine, val: string) => void;
    onSave: () => void;
    onAdjustTime: (field: 'start' | 'end', delta: number) => void;
}) => {
    const [charCount, setCharCount] = useState(subtitle.text.length);

    return (
        <div className="space-y-4">

            {/* ✨ Premium Time Steppers */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Start Time</label>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-1 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all">
                        <button
                            onClick={() => onAdjustTime('start', -0.1)}
                            className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                            type="text"
                            value={subtitle.start}
                            onChange={(e) => onUpdate(index, 'start', e.target.value)}
                            className="bg-transparent border-none text-center font-mono text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 w-24 outline-none"
                        />
                        <button
                            onClick={() => onAdjustTime('start', 0.1)}
                            className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <span className="text-slate-300 dark:text-slate-600 mt-6 hidden sm:block">&rarr;</span>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">End Time</label>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-1 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all">
                        <button
                            onClick={() => onAdjustTime('end', -0.1)}
                            className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                            type="text"
                            value={subtitle.end}
                            onChange={(e) => onUpdate(index, 'end', e.target.value)}
                            className="bg-transparent border-none text-center font-mono text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 w-24 outline-none"
                        />
                        <button
                            onClick={() => onAdjustTime('end', 0.1)}
                            className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Subtitle Editor Textarea */}
            <div className="relative">
                <textarea
                    autoFocus
                    value={subtitle.text}
                    onChange={(e) => {
                        setCharCount(e.target.value.length);
                        onUpdate(index, 'text', e.target.value);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary focus:bg-white dark:focus:bg-[#0E1338] focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200 resize-none leading-relaxed placeholder-slate-400"
                    rows={2}
                    placeholder="Enter subtitle text..."
                />
                <span className="absolute right-3 bottom-3 text-[10px] font-bold tracking-widest text-slate-400 bg-white/80 dark:bg-[#0E1338]/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {charCount} CHARS
                </span>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-1">
                <button
                    onClick={onSave}
                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-[0_4px_14px_0_rgba(52,122,249,0.39)] hover:shadow-[0_6px_20px_rgba(52,122,249,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                >
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}, (prev, next) =>
    prev.subtitle.text === next.subtitle.text &&
    prev.subtitle.start === next.subtitle.start &&
    prev.subtitle.end === next.subtitle.end
);
EditMode.displayName = 'EditMode';