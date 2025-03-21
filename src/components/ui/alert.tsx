
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background/70 backdrop-blur-sm text-foreground border-border/50",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: 
          "bg-primary/10 border-primary/30 text-primary backdrop-blur-sm dark:border-primary/50 [&>svg]:text-primary",
        warning:
          "bg-accent/10 border-accent/30 text-accent backdrop-blur-sm dark:border-accent/50 [&>svg]:text-accent",
        info: 
          "bg-secondary/10 border-secondary/30 text-secondary backdrop-blur-sm dark:border-secondary/50 [&>svg]:text-secondary",
        crystal:
          "backdrop-blur-xl bg-white/80 border border-white/40 shadow-md text-foreground crystal-shine",
        celestial:
          "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-foreground backdrop-blur-sm",
        starry:
          "bg-gradient-to-r from-background/90 to-background/80 border-primary/10 text-foreground backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-display font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
