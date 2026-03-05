import { Header } from "@/components/checkout/header"
import { Footer } from "@/components/checkout/footer"
import { Suspense } from "react"
import { BackButton } from "@/components/checkout/back-button"

export default function Trocas() {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="bg-white rounded-lg p-8 shadow-sm text-gray-700 space-y-6">
          <Suspense fallback={null}>
            <BackButton />
          </Suspense>

          <h1 className="text-2xl font-bold text-gray-900">Trocas, Devoluções e Garantia</h1>

          <h3 className="text-lg font-semibold text-gray-900">1. Garantia de 90 Dias</h3>
          <p>Oferecemos garantia de 90 dias contra defeitos de fabricação.</p>

          <h3 className="text-lg font-semibold text-gray-900">2. Direito de Arrependimento</h3>
          <p>Você tem 7 dias corridos após o recebimento para desistir da compra. O reembolso é integral e é processado em até 5 dias no mesmo método de pagamento utilizado para a realização da compra.        </p>

          <h3 className="text-lg font-semibold text-gray-900">3. Logística Reversa Nacional</h3>
          <p>
            Possuímos parceiro logístico no Brasil para receber devoluções, sem custos internacionais para o cliente. Em
            caso de defeito, nós pagamos o frete de volta.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
