"use client"

import { useEffect, useRef } from "react"
import { HybridTracker } from "@/components/hybrid-tracker"
import { sendGA4PurchaseEvent } from "@/lib/ga4-events"
import { sendGoogleAdsConversion } from "@/lib/google-ads"

interface SuccessTrackerProps {
  value: number
  paymentMethod: string
  transactionId?: string
  productName?: string
}

export function TitanchefSuccessTracker({
  value,
  paymentMethod,
  transactionId,
  productName = "Tábua de Titânio Titanchef",
}: SuccessTrackerProps) {
  const hasFired = useRef(false)
  const finalTransactionId = transactionId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    sendGA4PurchaseEvent({
      transaction_id: finalTransactionId,
      value: value,
      payment_type: paymentMethod,
      items: [
        {
          item_id: "tabua-titanio-titanchef",
          item_name: productName,
          price: value,
          quantity: 1,
          item_brand: "Titanchef",
          item_category: "Utensílios de Cozinha",
        },
      ],
    })

    if (paymentMethod !== "pix") {
      sendGoogleAdsConversion({
        value: value,
        transaction_id: finalTransactionId,
      })
    }
  }, [finalTransactionId, value, paymentMethod, productName])

  if (paymentMethod === "pix") {
    return null
  }

  return (
    <HybridTracker
      event="Purchase"
      data={{
        value,
        currency: "BRL",
        content_type: "product",
        payment_method: paymentMethod,
      }}
    />
  )
}
