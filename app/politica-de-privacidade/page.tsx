import { Header } from "@/components/checkout/header"
import { Footer } from "@/components/checkout/footer"
import { Suspense } from "react"
import { BackButton } from "@/components/checkout/back-button"

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="bg-white rounded-lg p-8 shadow-sm text-gray-700 space-y-6">
          <Suspense fallback={null}>
            <BackButton />
          </Suspense>

          <h1 className="text-2xl font-bold text-gray-900">Política de Privacidade</h1>
          <p className="text-sm">
            Este site é operado pela <strong>Anor Commerce LLC</strong>, sediada em: <br />
            1209 Mountain Road Place Northeast, Albuquerque, New Mexico, 87110, USA.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">1. Coleta de Dados</h3>
          <p>
            Coletamos informações pessoais necessárias para processar seu pedido, incluindo: nome, e-mail, telefone, CPF
            e endereço de entrega. Esses dados são utilizados exclusivamente para finalidade de envio e comunicação
            sobre sua compra.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">2. Processamento de Pagamentos</h3>
          <p>
            Os pagamentos são processados de forma segura através de uma plataforma de
            pagamentos certificada PCI-DSS. Não armazenamos dados de cartão de crédito em nossos servidores.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">3. Compartilhamento de Dados</h3>
          <p>
            Seus dados podem ser compartilhados com: transportadoras (para entrega), processadores de pagamento,
            e autoridades legais quando exigido por lei.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">4. Segurança</h3>
          <p>
            Utilizamos criptografia SSL/TLS para proteger suas informações durante a transmissão. Nossos sistemas seguem
            as melhores práticas de segurança da indústria.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">5. Seus Direitos</h3>
          <p>
            Você pode solicitar acesso, correção ou exclusão de seus dados pessoais a qualquer momento através do e-mail
            info@titanchefcut.com.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">6. Contato</h3>
          <p>
            E-mail: info@titanchefcut.com <br /> 
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
