import * as React from "react"

import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority";

const chipVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "text-foreground",
        admin: "bg-red-100 text-red-800",
        user: "bg-blue-100 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Chip = React.forwardRef(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(chipVariants({ variant, className }))} {...props} />
  )
)
Chip.displayName = "Chip"

export { Chip, chipVariants }
