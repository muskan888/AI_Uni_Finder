
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5",
        outline:
          "border border-input bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent/10 hover:border-accent/50 hover:text-accent hover:shadow-md hover:-translate-y-0.5",
        secondary:
          "bg-secondary/50 text-secondary-foreground backdrop-blur-sm shadow-sm hover:bg-secondary/60 hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-accent/10 hover:text-accent",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "bg-primary/20 text-primary backdrop-blur-sm shadow-sm hover:bg-primary/30 hover:shadow-md hover:-translate-y-0.5",
        crystal: "bg-white/80 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/90 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 dark:bg-white/10 dark:border-white/10 dark:hover:bg-white/20",
        blue: "bg-[#4682B4] text-white shadow-sm hover:bg-[#4682B4]/90 hover:shadow-md hover:-translate-y-0.5 dark:bg-[#4682B4]/80",
        skyblue: "bg-[#87CEFA]/90 text-foreground shadow-sm hover:bg-[#87CEFA] hover:shadow-md hover:-translate-y-0.5",
        navy: "bg-[#0A2342] text-white shadow-sm hover:bg-[#0A2342]/90 hover:shadow-md hover:-translate-y-0.5 dark:bg-[#0A2342]/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
