import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSettingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Skeleton for Avatar */}
            <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>

            {/* Skeleton for Name Input */}
            <div className="space-y-1.5">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 max-w-sm" />
            </div>

            {/* Skeleton for Email Input */}
            <div className="space-y-1.5">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 max-w-sm" />
            </div>

            {/* Skeleton for Language Select */}
            <div className="space-y-1.5">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 max-w-sm" />
            </div>

            {/* Skeleton for Security Section */}
            <div className="border-t border-border pt-6 space-y-3">
                <Skeleton className="h-4 w-[80px]" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-3 w-[250px]" />
                </div>
            </div>
        </div>
    )
}