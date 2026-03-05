import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { FacebookPixel } from "@/components/facebook-pixel"
import { GoogleAnalytics } from "@next/third-parties/google"
import { GoogleAdsGtag } from "@/components/google-ads-gtag"
import Script from "next/script"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Updated metadata for checkout page
export const metadata: Metadata = {
  title: "Checkout - TitanChef",
  description: "Finalize sua compra de tábuas de titânio TitanChef",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <Script
        src="https://assets.cambioreal.com/card-hash.min.js"
        strategy="beforeInteractive"
      />
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "ujym7r8xi1");
        `}
      </Script>
      <body className={`font-sans antialiased`}>
        <Suspense fallback={null}>
          <GoogleAdsGtag />
        </Suspense>
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <GoogleAnalytics gaId="G-YKD5QZVEHQ" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
