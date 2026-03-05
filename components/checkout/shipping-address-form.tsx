"use client"

import type React from "react"
import { Truck, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { AddressInfo } from "@/app/page"
import { sendGAEvent } from "@next/third-parties/google"

interface ShippingAddressFormProps {
  addressInfo: AddressInfo
  onCepChange: (value: string) => void
  onFieldChange: (field: keyof AddressInfo, value: string) => void
  selectedShipping: string | null
  onShippingChange: (shippingId: string) => void
  addressLoaded: boolean
  isLoadingCEP: boolean
  cepError: string | null
  numeroRef: React.RefObject<HTMLInputElement>
}

const shippingOptions = [
  {
    id: "pac",
    name: "Correios PAC",
    deliveryTime: "8 a 12 dias",
    price: 0,
    logo: "correios",
  },
  {
    id: "jadlog",
    name: "Jadlog",
    deliveryTime: "8 a 10 dias",
    price: 14.98,
    logo: "jadlog",
  },
  {
    id: "sedex",
    name: "Correios Sedex",
    deliveryTime: "4 a 7 dias",
    price: 24.98,
    logo: "correios",
  },
]

const handleShippingSelection = (optionId: string, onShippingChange: (shippingId: string) => void) => {
  const selectedOption = shippingOptions.find((opt) => opt.id === optionId)
  if (selectedOption) {
    sendGAEvent("event", "add_shipping_info", {
      shipping_tier: selectedOption.name,
      currency: "BRL",
    })
  }
  onShippingChange(optionId)
}

export function ShippingAddressForm({
  addressInfo,
  onCepChange,
  onFieldChange,
  selectedShipping,
  onShippingChange,
  addressLoaded,
  isLoadingCEP,
  cepError,
  numeroRef,
}: ShippingAddressFormProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Truck className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Endereço de Entrega</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {addressLoaded
              ? "Agora precisamos do seu endereço para entrega."
              : "Para calcular o frete é necessário preencher todos os campos acima."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cep" className="text-sm font-medium text-gray-700">
            CEP
          </Label>
          <div className="relative">
            <Input
              id="cep"
              type="text"
              placeholder="00000-000"
              value={addressInfo.cep}
              onChange={(e) => onCepChange(e.target.value)}
              className={cn(
                "mt-1.5 h-12 rounded-lg text-sm placeholder:text-gray-400",
                cepError ? "border-green-500 bg-red-50 border-2" : "border-gray-200 bg-gray-50",
              )}
            />
            {isLoadingCEP && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400 mt-0.5" />
            )}
          </div>
          {cepError && <p className="mt-1.5 text-sm text-red-500">{cepError}</p>}
          {!addressLoaded && !cepError && (
            <p className="mt-2 text-sm text-gray-500">Preencha suas informações de entrega para continuar.</p>
          )}
        </div>

        {addressLoaded && (
          <>
            <div>
              <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                Endereço
              </Label>
              <Input
                id="endereco"
                type="text"
                placeholder="Rua, Avenida, etc."
                value={addressInfo.endereco}
                onChange={(e) => onFieldChange("endereco", e.target.value)}
                className="mt-1.5 h-12 rounded-lg border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
                  Número
                </Label>
                <Input
                  ref={numeroRef}
                  id="numero"
                  type="text"
                  placeholder="Nº"
                  value={addressInfo.numero}
                  onChange={(e) => onFieldChange("numero", e.target.value)}
                  className="mt-1.5 h-12 rounded-lg border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="complemento" className="text-sm font-medium text-gray-700">
                  Complemento
                </Label>
                <Input
                  id="complemento"
                  type="text"
                  placeholder="Apartamento, casa, loja..."
                  value={addressInfo.complemento}
                  onChange={(e) => onFieldChange("complemento", e.target.value)}
                  className="mt-1.5 h-12 rounded-lg border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bairro" className="text-sm font-medium text-gray-700">
                Bairro
              </Label>
              <Input
                id="bairro"
                type="text"
                placeholder="Bairro"
                value={addressInfo.bairro}
                onChange={(e) => onFieldChange("bairro", e.target.value)}
                className="mt-1.5 h-12 rounded-lg border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                  Estado
                </Label>
                <Input
                  id="estado"
                  type="text"
                  placeholder="UF"
                  value={addressInfo.estado}
                  onChange={(e) => onFieldChange("estado", e.target.value)}
                  className="mt-1.5 h-12 rounded-lg border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  type="text"
                  placeholder="Cidade"
                  value={addressInfo.cidade}
                  onChange={(e) => onFieldChange("cidade", e.target.value)}
                  className="mt-1.5 h-12 rounded-lg border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-4">Forma de Envio</h3>
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedShipping === option.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping === option.id}
                        onChange={() => handleShippingSelection(option.id, onShippingChange)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{option.name}</p>
                        <p className="text-xs text-gray-500">{option.deliveryTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-16 flex items-center justify-center">
                        {option.logo === "correios" ? (
                          <Image
                            src="https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/correios.png"
                            alt="Correios"
                            width={50}
                            height={20}
                            className="object-contain"
                          />
                        ) : (
                          <Image
                            src="https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/Group%201102.png"
                            alt="Jadlog"
                            width={50}
                            height={20}
                            className="object-contain"
                          />
                        )}
                      </div>
                      <span
                        className={cn("text-sm font-semibold", option.price === 0 ? "text-green-600" : "text-gray-900")}
                      >
                        {option.price === 0 ? "Grátis" : `R$ ${option.price.toFixed(2).replace(".", ",")}`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
