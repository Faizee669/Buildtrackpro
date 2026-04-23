import { createContext, useContext, useState, useCallback } from "react"

export const CURRENCIES = [
  { code: "PKR", label: "PKR", locale: "en-PK", flag: "🇵🇰" },
  { code: "USD", label: "USD", locale: "en-US", flag: "🇺🇸" },
  { code: "INR", label: "INR", locale: "en-IN", flag: "🇮🇳" },
  { code: "EUR", label: "EUR", locale: "de-DE", flag: "🇪🇺" },
  { code: "GBP", label: "GBP", locale: "en-GB", flag: "🇬🇧" },
  { code: "AUD", label: "AUD", locale: "en-AU", flag: "🇦🇺" },
  { code: "CAD", label: "CAD", locale: "en-CA", flag: "🇨🇦" },
  { code: "JPY", label: "JPY", locale: "ja-JP", flag: "🇯🇵" },
  { code: "SGD", label: "SGD", locale: "en-SG", flag: "🇸🇬" },
  { code: "AED", label: "AED", locale: "ar-AE", flag: "🇦🇪" },
  { code: "BRL", label: "BRL", locale: "pt-BR", flag: "🇧🇷" },
  { code: "MXN", label: "MXN", locale: "es-MX", flag: "🇲🇽" },
  { code: "ZAR", label: "ZAR", locale: "en-ZA", flag: "🇿🇦" },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

const STORAGE_KEY = "buildtrack_currency";

function getStoredCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && CURRENCIES.some(c => c.code === stored)) {
      return stored as CurrencyCode;
    }
  } catch {}
  return "PKR";
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  fmt: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "PKR",
  setCurrency: () => {},
  fmt: (n) => `₨${n.toFixed(0)}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getStoredCurrency);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  const fmt = useCallback((amount: number) => {
    const entry = CURRENCIES.find(c => c.code === currency)!;
    return new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(amount);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
