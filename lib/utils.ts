import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const icon_color = 'text-default-400'
export const icon_size = 'h-6 w-6'
export const btnClass = "rounded"
export const icon_size_sm = 'h-4 w-4'
export const icon_theme = 'h-6 w-6 text-primary group-hover:text-primary/25'
export const text_icon = "group-hover:text-primary/25 text-primary"