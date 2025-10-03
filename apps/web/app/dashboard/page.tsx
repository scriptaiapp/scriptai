
import { getScripts } from "@/lib/actions/Scripts"
import Dashboard from "@/components/dashboard/main/Dashboard"

export default async function DashboardPage() {
  const scripts = await getScripts()

  return <Dashboard initialScripts={scripts} />
}
