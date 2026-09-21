"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
          selectedOption.badgeClass
        }`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${selectedOption.dotClass}`} />
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 opacity-70 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 min-w-[155px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl border border-gray-200/80 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotClass}`} />
                    <span className="text-[10px] font-black">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
