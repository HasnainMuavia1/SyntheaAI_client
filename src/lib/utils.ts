import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes safely.
 * Example: cn("px-2 py-1 bg-red-500", "bg-blue-500") -> "px-2 py-1 bg-blue-500"
 * This prevents the "CSS Cascade" headache where styles don't apply.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Simulates a delay (useful for testing loading states without a backend).
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}