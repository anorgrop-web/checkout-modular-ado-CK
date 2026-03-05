// Facebook Pixel ID
export const FB_PIXEL_ID = "736939935257219"

// Extend window to include fbq
declare global {
  interface Window {
    fbq: (
      action: string,
      eventOrPixelId: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string },
    ) => void
    _fbq: unknown
  }
}

// Track page views
export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView")
  }
}

// Track custom events with deduplication support
export const event = (name: string, options: Record<string, unknown> = {}, eventID?: string) => {
  if (typeof window !== "undefined" && window.fbq) {
    if (eventID) {
      window.fbq("track", name, options, { eventID })
    } else {
      window.fbq("track", name, options)
    }
  }
}
