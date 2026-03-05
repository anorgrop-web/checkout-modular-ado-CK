"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, Tag } from "lucide-react"
import Image from "next/image"
import { usePixDiscount } from "@/contexts/pix-discount-context"

const SHIPPING_COSTS: Record<string, number> = {
  pac: 0,
  jadlog: 14.98,
  sedex: 24.98,
}

interface OrderSummaryProps {
  selectedShipping: string | null
  productTitle?: string
  productImage?: string
  productPrice?: number
}

const DEFAULT_PRODUCT_TITLE = "Tábua de Titânio TitanChef - Kit Completo 3 tamanhos"
const DEFAULT_PRODUCT_IMAGE =
  "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/kat/lp/modal/Kit%20de%20T%C3%A1buas%20de%20Corte%20%282%29.png"
const DEFAULT_PRODUCT_PRICE = 89.87

export function OrderSummary({
  selectedShipping,
  productTitle = DEFAULT_PRODUCT_TITLE,
  productImage = DEFAULT_PRODUCT_IMAGE,
  productPrice = DEFAULT_PRODUCT_PRICE,
}: OrderSummaryProps) {
  const [quantity, setQuantity] = useState(1)

  const { pixDiscountApplied, discountPercentage } = usePixDiscount()

  const subtotal = productPrice * quantity
  const shippingCost = selectedShipping ? SHIPPING_COSTS[selectedShipping] : 0

  const subtotalWithShipping = subtotal + shippingCost
  const pixDiscountAmount = pixDiscountApplied ? subtotalWithShipping * discountPercentage : 0
  const total = subtotalWithShipping - pixDiscountAmount

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Seu Carrinho</h2>

      {/* Product Card */}
      <div className="flex gap-3 pb-4 border-b border-gray-100">
        <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
          <Image
            src={productImage || "/placeholder.svg"}
            alt={productTitle}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-medium text-gray-900 leading-tight">{productTitle}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{productTitle}</p>
              <p className="text-xs font-semibold text-gray-900 mt-1">R${productPrice.toFixed(2).replace(".", ",")}</p>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-medium text-gray-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-6 w-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {pixDiscountApplied && (
        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">Desconto PIX 5% aplicado!</span>
        </div>
      )}

      {/* Totals */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Produtos</span>
          <span className="text-gray-900">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Frete</span>
          <span className={shippingCost === 0 && selectedShipping ? "text-green-600" : "text-gray-900"}>
            {selectedShipping
              ? shippingCost === 0
                ? "Grátis"
                : `R$ ${shippingCost.toFixed(2).replace(".", ",")}`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Descontos</span>
          <span className={pixDiscountApplied ? "text-green-600 font-medium" : "text-green-600"}>
            {pixDiscountApplied ? `- R$ ${pixDiscountAmount.toFixed(2).replace(".", ",")}` : "R$ 0,00"}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
          <span className="text-gray-900">Total</span>
          <span className="text-red-500">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>
    </div>
  )
}
