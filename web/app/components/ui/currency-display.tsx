'use client'

import { useCurrency } from '@/context/currency-context'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface CurrencyDisplayProps {
  amount: number
  className?: string
  showSymbol?: boolean
  format?: boolean
}

export function CurrencyDisplay({ 
  amount, 
  className, 
  showSymbol = true,
  format = true 
}: CurrencyDisplayProps) {
  const { currency } = useCurrency()
  
  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(currency))
  }, [currency])

  const formattedAmount = format 
    ? new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    : amount.toString()

  return (
    <span className={cn('whitespace-nowrap', className)}>
      {showSymbol && <span>{currency.symbol}</span>}
      {formattedAmount}
    </span>
  )
}