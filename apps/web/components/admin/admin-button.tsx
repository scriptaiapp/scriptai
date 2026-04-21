import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const adminButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "shadow-lg",
        secondary: "border",
        tertiary: "",
      },
      tone: {
        default: "",
        success: "",
        danger: "",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-8 w-8 p-0",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        tone: "default",
        class:
          "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-900/30 hover:from-purple-500 hover:to-pink-500 focus-visible:ring-purple-400",
      },
      {
        variant: "primary",
        tone: "success",
        class:
          "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-900/30 hover:from-emerald-500 hover:to-green-500 focus-visible:ring-emerald-400",
      },
      {
        variant: "primary",
        tone: "danger",
        class:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-900/30 hover:from-red-500 hover:to-rose-500 focus-visible:ring-red-400",
      },
      {
        variant: "secondary",
        tone: "default",
        class:
          "bg-slate-800/80 border-slate-700 text-slate-100 hover:bg-slate-700/80 hover:border-slate-600 focus-visible:ring-slate-500",
      },
      {
        variant: "secondary",
        tone: "success",
        class:
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 focus-visible:ring-emerald-400",
      },
      {
        variant: "secondary",
        tone: "danger",
        class:
          "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 focus-visible:ring-red-400",
      },
      {
        variant: "tertiary",
        tone: "default",
        class:
          "text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 focus-visible:ring-slate-600",
      },
      {
        variant: "tertiary",
        tone: "success",
        class:
          "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 focus-visible:ring-emerald-500",
      },
      {
        variant: "tertiary",
        tone: "danger",
        class:
          "text-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-red-500",
      },
    ],
    defaultVariants: {
      variant: "primary",
      tone: "default",
      size: "md",
    },
  }
)

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adminButtonVariants> {
  asChild?: boolean
}

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant, tone, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(adminButtonVariants({ variant, tone, size }), className)}
        {...props}
      />
    )
  }
)
AdminButton.displayName = "AdminButton"

export { adminButtonVariants }
