"use client"

import { motion } from "motion/react"
import { Wand } from "lucide-react"

interface ScriptOutputPlaceholderProps {
    loading: boolean
}

export default function ScriptOutputPlaceholder({
    loading,
}: ScriptOutputPlaceholderProps) {
    return (
        <div
            style={{
                backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)",
                backgroundSize: "20px 20px",
            }}
            className="flex flex-col items-center justify-center h-[400px] text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 relative overflow-hidden"
        >
            {loading ? (
                <div className="z-10">
                    <div className="flex items-center justify-center space-x-2">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="h-3 w-3 bg-purple-500 rounded-full"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.2,
                            }}
                            className="h-3 w-3 bg-purple-500 rounded-full"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.4,
                            }}
                            className="h-3 w-3 bg-purple-500 rounded-full"
                        />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium mt-4">
                        Crafting your script...
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                        The AI is warming up
                    </p>
                </div>
            ) : (
                <div className="z-10">
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Wand className="h-12 w-12 text-slate-400 mb-4 mx-auto" />
                    </motion.div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">
                        Ready to create magic?
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs mx-auto">
                        Fill out the form and let the AI assistant bring your ideas to life.
                    </p>
                </div>
            )}
        </div>
    )
}