import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded border border-gray-200 bg-white px-3.5 py-3 text-base text-gray-900  transition-[border-color,box-shadow,background-color] outline-none placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-gray-900 focus-visible:ring-4 focus-visible:ring-white disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:opacity-70 aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/10 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
