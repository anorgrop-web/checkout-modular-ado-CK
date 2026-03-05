"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Copy, Check, Smartphone, QrCode, CreditCard } from "lucide-react"
import { Footer } from "@/components/checkout/footer"
import { HybridTracker } from "@/components/hybrid-tracker"
import { sendGoogleAdsConversion } from "@/lib/google-ads"
import { sendGA4PurchaseEvent } from "@/lib/ga4-events"

const paymentMethods = [
  { name: "Mastercard", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-mastercard.svg" },
  { name: "Visa", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-visa.svg" },
  { name: "Amex", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/amex.Csr7hRoy.svg" },
  { name: "Diners", logo: "/diners-club-card-logo.jpg" },
  { name: "Discover", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-discover.svg" },
  { name: "Elo", logo: "/elo-card-logo-brazil.jpg" },
  { name: "Aura", logo: "/aura-card-logo-brazil-orange.jpg" },
  { name: "Hipercard", logo: "/hipercard-logo-brazil-red.jpg" },
  { name: "Pix", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-pix.svg" },
  { name: "Boleto", logo: "/boleto-barcode-icon.jpg" },
]

export default function PixPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [expirationTime, setExpirationTime] = useState<string>("")
  const [expirationDate, setExpirationDate] = useState<string>("")
  const [isExpired, setIsExpired] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const hasTrackedPurchase = useRef(false)

  const pixCode = searchParams.get("code") || ""
  const qrCodeUrl = searchParams.get("qr") || ""
  const amount = searchParams.get("amount") || "0"
  const expiresAt = searchParams.get("expires") || ""
  const paymentIntentId = searchParams.get("pi") || ""

  const customerName = searchParams.get("name") || ""
  const customerEmail = searchParams.get("email") || ""
  const customerPhone = searchParams.get("phone") || ""
  const customerAddress = searchParams.get("address") || ""
  const customerCity = searchParams.get("city") || ""
  const customerState = searchParams.get("state") || ""
  const customerCep = searchParams.get("cep") || ""

  const formattedAmount = Number.parseFloat(amount).toFixed(2).replace(".", ",")

  useEffect(() => {
    if (paymentIntentId && amount && !hasTrackedPurchase.current) {
      hasTrackedPurchase.current = true

      sendGA4PurchaseEvent({
        transaction_id: paymentIntentId,
        value: Number.parseFloat(amount),
        payment_type: "pix",
        items: [
          {
            item_id: "tabua-titanio",
            item_name: "Tábua de Titânio TitanChef",
            price: Number.parseFloat(amount),
            quantity: 1,
            item_brand: "TitanChef",
            item_category: "Utensílios de Cozinha",
          },
        ],
      })

      sendGoogleAdsConversion({
        value: Number.parseFloat(amount),
        transaction_id: paymentIntentId,
      })
    }
  }, [paymentIntentId, amount])

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentIntentId) return

    try {
      const response = await fetch(`/api/check-payment-status?paymentIntentId=${paymentIntentId}`)
      const data = await response.json()

      if (data.paid) {
        const successParams = new URLSearchParams({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
          city: customerCity,
          state: customerState,
          cep: customerCep,
          method: "pix",
          amount: amount,
        })
        router.push(`/success?${successParams.toString()}`)
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    }
  }, [
    paymentIntentId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    customerCity,
    customerState,
    customerCep,
    amount,
    router,
  ])

  useEffect(() => {
    if (!paymentIntentId) return

    const interval = setInterval(checkPaymentStatus, 3000)

    checkPaymentStatus()

    return () => clearInterval(interval)
  }, [paymentIntentId, checkPaymentStatus])

  useEffect(() => {
    if (expiresAt) {
      const expirationTimestamp = Number.parseInt(expiresAt) * 1000
      const expirationDateObj = new Date(expirationTimestamp)

      const hours = expirationDateObj.getHours().toString().padStart(2, "0")
      const minutes = expirationDateObj.getMinutes().toString().padStart(2, "0")
      const day = expirationDateObj.getDate().toString().padStart(2, "0")
      const month = (expirationDateObj.getMonth() + 1).toString().padStart(2, "0")
      const year = expirationDateObj.getFullYear()

      setExpirationTime(`${hours}:${minutes}`)
      setExpirationDate(`${day}/${month}/${year}`)

      const countdownInterval = setInterval(() => {
        const now = Date.now()
        const remaining = expirationTimestamp - now

        if (remaining <= 0) {
          setIsExpired(true)
          setTimeRemaining("Expirado")
          clearInterval(countdownInterval)
        } else {
          const mins = Math.floor(remaining / 60000)
          const secs = Math.floor((remaining % 60000) / 1000)
          setTimeRemaining(`${mins}:${secs.toString().padStart(2, "0")}`)
        }
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [expiresAt])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <HybridTracker
        event="Purchase"
        eventId={paymentIntentId}
        data={{
          value: Number.parseFloat(amount),
          currency: "BRL",
          payment_method: "pix",
        }}
      />

      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Image
            src="/titanchef-logo.jpg"
            alt="TitanChef"
            width={60}
            height={40}
            className="h-10 w-auto"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="bg-white rounded-lg p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Seu pedido já é quase seu...</h1>

          <p className="text-sm md:text-base mb-8">
            <span className="text-yellow-600 font-medium">
              Você tem até {expirationTime} de hoje ({expirationDate})
            </span>{" "}
            para efetuar o pagamento, ou seu pedido será cancelado e{" "}
            <strong>
              por se tratar de um preço promocional não podemos garantir que o valor atual será mantido após expiração
              do pix.
            </strong>
          </p>

          {isExpired && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">
                Este código PIX expirou. Por favor, retorne ao checkout e gere um novo código.
              </p>
              <a href="/" className="inline-block mt-3 text-sm text-red-600 hover:text-red-800 underline">
                Voltar ao checkout
              </a>
            </div>
          )}

          <div className="hidden md:grid md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center">
              <p className="text-sm font-medium text-gray-700 mb-4">Aponte a câmera do seu celular</p>

              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="QR Code PIX"
                  width={180}
                  height={180}
                  className="mb-4"
                  unoptimized
                />
              ) : (
                <div className="w-44 h-44 bg-gray-200 flex items-center justify-center mb-4 rounded">
                  <QrCode className="w-20 h-20 text-gray-400" />
                </div>
              )}

              <p className="text-base text-gray-600 mb-1">Valor do Pix:</p>
              <p className="text-2xl font-bold text-green-600 mb-4">{formattedAmount}</p>

              <div className="border-2 border-dashed border-yellow-400 rounded-full px-6 py-2 bg-yellow-50">
                <span className="text-yellow-600 font-medium text-sm">
                  {isExpired ? "PIX Expirado" : `Aguardando Pagamento ... ${timeRemaining}`}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-6">Como pagar o pix:</h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-700 pt-1">
                    1. Abra o app do seu banco ou instituição financeira e entre no ambiente Pix
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-700 pt-1">2. Escolha a opção pagar com QR Code e escaneie o código ao lado</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-700 pt-1">3º - Vá até a opção PIX</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">Código do Pix:</p>
                  <p className="text-sm text-gray-700 truncate">{pixCode}</p>
                </div>
                <button
                  onClick={handleCopyCode}
                  disabled={isExpired}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold px-6 py-4 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      COPIADO
                    </>
                  ) : (
                    <>COPIAR CÓDIGO</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <div className="text-center mb-6">
              <p className="text-base text-gray-600 mb-1">Valor do Pix:</p>
              <p className="text-3xl font-bold text-green-600 mb-4">{formattedAmount}</p>

              <div className="inline-block border-2 border-dashed border-yellow-400 rounded-full px-6 py-2 bg-yellow-50">
                <span className="text-yellow-600 font-medium text-sm">
                  {isExpired ? "PIX Expirado" : `Aguardando Pagamento ... ${timeRemaining}`}
                </span>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-center text-gray-600 mb-2">Código do Pix:</p>
              <p className="text-center text-sm text-gray-700 break-all mb-4">{pixCode}</p>

              <button
                onClick={handleCopyCode}
                disabled={isExpired}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    COPIADO!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    COPIAR CÓDIGO
                  </>
                )}
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Como pagar o pix:</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 pt-1">
                    1. Abra o app do seu banco ou instituição financeira e entre no ambiente Pix
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 pt-1">
                    2. Escolha a opção pagar com QR Code e escaneie o código ao lado
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 pt-1">3º - Vá até a opção PIX</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-gray-500 font-medium">OU</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <p className="text-sm font-medium text-gray-700 mb-4">Aponte a câmera do seu celular</p>

              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="QR Code PIX"
                  width={200}
                  height={200}
                  className="mx-auto"
                  unoptimized
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center mx-auto rounded">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
