import { Header } from "@/components/checkout/header"
import { Footer } from "@/components/checkout/footer"
import { Suspense } from "react"
import { BackButton } from "@/components/checkout/back-button"

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="bg-white rounded-lg p-8 shadow-sm text-gray-700 space-y-6">
          <Suspense fallback={null}>
            <BackButton />
          </Suspense>

          <h1 className="text-2xl font-bold text-gray-900">Termos de Uso e Política de Envio</h1>
          <p className="text-sm">
            Este site é operado pela <strong>Anor Commerce LLC</strong>, sediada em: <br />
            1209 Mountain Road Place Northeast, Albuquerque, New Mexico, 87110, USA.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">1. Política de Envio (Estoque Nacional)</h3>
          <p>
            Todos os produtos são despachados diretamente do nosso <strong>estoque próprio no Brasil</strong>. Prazos
            estimados:
          </p>
          <ul className="list-disc pl-5">
            <li>Sudeste: 8 a 12 dias úteis.</li>
            <li>Sul: 10 a 14 dias úteis.</li>
            <li>Demais Regiões: 15 a 18 dias úteis.</li>
          </ul>
          <p>O código de rastreamento é enviado automaticamente após a postagem.</p>

          <h3 className="text-lg font-semibold text-gray-900">2. Suporte</h3>
          <p>E-mail: info@titanchefcut.com</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
