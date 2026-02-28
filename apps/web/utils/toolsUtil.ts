export function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

export const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}


export function parseDuration(iso: string): string {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "";
    const h = parseInt(match[1] || "0", 10);
    const m = parseInt(match[2] || "0", 10);
    const s = parseInt(match[3] || "0", 10);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}


export function timeAgo(dateStr: string): { label: string; style: string } {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86_400_000);


    if (days < 1) return { label: "Today", style: "bg-[#347AF9] text-white shadow-[0_2px_8px_rgba(52,122,249,0.3)]" };
    if (days < 7) return { label: `${days}d ago`, style: "bg-[#347AF9]/10 text-[#347AF9] font-bold" };
    if (days < 30) return { label: `${Math.floor(days / 7)}w ago`, style: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };
    if (days < 365) return { label: `${Math.floor(days / 30)}mo ago`, style: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };
    return { label: `${Math.floor(days / 365)}y ago`, style: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500" };
}

export const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};