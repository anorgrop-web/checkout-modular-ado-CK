import { sendGAEvent } from "@next/third-parties/google"

interface PurchaseItem {
  item_id: string
  item_name: string
  price: number
  quantity: number
  item_category?: string
  item_brand?: string
}

interface PurchaseEventData {
  transaction_id: string
  value: number
  currency?: string
  payment_type?: string
  items?: PurchaseItem[]
  coupon?: string
  shipping?: number
  tax?: number
}

// Evento de compra otimizado para Google Ads
export function sendGA4PurchaseEvent({
  transaction_id,
  value,
  currency = "BRL",
  payment_type,
  items,
  coupon,
  shipping = 0,
  tax = 0,
}: PurchaseEventData) {
  if (typeof window === "undefined") return

  // Evento purchase padrão do GA4 (recomendado para conversões Google Ads)
  sendGAEvent("event", "purchase", {
    transaction_id,
    value,
    currency,
    payment_type,
    items: items || [
      {
        item_id: "tabua-titanio",
        item_name: "Tábua de Titânio TitanChef",
        price: value,
        quantity: 1,
        item_brand: "TitanChef",
        item_category: "Utensílios de Cozinha",
      },
    ],
    coupon,
    shipping,
    tax,
  })

  // Evento de conversão adicional para Google Ads (se gtag estiver disponível)
  if (window.gtag) {
    window.gtag("event", "conversion", {
      send_to: "AW-CONVERSION_ID/CONVERSION_LABEL", // Será substituído pelo ID real se configurado
      value,
      currency,
      transaction_id,
    })
  }
}

// Evento de início de checkout
export function sendGA4BeginCheckoutEvent(value: number, items?: PurchaseItem[]) {
  if (typeof window === "undefined") return

  sendGAEvent("event", "begin_checkout", {
    value,
    currency: "BRL",
    items: items || [
      {
        item_id: "tabua-titanio",
        item_name: "Tábua de Titânio TitanChef",
        price: value,
        quantity: 1,
        item_brand: "TitanChef",
        item_category: "Utensílios de Cozinha",
      },
    ],
  })
}

// Evento de adição de informações de pagamento
export function sendGA4AddPaymentInfoEvent(value: number, payment_type: string) {
  if (typeof window === "undefined") return

  sendGAEvent("event", "add_payment_info", {
    value,
    currency: "BRL",
    payment_type,
  })
}

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void
    dataLayer?: unknown[]
  }
}
