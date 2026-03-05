"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface PixDiscountContextType {
  pixDiscountApplied: boolean
  setPixDiscountApplied: (value: boolean) => void
  discountPercentage: number
}

const PixDiscountContext = createContext<PixDiscountContextType | undefined>(undefined)

export function PixDiscountProvider({ children }: { children: ReactNode }) {
  const [pixDiscountApplied, setPixDiscountApplied] = useState(false)
  const discountPercentage = 0.05 // 5% de desconto

  return (
    <PixDiscountContext.Provider value={{ pixDiscountApplied, setPixDiscountApplied, discountPercentage }}>
      {children}
    </PixDiscountContext.Provider>
  )
}

export function usePixDiscount() {
  const context = useContext(PixDiscountContext)
  if (context === undefined) {
    throw new Error("usePixDiscount must be used within a PixDiscountProvider")
  }
  return context
}
