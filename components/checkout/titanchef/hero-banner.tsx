import Image from "next/image"

export function TitanchefHeroBanner() {
  return (
    <div className="overflow-hidden rounded-lg">
      <Image
        src="https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/kat/imgkatucheckout.png"
        alt="Por que atualizar sua tábua de corte? - Comparação entre tábuas"
        width={1200}
        height={400}
        className="w-full h-auto object-cover"
        priority
        unoptimized
      />
    </div>
  )
}
