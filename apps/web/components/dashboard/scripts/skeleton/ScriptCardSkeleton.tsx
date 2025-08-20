export default function ScriptCardSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 animate-pulse">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}