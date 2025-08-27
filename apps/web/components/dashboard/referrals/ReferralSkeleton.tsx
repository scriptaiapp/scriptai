import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"

export function ReferralPageSkeleton() {
    return (
        <div className="container py-8">
            {/* Header Skeleton */}
            <div className="mb-8 space-y-2">
                <Skeleton className="h-9 w-[250px]" />
                <Skeleton className="h-5 w-[350px]" />
            </div>

            {/* User Profile Skeleton */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-[200px]" />
                            <Skeleton className="h-4 w-[220px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[50px] mb-2" />
                            <Skeleton className="h-3 w-[150px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Referral Code Skeleton */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-[180px]" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-[380px] mt-1" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 flex-1" />
                        <Skeleton className="h-10 w-[110px]" />
                    </div>
                </CardContent>
            </Card>

            {/* Referrals Tabs Skeleton */}
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending" disabled>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="completed" disabled>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-[220px]" />
                                            <Skeleton className="h-4 w-[150px]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <Skeleton className="h-6 w-24 rounded-full ml-auto" />
                                        <Skeleton className="h-3 w-28" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
}