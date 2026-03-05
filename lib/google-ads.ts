export function sendGoogleAdsConversion({
  value,
  transaction_id,
}: {
  value: number
  transaction_id: string
}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: "AW-17857035478/wJ-7CM7025cZENbV-9YC",
      value: value,
      currency: "BRL",
      transaction_id: transaction_id,
    })
  }
}

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void
    dataLayer?: unknown[]
  }
}
