import Image from "next/image"
import { CheckCircle, Mail, Package, MapPin, CreditCard, User } from "lucide-react"
import { SuccessTracker } from "./success-tracker"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const params = await searchParams

  const orderData = {
    name: (params.name as string) || "Cliente",
    email: (params.email as string) || "",
    phone: (params.phone as string) || "",
    address: (params.address as string) || "",
    city: (params.city as string) || "",
    state: (params.state as string) || "",
    cep: (params.cep as string) || "",
    paymentMethod: (params.method as string) || "pix",
    amount: (params.amount as string) || "0",
  }

  const formattedAmount = Number.parseFloat(orderData.amount).toFixed(2).replace(".", ",")

  return (
    <div className="min-h-screen bg-gray-100">
      <SuccessTracker value={Number.parseFloat(orderData.amount)} paymentMethod={orderData.paymentMethod} />
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Image
            src="/titanchef-logo.jpg"
            alt="TitanChef"
            width={60}
            height={40}
            className="h-10 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="bg-white rounded-lg p-6 md:p-10">
          {/* Success Icon and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h1>
            <p className="text-gray-600">Obrigado pela sua compra, {orderData.name.split(" ")[0]}!</p>
          </div>

          {/* Tracking Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Package className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Código de Rastreamento</h3>
                <p className="text-sm text-blue-700">
                  O código de rastreamento será enviado para o seu e-mail assim que o pedido for postado. Fique atento à
                  sua caixa de entrada!
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Dúvidas?</h3>
                <p className="text-sm text-gray-600">
                  Entre em contato conosco pelo e-mail:{" "}
                  <a href="mailto:info@titanchefcut.com" className="text-green-600 font-medium hover:underline">
                    info@titanchefcut.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Detalhes do Pedido</h2>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{orderData.name}</p>
                  <p className="text-sm text-gray-600">{orderData.email}</p>
                  {orderData.phone && <p className="text-sm text-gray-600">{orderData.phone}</p>}
                </div>
              </div>

              {/* Shipping Address */}
              {orderData.address && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Endereço de Entrega</p>
                    <p className="text-sm text-gray-600">{orderData.address}</p>
                    <p className="text-sm text-gray-600">
                      {orderData.city}
                      {orderData.state ? `, ${orderData.state}` : ""}
                    </p>
                    {orderData.cep && <p className="text-sm text-gray-600">CEP: {orderData.cep}</p>}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Pagamento</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {orderData.paymentMethod === "pix" ? "PIX" : "Cartão de Crédito"}
                    </p>
                    <p className="text-lg font-bold text-green-600">R$ {formattedAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Shopping Button */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Voltar à Loja
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-8">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Payment Methods */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-4">Formas de pagamento</p>
            <div className="flex items-center justify-center gap-4">
              {paymentMethods.map((method, index) => (
                <Image
                  key={index}
                  src={method.logo || "/placeholder.svg"}
                  alt={method.name}
                  width={40}
                  height={28}
                  className="h-7 w-auto object-contain"
                  unoptimized
                />
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-900">TitanChef</p>
            <p className="text-xs text-gray-500">info@titanchefcut.com</p>
          </div>

          {/* Legal Links */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700 transition-colors">
              Termos de Uso
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Trocas e Devoluções
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const paymentMethods = [
  { name: "Mastercard", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-mastercard.svg" },
  { name: "Visa", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-visa.svg" },
  { name: "Amex", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/amex.Csr7hRoy.svg" },
  { name: "Discover", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-discover.svg" },
  { name: "Pix", logo: "https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/card-pix.svg" },
]
