import { Suspense } from "react"
import { getScripts } from "@/lib/actions/Scripts"
import { Script } from "@/components/dashboard/scripts/Script"
import ContentCardSkeleton from "@/components/dashboard/common/skeleton/ContentCardSkeleton"

export default async function ScriptsPage() {
  // Fetch data on the server
  const scripts = await getScripts()

  return (
      <Suspense fallback={<ContentCardSkeleton />}>
        <Script initialScripts={scripts} />
      </Suspense>
  )
}