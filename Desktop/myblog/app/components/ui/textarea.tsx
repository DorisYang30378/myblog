"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full bg-transparent px-3 py-2 text-sm",
          "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          "!outline-none !ring-0 !ring-offset-0 !border-0",
          "focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus:!border-0",
          "dark:focus:!outline-none dark:focus:!ring-0 dark:focus:!ring-offset-0 dark:focus:!border-0",
          className
        )}
        style={{
          outline: 'none',
          boxShadow: 'none',
          '--tw-ring-offset-width': '0px',
          '--tw-ring-offset-color': 'transparent',
          '--tw-ring-color': 'transparent',
        } as React.CSSProperties}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

