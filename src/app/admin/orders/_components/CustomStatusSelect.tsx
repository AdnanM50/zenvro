"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StatusOption } from "./order-status.constants";

interface CustomStatusSelectProps<T extends string> {
  value: T;
  options: StatusOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export default function CustomStatusSelect<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: CustomStatusSelectProps<T>) {
  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`inline-block text-left ${className}`}>
      <Select
        value={value}
        onValueChange={(val: string | null) => {
          if (val && val !== value) {
            onChange(val as T);
          }
        }}
      >
        <SelectTrigger
          className={cn(
            "!h-auto !w-auto !py-1.5 !px-3 !rounded-full !text-[10px] !font-black !uppercase !tracking-wider !border !shadow-none !gap-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 [&>svg]:text-current [&>svg]:opacity-70 [&>svg]:size-3.5",
            selectedOption?.badgeClass
          )}
        >
          <SelectValue>
            {selectedOption && (
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0 animate-pulse",
                    selectedOption.dotClass
                  )}
                />
                <span>{selectedOption.label}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          side="bottom"
          align="start"
          alignItemWithTrigger={false}
          sideOffset={6}
          className="!w-auto min-w-[160px] rounded-2xl p-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800 shadow-2xl"
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="rounded-xl py-2 px-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dotClass)} />
                <span className="text-[10px] font-black">{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
