import { type ClassValue as ClassValueImport, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export type ClassValue = ClassValueImport

/** Merge Tailwind classes; later inputs win conflicting utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
