"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Sparkles, Youtube } from "lucide-react";

interface Script {
    id: string;
    title: string;
    created_at: string;
}

interface ReturningUserHubProps {
    profile: {
        credits: number;
        youtube_channel_name?: string;
    } | null;
    recentScripts: Script[];
    disconnectYoutubeChannel: () => void;
    disconnectingYoutube: boolean;
}

export function ReturningUserHub({
    profile,
    recentScripts,
    disconnectYoutubeChannel,
    disconnectingYoutube,
}: ReturningUserHubProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,

        },
    };

    return (
        <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="lg:col-span-2 space-y-8">
                <motion.div variants={itemVariants} transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                }
                }>
                    <Link href="/dashboard/scripts/new">
                        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 hover:shadow-xl transition-shadow border-2 border-slate-900/10 dark:border-white/10">
                            <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:justify-between">
                                <div className="text-center sm:text-left">
                                    <CardTitle className="text-2xl mb-2">Create a New Script</CardTitle>
                                    <CardDescription>Use your personalized AI to generate your next viral video script.</CardDescription>
                                </div>
                                <Button size="lg" className="mt-4 sm:mt-0 gap-2 shrink-0 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900">
                                    <Sparkles className="h-5 w-5" />
                                    Start Creating
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>


                <motion.div variants={itemVariants} transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                }
                }>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold tracking-tight">Recent Scripts</h2>
                        <Link href="/dashboard/scripts">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    {recentScripts.length > 0 ? (
                        <Card>
                            <Table>
                                {/* Hide the traditional header on mobile */}
                                <TableHeader className="hidden md:table-header-group">
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="w-[150px] text-right">Created</TableHead>
                                        <TableHead className="w-[100px] text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {recentScripts.map((script, i) => (
                                        <motion.tr
                                            key={script.id}
                                            custom={i}
                                            className="block border-b p-4 md:table-row md:border-b md:p-0"
                                        >
                                            <TableCell className="block font-medium md:table-cell">
                                                <span className=" inline-block font-bold md:hidden">Title: </span>
                                                {script.title}
                                            </TableCell>

                                            <TableCell className="block text-right text-slate-500 dark:text-slate-400 md:table-cell">
                                                <span className="float-left mb-1 font-bold text-foreground md:hidden">Created: </span>
                                                {new Date(script.created_at).toLocaleDateString()}
                                            </TableCell>

                                            <TableCell className="block text-right md:table-cell">
                                                <Link href={`/dashboard/scripts/${script.id}`}>
                                                    <Button size="sm" variant="outline" className="mt-4 w-full md:mt-0 md:w-auto">
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>

                    ) : (
                        <Link href="/dashboard/scripts/new">
                            <Card className="border-2 border-dashed hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                    <h3 className="font-semibold text-lg mb-2">No scripts yet</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Click here to create your first script.</p>
                                </CardContent>
                            </Card>
                        </Link>
                    )}
                </motion.div>
            </div>

            <motion.div className="lg:col-span-1 space-y-6" variants={itemVariants} transition={{
                duration: 0.5,
                ease: "easeInOut",
            }
            }>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Available Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{profile?.credits || 0}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used for script & content generation.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Youtube className="h-4 w-4" /> YouTube Connection
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="py-1 px-2.5 text-green-600 border-green-600/50 bg-green-500/10">
                                <div className="h-2 w-2 mr-2 rounded-full bg-green-500"></div>
                                Connected
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                                onClick={disconnectYoutubeChannel}
                                disabled={disconnectingYoutube}
                            >
                                {disconnectingYoutube ? "Disconnecting..." : "Disconnect"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Subscription</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Free Plan</div>
                        <Link href="#upgrade">
                            <Button variant="outline" className="mt-3 w-full">
                                Upgrade to Pro
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}