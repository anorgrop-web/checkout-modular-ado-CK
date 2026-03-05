import { ShoppingCart } from "lucide-react"
import Image from "next/image"

export function TitanchefHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/kat/logo_titanchef%201.png"
            alt="Titanchef"
            width={60}
            height={40}
            className="h-10 w-auto"
          />
        </div>

        {/* Cart Icon */}
        <button className="relative p-2">
          <ShoppingCart className="h-6 w-6 text-gray-700" />
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            1
          </span>
        </button>
      </div>
    </header>
  )
}
