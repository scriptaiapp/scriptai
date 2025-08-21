import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

export function ScriptLoaderSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <Skeleton className="h-9 w-1/3 mb-2 bg-slate-200" />
        <Skeleton className="h-5 w-1/2" />
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
                <br />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-1" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-sm" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}