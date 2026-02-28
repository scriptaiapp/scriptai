import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80 rounded-xl" />
            <Skeleton className="h-5 w-56 rounded-lg" />
          </div>
          {/* Inline stats pill */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl">
            <div className="text-center space-y-1.5">
              <Skeleton className="h-7 w-10 mx-auto" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center space-y-1.5">
              <Skeleton className="h-7 w-10 mx-auto" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 12-col Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Metrics Row — 4 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="mb-3">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                  </div>
                  <Skeleton className="h-8 w-12 mb-1.5" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Chart */}
          <Card className="border-none shadow-sm rounded-3xl p-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <Skeleton className="h-[280px] w-full rounded-xl" />
            </CardContent>
          </Card>

          {/* Quick Actions — 4 tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm rounded-2xl">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">

          {/* Premium Upgrade Card */}
          <Card className="rounded-3xl bg-slate-100 dark:bg-slate-800 border-none overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </CardContent>
          </Card>

          {/* Content Mix Card */}
          <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader className="pb-0 pt-6 px-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Donut placeholder */}
                <Skeleton className="h-[180px] w-[180px] rounded-full flex-shrink-0" />
                {/* Legend bars */}
                <div className="flex-1 w-full space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-2.5 w-2.5 rounded-full" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-6" />
                          <Skeleton className="h-4 w-10 rounded-md" />
                        </div>
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YouTube Channel Card */}
          <Card className="border-none shadow-sm rounded-3xl flex-1 flex flex-col p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            {/* Settings block */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 mb-auto space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            {/* Button */}
            <Skeleton className="h-9 w-full rounded-xl mt-4" />
          </Card>
        </div>
      </div>
    </div>
  );
}
