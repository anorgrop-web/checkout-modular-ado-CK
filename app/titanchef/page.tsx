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
import { fbEvents } from "@/lib/fb-events"
import { fetchCep } from "@/lib/cep-service"
import { PixDiscountProvider } from "@/contexts/pix-discount-context"


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

export default function TitanchefHome() {
  const [personalInfo, setPersonalInfo] = useState({
    email: "",
    nome: "",
    cpf: "",
    celular: "",
  })

  const [addressInfo, setAddressInfo] = useState({
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

  const handleCEPChange = useCallback(async (value: string) => {
    const masked = value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, "$1-$2")

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
    const productPrice = 89.87
    const shippingCosts: Record<string, number> = {
      pac: 0,
      jadlog: 14.98,
      sedex: 24.98,
    }
    const shippingCost = selectedShipping ? shippingCosts[selectedShipping] || 0 : 0
    return productPrice + shippingCost
  }, [selectedShipping])

  useEffect(() => {
    sendGAEvent("event", "begin_checkout", {
      currency: "BRL",
      value: 89.87,
      items: [
        {
          item_name: "Tábua de Titânio Titanchef - Conjunto com 3",
          item_id: "tabua-conjunto-3-titanchef",
          price: 89.87,
        },
      ],
    })
    fbEvents("InitiateCheckout", {
      value: 89.87,
      currency: "BRL",
      content_name: "Tábua de Titânio Titanchef - Conjunto com 3",
      content_ids: ["tabua-conjunto-3-titanchef"],
      content_type: "product",
    })
  }, [])

  return (
    <PixDiscountProvider>
      <div className="min-h-screen bg-[#f4f6f8] overflow-x-hidden">
        <HybridTracker
          event="InitiateCheckout"
          data={{
            value: 89.87,
            currency: "BRL",
            content_name: "Tábua de Titânio Titanchef - Conjunto com 3",
            content_ids: ["tabua-conjunto-3-titanchef"],
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
                onCepChange={handleCEPChange}
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
              <TitanchefOrderSummary selectedShipping={selectedShipping} />
              <TrustBadges />
            </div>
          </div>
        </main>

        <TitanchefFooter />
      </div>
    </PixDiscountProvider>
  )
}
