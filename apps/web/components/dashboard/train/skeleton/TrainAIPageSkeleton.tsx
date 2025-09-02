import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"

export function TrainAIPageSkeleton() {
    return (
        <div className="container py-8 h-full">
            {/* Skeleton for the Header */}
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-start mt-8">

                {/* Skeleton for the Left Panel */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
                    {/* HowItWorks Skeleton */}
                    <Skeleton className="h-12 w-full" />

                    {/* TrainingStatus Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            </div>
                            <div className="pl-[1.1rem]">
                                <div className="border-l-2 border-dashed border-slate-200 dark:border-slate-700 h-6 ml-[0.3rem]"></div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Skeleton for the Right Panel */}
                <div className="lg:col-span-8">
                    <Card>
                        <CardHeader className="p-8">
                            <Skeleton className="h-7 w-1/2" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-8 w-40" />
                        </CardContent>
                        <CardFooter className="flex justify-end p-4">
                            <Skeleton className="h-12 w-32" />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}