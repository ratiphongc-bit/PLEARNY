import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 game-button",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-light shadow-[0_8px_0_0_#5b21b6] hover:shadow-[0_4px_0_0_#5b21b6] active:shadow-none border border-primary-dark/20",
        secondary: "bg-secondary text-white hover:bg-secondary-light shadow-[0_8px_0_0_#0369a1] hover:shadow-[0_4px_0_0_#0369a1] active:shadow-none border border-secondary-dark/20",
        destructive: "bg-accent text-white hover:bg-accent-light shadow-[0_8px_0_0_#be123c] hover:shadow-[0_4px_0_0_#be123c] active:shadow-none",
        gold: "bg-gold text-yellow-950 hover:bg-gold-light shadow-[0_8px_0_0_#d97706] hover:shadow-[0_4px_0_0_#d97706] active:shadow-none",
        outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-[0_8px_0_0_#e2e8f0] hover:shadow-[0_4px_0_0_#e2e8f0] active:shadow-none text-slate-700",
        ghost: "hover:bg-slate-100 text-slate-700 shadow-none hover:shadow-none active:translate-y-0 active:shadow-none game-button-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none hover:shadow-none active:translate-y-0 active:shadow-none",
      },
      size: {
        default: "h-12 px-6 py-2 text-base",
        sm: "h-10 rounded-xl px-4 text-sm",
        lg: "h-16 rounded-3xl px-8 text-xl",
        icon: "h-12 w-12",
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
