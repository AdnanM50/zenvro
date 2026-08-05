import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3.5 py-3 text-base md:text-sm text-gray-900 dark:text-gray-100 transition-[border-color,box-shadow,background-color] outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-gray-300 dark:hover:border-gray-700 focus-visible:border-gray-900 dark:focus-visible:border-white focus-visible:ring-4 focus-visible:ring-gray-900/10 dark:focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:opacity-70 aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/10 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
