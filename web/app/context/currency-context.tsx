'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Currency options with symbols and flags
export const currencies = [
  { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', flag: '🇨🇳', name: 'Chinese Yuan' },
  { code: 'CAD', symbol: '$', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', flag: '🇨🇭', name: 'Swiss Franc' },
  { code: 'KRW', symbol: '₩', flag: '🇰🇷', name: 'South Korean Won' },
  { code: 'SGD', symbol: '$', flag: '🇸🇬', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: '$', flag: '🇭🇰', name: 'Hong Kong Dollar' },
]

export type Currency = {
  code: string
  symbol: string
  flag: string
  name: string
}

type CurrencyContextType = {
  currency: Currency
  setCurrency: (currency: Currency) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('currency')
      return savedCurrency ? JSON.parse(savedCurrency) : currencies[0]
    }
    return currencies[0]
  })

  useEffect(() => {
    const handleStorageChange = () => {
      const savedCurrency = localStorage.getItem('currency')
      if (savedCurrency) {
        setCurrency(JSON.parse(savedCurrency))
      }
    }

    window.addEventListener('currencyChange', handleStorageChange)
    return () => {
      window.removeEventListener('currencyChange', handleStorageChange)
    }
  }, [])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
