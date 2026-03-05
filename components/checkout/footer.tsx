"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const paymentMethods = [
  {
    name: "Mastercard",
    logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-mastercard.svg",
  },
  {
    name: "Visa",
    logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-visa.svg",
  },
  {
    name: "Amex",
    logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/amex.Csr7hRoy.svg",
  },
  {
    name: "Discover",
    logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-discover.svg",
  },
  {
    name: "Pix",
    logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-pix.svg",
  },
]

export function Footer() {
  const pathname = usePathname()
  const returnUrl = encodeURIComponent(pathname)

  return (
    <footer className="bg-white border-t border-gray-100 mt-8">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Payment Methods */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-4">Formas de pagamento</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center"
              >
                <Image
                  src={method.logo || "/placeholder.svg"}
                  alt={method.name}
                  width={36}
                  height={24}
                  className="h-5 w-auto object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="hidden md:block text-sm font-medium text-gray-900">Anor Commerce LLC</p>
          <p className="text-xs text-gray-500">1209 Mountain Road Place Northeast, Albuquerque, NM, 87110</p>
          <p className="text-xs text-gray-500">info@titanchefcut.com</p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <Link href={`/termos-de-uso?returnUrl=${returnUrl}`} className="hover:text-gray-700 transition-colors">
            Termos de Uso
          </Link>
          <span className="text-gray-300">|</span>
          <Link href={`/trocas-e-devolucoes?returnUrl=${returnUrl}`} className="hover:text-gray-700 transition-colors">
            Trocas e Devoluções
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={`/politica-de-privacidade?returnUrl=${returnUrl}`}
            className="hover:text-gray-700 transition-colors"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
