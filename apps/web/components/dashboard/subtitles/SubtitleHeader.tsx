"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Save, Download, Loader2, Undo2, Redo2, ArrowLeft } from 'lucide-react';

type SubtitleHeaderProps = {
    filename: string;
    videoPath: string;
    isSaving: boolean;
    hasSubtitles: boolean;
    onSave: () => void;
    onDownload: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
};

export function SubtitleHeader({
    filename,
    isSaving,
    hasSubtitles,
    onSave,
    onDownload,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}: SubtitleHeaderProps) {
    return (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Branding & Title */}
            <div className="flex items-center gap-2">
                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <Link href="/dashboard/subtitles">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white line-clamp-1" title={filename}>
                        {filename}
                    </h1>
                    <p className="text-sm text-slate-500">
                        Subtitle Editor
                    </p>
                </div>
            </div>

            {/* Right: Actions Toolbar */}
            <div className="flex items-center gap-3">
                {/* Undo / Redo Group */}
                <div className="flex items-center gap-1.5 mr-1 pr-3 sm:mr-2 border-r border-slate-200 dark:border-slate-800 sm:pr-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Secondary Action: Download */}
                <Button
                    variant="ghost"
                    onClick={onDownload}
                    disabled={!hasSubtitles}
                    className="font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download SRT</span>
                </Button>

                {/* Primary Action: Save */}
                <Button
                    onClick={onSave}
                    disabled={isSaving || !hasSubtitles}
                    className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm shrink-0 rounded-xl font-bold"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                            <span className="hidden sm:inline">Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Save Changes</span>
                            <span className="sm:hidden">Save</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}