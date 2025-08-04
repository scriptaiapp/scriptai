import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface NextStep {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

interface SuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  nextSteps: NextStep[]
}

export function SuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  nextSteps,
}: SuccessDialogProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            What's Next?
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {nextSteps.map((step, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(step.href)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <step.icon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
                  <div>
                    <CardTitle className="text-sm font-medium">{step.title}</CardTitle>
                    <CardDescription className="text-xs">{step.description}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mt-4"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}