import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(amount)
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Possession":        "var(--color-chart-1)",
  "Foundation":        "var(--color-chart-2)",
  "Cement":            "var(--color-chart-3)",
  "Aggregates":        "var(--color-chart-4)",
  "Bricks":            "var(--color-chart-5)",
  "Steel":             "var(--color-chart-6)",
  "Labour":            "var(--color-chart-7)",
  "Paint":             "var(--color-chart-1)",
  "Electric":          "var(--color-chart-2)",
  "Wood":              "var(--color-chart-3)",
  "Door Frame":        "var(--color-chart-4)",
  "Plumbing":          "var(--color-chart-5)",
  "Watchman Salary":   "var(--color-chart-6)",
}
