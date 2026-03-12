import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Materials": "var(--color-chart-1)",
  "Labor": "var(--color-chart-2)",
  "Fuel": "var(--color-chart-3)",
  "Equipment Rental": "var(--color-chart-4)",
  "Tools": "var(--color-chart-5)",
  "Permits": "var(--color-chart-6)",
  "Misc": "var(--color-chart-7)",
}
