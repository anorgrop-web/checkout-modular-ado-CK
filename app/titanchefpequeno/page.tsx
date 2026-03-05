"use client"

import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import { TitanchefHeader } from "@/components/checkout/titanchef/header"
import { TitanchefHeroBanner } from "@/components/checkout/titanchef/hero-banner"
import { PersonalInfoForm } from "@/components/checkout/personal-info-form"
import { ShippingAddressForm } from "@/components/checkout/shipping-address-form"
import { TitanchefPaymentForm } from "@/components/checkout/titanchef/payment-form"
import { TitanchefOrderSummary } from "@/components/checkout/titanchef/order-summary"
import { TrustBadges } from "@/components/checkout/trust-badges"
import { TitanchefFooter } from "@/components/checkout/titanchef/footer"
import { HybridTracker } from "@/components/hybrid-tracker"
import { sendGAEvent } from "@next/third-parties/google"
import { fetchCep } from "@/lib/cep-service"
import { PixDiscountProvider } from "@/contexts/pix-discount-context"


const PRODUCT_CONFIG = {
  title: "Tábua de Titânio Titanchef - Tamanho pequeno 25cm X 15cm",
  image:
    "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/kat/lp/modal/ChatGPT%20Image%2027%20de%20ago.%20de%202025%2C%2010_50_13%20%282%29.png",
  price: 59.9,
}

export interface PersonalInfo {
  email: string
  nome: string
  cpf: string
  celular: string
}

export interface AddressInfo {
  cep: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  estado: string
  cidade: string
}

function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function maskCelular(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ""
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export default function TitanchefPequenoPage() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: "",
    nome: "",
    cpf: "",
    celular: "",
  })

  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    estado: "",
    cidade: "",
  })

  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [addressLoaded, setAddressLoaded] = useState(false)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const numeroRef = useRef<HTMLInputElement>(null)

  const handlePersonalInfoChange = useCallback((field: keyof PersonalInfo, value: string) => {
    let maskedValue = value
    if (field === "cpf") maskedValue = maskCPF(value)
    if (field === "celular") maskedValue = maskCelular(value)
    setPersonalInfo((prev) => ({ ...prev, [field]: maskedValue }))
  }, [])

  const handleCepChange = useCallback(async (value: string) => {
    const masked = maskCEP(value)
    setAddressInfo((prev) => ({ ...prev, cep: masked }))
    setCepError(null)

    const digits = value.replace(/\D/g, "")
    if (digits.length === 8) {
      setIsLoadingCEP(true)
      try {
        const result = await fetchCep(digits)

        if (!result.success) {
          if (result.error === "not_found") {
            setCepError("CEP não encontrado")
          } else if (result.error === "timeout") {
            setCepError("Tempo esgotado. Tente novamente.")
          } else {
            setCepError("Erro ao buscar CEP. Tente novamente.")
          }
          setAddressLoaded(false)
          return
        }

        if (result.data) {
          setAddressInfo((prev) => ({
            ...prev,
            endereco: result.data!.logradouro || "",
            bairro: result.data!.bairro || "",
            cidade: result.data!.localidade || "",
            estado: result.data!.uf || "",
          }))
          setAddressLoaded(true)

          setTimeout(() => numeroRef.current?.focus(), 100)
        }
      } catch {
        setCepError("Erro ao buscar CEP. Tente novamente.")
        setAddressLoaded(false)
      } finally {
        setIsLoadingCEP(false)
      }
    } else {
      setAddressLoaded(false)
    }
  }, [])

  const handleAddressChange = useCallback((field: keyof AddressInfo, value: string) => {
    setAddressInfo((prev) => ({ ...prev, [field]: value }))
  }, [])

  const isPersonalInfoComplete = useCallback(() => {
    const { email, nome, cpf, celular } = personalInfo
    const emailValid = email.includes("@") && email.includes(".")
    const cpfValid = cpf.replace(/\D/g, "").length === 11
    const celularValid = celular.replace(/\D/g, "").length >= 10
    return emailValid && nome.trim().length > 2 && cpfValid && celularValid
  }, [personalInfo])

  const isShippingComplete = addressLoaded && selectedShipping !== null

  const showPayment = isPersonalInfoComplete() && isShippingComplete

  const totalAmount = useMemo(() => {
    const shippingCosts: Record<string, number> = {
      pac: 0,
      jadlog: 14.98,
      sedex: 24.98,
    }
    const shippingCost = selectedShipping ? shippingCosts[selectedShipping] || 0 : 0
    return PRODUCT_CONFIG.price + shippingCost
  }, [selectedShipping])

  useEffect(() => {
    sendGAEvent("event", "begin_checkout", {
      currency: "BRL",
      value: PRODUCT_CONFIG.price,
      items: [
        {
          item_name: PRODUCT_CONFIG.title,
          item_id: "tabua-pequena-titanchef",
          price: PRODUCT_CONFIG.price,
        },
      ],
    })
  }, [])

  return (
    <PixDiscountProvider>
      <div className="min-h-screen bg-[#f4f6f8]">
        <HybridTracker
          event="InitiateCheckout"
          data={{
            value: PRODUCT_CONFIG.price,
            currency: "BRL",
            content_name: PRODUCT_CONFIG.title,
            content_ids: ["tabua-pequena-titanchef"],
            content_type: "product",
          }}
        />
        <TitanchefHeader />

        <main className="mx-auto max-w-7xl px-4 py-6">
          <TitanchefHeroBanner />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <PersonalInfoForm personalInfo={personalInfo} onFieldChange={handlePersonalInfoChange} />
              <ShippingAddressForm
                addressInfo={addressInfo}
                onCepChange={handleCepChange}
                onFieldChange={handleAddressChange}
                selectedShipping={selectedShipping}
                onShippingChange={setSelectedShipping}
                addressLoaded={addressLoaded}
                isLoadingCEP={isLoadingCEP}
                cepError={cepError}
                numeroRef={numeroRef}
              />
              <TitanchefPaymentForm
                visible={showPayment}
                totalAmount={totalAmount}
                personalInfo={personalInfo}
                addressInfo={addressInfo}
              />
            </div>

            <div className="space-y-6">
              <TitanchefOrderSummary
                selectedShipping={selectedShipping}
                productTitle={PRODUCT_CONFIG.title}
                productImage={PRODUCT_CONFIG.image}
                productPrice={PRODUCT_CONFIG.price}
              />
              <TrustBadges />
            </div>
          </div>
        </main>

        <TitanchefFooter />
      </div>
    </PixDiscountProvider>
  )
}
