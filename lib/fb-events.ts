import { event as fbPixelEvent } from "@/lib/fpixel"

/**
 * Envia eventos para o Facebook Pixel (client-side) e CAPI (server-side)
 * Usa event_id para deduplicação entre os dois
 */
export async function fbEvents(
  eventName: string,
  eventData: Record<string, unknown> = {},
  userData?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
  },
) {
  // Gera um ID único para deduplicação
  const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Envia para o Facebook Pixel (client-side)
  fbPixelEvent(eventName, eventData, eventId)

  // Envia para o CAPI (server-side) via API route
  try {
    await fetch("/api/fb-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        eventId,
        eventData,
        url: typeof window !== "undefined" ? window.location.href : "",
        userData,
      }),
    })
  } catch (error) {
    console.error("[fbEvents] Error sending server event:", error)
  }
}
