import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:justify-between">
                        <div className="space-y-2 text-center sm:text-left">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                        <Skeleton className="h-12 w-40 mt-4 sm:mt-0" />
                    </CardContent>
                </Card>


                <div>
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <Card>
                        <TableSkeleton />
                    </Card>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/3 mb-3" />
                        <Skeleton className="h-9 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="p-4">
            <div className="space-y-3">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-5 w-1/5" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-5 w-1/5" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-5 w-1/5" />
                </div>
            </div>
        </div>
    );
}