
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary:
          "border-transparent bg-secondary/30 text-secondary-foreground hover:bg-secondary/40 shadow-sm",
        destructive:
          "border-transparent bg-destructive/70 text-destructive-foreground hover:bg-destructive/60",
        outline: "text-foreground hover:bg-accent/10 hover:text-accent border-border/50",
        accent: "border-transparent bg-accent/30 text-accent-foreground hover:bg-accent/40 shadow-sm",
        crystal: "border border-primary/20 bg-white/70 text-foreground backdrop-blur-sm shadow-sm hover:bg-white/80 hover:border-primary/30 crystal-shine",
        soft: "border-transparent bg-primary/20 text-primary shadow-sm backdrop-blur-sm",
        celestial: "border-transparent bg-gradient-to-r from-primary/40 to-primary/20 text-primary-foreground shadow-sm backdrop-blur-sm",
        muted: "border-transparent bg-muted text-muted-foreground shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
