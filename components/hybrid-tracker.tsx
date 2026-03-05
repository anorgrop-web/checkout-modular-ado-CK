"use client"

import { useEffect, useRef } from "react"
import * as fpixel from "@/lib/fpixel"

interface UserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
}

interface HybridTrackerProps {
  event: string
  data?: Record<string, unknown>
  userData?: UserData // Optional user data for better matching
  trigger?: "onMount" | "manual"
  eventId?: string // Optional custom event ID for deduplication (e.g., payment intent ID)
}

export function HybridTracker({ event, data = {}, userData, trigger = "onMount", eventId }: HybridTrackerProps) {
  const hasFired = useRef(false)

  useEffect(() => {
    if (trigger !== "onMount" || hasFired.current) return

    const trackEvent = async () => {
      const finalEventId = eventId || crypto.randomUUID()

      // 1. Fire browser pixel event
      fpixel.event(event, data, finalEventId)

      // 2. Send to server-side CAPI via our API route
      try {
        await fetch("/api/fb-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventName: event,
            eventId: finalEventId,
            eventData: data,
            url: window.location.href,
            userData, // Include user data for better matching
          }),
        })
      } catch (error) {
        console.error("[HybridTracker] Failed to send server event:", error)
      }
    }

    trackEvent()
    hasFired.current = true
  }, [event, data, userData, trigger, eventId])

  return null
}

export async function trackHybridEvent(
  event: string,
  data: Record<string, unknown> = {},
  userData?: UserData,
  eventId?: string, // Optional custom event ID for deduplication (e.g., payment intent ID)
): Promise<void> {
  const finalEventId = eventId || crypto.randomUUID()

  // Fire browser pixel
  fpixel.event(event, data, finalEventId)

  // Send to server
  try {
    await fetch("/api/fb-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: event,
        eventId: finalEventId,
        eventData: data,
        url: window.location.href,
        userData,
      }),
    })
  } catch (error) {
    console.error("[trackHybridEvent] Failed to send server event:", error)
  }
}
