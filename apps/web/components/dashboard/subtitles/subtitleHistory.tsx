"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SubtitleResponse, SubtitleLine } from "@repo/validation/src/types/SubtitleTypes";
import { AlertCircle, CheckCircle2, Download, Edit, Loader2, MoreHorizontal, Trash2, Clock, FileVideo } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {SubtitleHistorySkeleton} from "@/components/dashboard/subtitles/skeleton/SubtitleHistorySkeleton";

type SubtitleHistoryProps = {
    subtitles: SubtitleResponse[];
    isLoading: boolean;
    error: string | null;
    refreshSubtitles: () => Promise<void>;
};

const STATUS_CONFIG = {
    done: { variant: "outline" as const, icon: CheckCircle2, color: "text-green-500" },
    processing: { variant: "secondary" as const, icon: Loader2, color: "text-blue-500", animate: true },
    queued: { variant: "outline" as const, icon: Clock, color: "text-gray-500" },
    failed: { variant: "destructive" as const, icon: AlertCircle, color: "text-red-500" },
};

function convertJsonToSrt(subtitles: SubtitleLine[]): string {
    return subtitles
        .map((line, index) => `${index + 1}\n${line.start.replace(".", ",")} --> ${line.end.replace(".", ",")}\n${line.text}\n`)
        .join("\n");
}

function convertJsonToVtt(subtitles: SubtitleLine[]): string {
    return "WEBVTT\n\n" + subtitles
        .map((line) => `${line.start} --> ${line.end}\n${line.text}\n`)
        .join("\n");
}

function triggerDownload(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function SubtitleHistory({ subtitles, isLoading, error, refreshSubtitles }: SubtitleHistoryProps) {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<SubtitleResponse | null>(null);
    const router = useRouter();

    const sortedData = useMemo(() =>
            [...subtitles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [subtitles]
    );

    const getFilename = (path: string) => path.split("/").pop() || path;

    const handleDownload = async (item: SubtitleResponse, format: "srt" | "vtt") => {
        setDownloadingId(item.id);
        try {
            const res = await fetch(`/api/subtitle/${item.id}`);
            if (!res.ok) throw new Error("Failed to fetch subtitle data.");

            const data: SubtitleResponse = await res.json();
            const subtitles: SubtitleLine[] = JSON.parse(data.subtitles_json || "[]");
            const filename = `${getFilename(item.video_path)}.${format}`;
            const content = format === "srt" ? convertJsonToSrt(subtitles) : convertJsonToVtt(subtitles);

            triggerDownload(content, filename);
            toast.success(`Downloaded as ${format.toUpperCase()}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Download failed");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setDeletingId(itemToDelete.id);
        try {
            const res = await fetch(`/api/subtitle/${itemToDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete item.");

            toast.success(`Deleted "${getFilename(itemToDelete.video_path)}"`);
            await refreshSubtitles();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
        } finally {
            setDeletingId(null);
            setItemToDelete(null);
        }
    };

    const handleRowClick = (itemId: string, e: React.MouseEvent) => {
        // Don't navigate if clicking on dropdown menu or its children
        const target = e.target as HTMLElement;
        if (target.closest('[role="menu"]') || target.closest('button')) {
            return;
        }
        router.push(`/dashboard/subtitles/${itemId}`);
    };

    const StatusIcon = ({ status }: { status: SubtitleResponse["status"] }) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        return <Icon className={`mr-2 h-4 w-4 ${config.color}`} />;
    };

    if (error) {
        return (
            <Card className="border-0 shadow-none">
                <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileVideo className="h-5 w-5 text-purple-600" />
                        Subtitle History
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-12 bg-red-50/50">
                    <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                    <p className="text-red-600 text-sm">Failed to load history: {error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-0 shadow-none">
                <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileVideo className="h-5 w-5 text-purple-600" />
                        Subtitle History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <SubtitleHistorySkeleton/>
                    ) : (
                        <div className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                                        <TableHead className="font-semibold">File</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Language</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {sortedData && sortedData.length > 0 ? (
                                            sortedData.map((item, index) => (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100 }}
                                                    transition={{ delay: index * 0.08, duration: 0.3 }}
                                                    onClick={(e) => handleRowClick(item.id, e)}
                                                    className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors cursor-pointer"
                                                >
                                                    <TableCell className="font-medium text-gray-900">
                                                        {getFilename(item.video_path)}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={STATUS_CONFIG[item.status].variant} className="gap-1">
                                                            <StatusIcon status={item.status} />
                                                            <span className="capitalize">{item.status}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="uppercase text-gray-600 text-sm font-medium">
                                                        {item.language}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    disabled={deletingId === item.id}
                                                                    className="hover:bg-purple-100"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {deletingId === item.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/dashboard/subtitles/${item.id}`} className="cursor-pointer">
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        View / Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {item.status === "done" && (
                                                                    <DropdownMenuSub>
                                                                        <DropdownMenuSubTrigger>
                                                                            {downloadingId === item.id ? (
                                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <Download className="mr-2 h-4 w-4" />
                                                                            )}
                                                                            Download
                                                                        </DropdownMenuSubTrigger>
                                                                        <DropdownMenuSubContent>
                                                                            <DropdownMenuItem onClick={() => handleDownload(item, 'srt')}>
                                                                                as .srt
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleDownload(item, 'vtt')}>
                                                                                as .vtt
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuSubContent>
                                                                    </DropdownMenuSub>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onSelect={(e) => {
                                                                        e.preventDefault();
                                                                        setItemToDelete(item);
                                                                    }}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-32 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                                        <FileVideo className="h-10 w-10 text-gray-300" />
                                                        <p className="text-sm">No subtitle history found. Upload a video to get started.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subtitle File?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete{" "}
                            <span className="font-semibold text-gray-900">
                                {itemToDelete && getFilename(itemToDelete.video_path)}
                            </span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteConfirm}
                            disabled={deletingId === itemToDelete?.id}
                        >
                            {deletingId === itemToDelete?.id && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}