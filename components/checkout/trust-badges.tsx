"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import Image from "next/image"

const badges = [
  {
    image: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/dadosseguros.png",
    title: "Dados seguros",
    description:
      "Seus dados estão 100% seguros, não compartilhamos e usamos somente para identificação de envio e notas fiscais.",
  },
  {
    image: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/notasfiscais.png",
    title: "Notas fiscais",
    description: "Emitimos sua nota fiscal e enviamos para o seu e-mail.",
  },
  {
    image: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/codigorastreamento.png",
    title: "Código de rastreamento",
    description: "Receba seu código de rastreamento no seu celular através do WhatsApp e pelo e-mail.",
  },
]

export function TrustBadges() {
  const [activeIndex, setActiveIndex] = useState(0)

  const renderBadgeIcon = (badge: (typeof badges)[number]) => {
    return (
      <Image
        src={badge.image || "/placeholder.svg"}
        alt={badge.title}
        width={48}
        height={48}
        className="h-12 w-12 object-contain"
        unoptimized
      />
    )
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % badges.length)
    }, 4000) // 4 seconds per slide

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Desktop View - All badges visible */}
      <div className="hidden lg:block space-y-4">
        {badges.map((badge, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{renderBadgeIcon(badge)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{badge.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{badge.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View - Carousel */}
      <div className="lg:hidden bg-white rounded-lg p-4 shadow-sm">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {badges.map((badge, index) => (
              <div key={index} className="flex items-start gap-3 min-w-full">
                <div className="flex-shrink-0">{renderBadgeIcon(badge)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{badge.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {badges.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === activeIndex ? "bg-gray-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
