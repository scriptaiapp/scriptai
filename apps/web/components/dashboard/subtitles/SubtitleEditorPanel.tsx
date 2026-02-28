"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, MoreVertical } from 'lucide-react';
import { SubtitleLine } from '@repo/validation';
import { SubtitleEmptyState } from './SubtitleEmptyState';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubtitleList } from "@/components/dashboard/subtitles/SubtitleList";

type SubtitleEditorPanelProps = {
    subtitles: SubtitleLine[];
    currentSub: SubtitleLine | undefined;
    editingIndex: number | null;
    isGenerating: boolean;
    videoDuration: number | null;
    onAddLine: () => void;
    onUpdate: (idx: number, field: keyof SubtitleLine, val: string) => void;
    onDelete: (idx: number) => void;
    onSetEditing: (idx: number | null) => void;
    onSeek: (time: string) => void;
    onGenerate: (language: string, targetLanguage: string) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
};

export function SubtitleEditorPanel({
    subtitles,
    currentSub,
    editingIndex,
    isGenerating,
    videoDuration,
    onAddLine,
    onUpdate,
    onDelete,
    onSetEditing,
    onSeek,
    onGenerate,
    onFileChange,
    onClear
}: SubtitleEditorPanelProps) {
    const hasSubtitles = subtitles.length > 0;
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSubtitles = hasSubtitles
        ? subtitles
            .map((sub, idx) => ({ sub, idx }))
            .filter(({ sub }) =>
                sub.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.start.includes(searchQuery) ||
                sub.end.includes(searchQuery)
            )
        : [];

    return (
        <div className="flex flex-col h-full rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1338] shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden relative">
            {!hasSubtitles ? (
                <div className="flex-1 overflow-y-auto">
                    <SubtitleEmptyState
                        isGenerating={isGenerating}
                        videoDuration={videoDuration}
                        onGenerate={onGenerate}
                        onFileChange={onFileChange}
                        onAddLineManually={onAddLine}
                    />
                </div>
            ) : (
                <>

                    <div className="pb-4 pt-6 px-6 border-b border-slate-100 dark:border-slate-800/50 bg-white/95 dark:bg-[#0E1338]/95 backdrop-blur-md z-10 shrink-0">


                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Editor
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                    {subtitles.length} {subtitles.length === 1 ? 'LINE' : 'LINES'}
                                </p>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl dark:bg-[#0f172a] border-slate-200 dark:border-slate-700/50 p-1">
                                    <DropdownMenuItem
                                        className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400 cursor-pointer font-bold rounded-lg py-2.5"
                                        onClick={onClear}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear All Subtitles
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Bottom Row: Actions */}
                        <div className="flex items-center gap-3 w-full">

                            {/* Search Bar */}
                            <div className="relative group flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search subtitles..."
                                    className="w-full pl-9 pr-4 h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder-slate-400 dark:text-slate-500 shadow-sm focus:bg-white dark:focus:bg-[#0E1338]"
                                />
                            </div>


                            <Button
                                onClick={onAddLine}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold h-10 px-5 rounded-xl shrink-0 shadow-sm transition-all active:scale-95"
                            >
                                <Plus className="h-4 w-4 mr-1.5" /> Add
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <SubtitleList
                            subtitles={filteredSubtitles.map(({ sub }) => sub)}
                            originalIndices={filteredSubtitles.map(({ idx }) => idx)}
                            allSubtitles={subtitles}
                            currentSub={currentSub}
                            editingIndex={editingIndex}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onSetEditing={onSetEditing}
                            onSeek={onSeek}
                        />
                    </div>
                </>
            )}
        </div>
    );
}