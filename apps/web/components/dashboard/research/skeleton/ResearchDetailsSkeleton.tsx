import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResearchDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header Section Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-10 w-1/3 mb-3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary Card Skeleton */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Skeleton className="h-7 w-1/4" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>

                        {/* Accordion Skeletons */}
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <AccordionItem value="item-1" className="border rounded-lg bg-white shadow-sm">
                                <AccordionTrigger className="p-4">
                                    <Skeleton className="h-6 w-1/5" />
                                </AccordionTrigger>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border rounded-lg bg-white shadow-sm">
                                <AccordionTrigger className="p-4">
                                    <Skeleton className="h-6 w-1/4" />
                                </AccordionTrigger>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="border rounded-lg bg-white shadow-sm">
                                <AccordionTrigger className="p-4">
                                    <Skeleton className="h-6 w-1/3" />
                                </AccordionTrigger>
                            </AccordionItem>
                            <AccordionItem value="item-4" className="border rounded-lg bg-white shadow-sm">
                                <AccordionTrigger className="p-4">
                                    <Skeleton className="h-6 w-1/4" />
                                </AccordionTrigger>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Skeleton className="h-7 w-1/2" />
                                </CardTitle>
                                <CardDescription>
                                    <Skeleton className="h-4 w-1/3" />
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}