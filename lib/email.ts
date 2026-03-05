import { Resend } from "resend"
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation"
import { TitanchefOrderConfirmationEmail } from "@/components/emails/titanchef-order-confirmation"

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

interface SendOrderConfirmationParams {
  to: string
  customerName: string
  orderId: string
  amount: number
  paymentMethod: string
  products?: Array<{
    name: string
    quantity: number
    price: number
  }>
  address?: {
    street: string
    city: string
    state: string
    cep: string
  }
  brand?: "katuchef" | "titanchef" // Adicionado suporte para múltiplas marcas
}

export async function sendOrderConfirmation({
  to,
  customerName,
  orderId,
  amount,
  paymentMethod,
  products = [],
  address,
  brand = "katuchef", // Default para katuchef
}: SendOrderConfirmationParams) {
  try {
    const brandConfig = {
      katuchef: {
        from: "TitanChef <pedidos@titanchefcut.com>",
        subject: `Pedido Confirmado! #${orderId}`,
        emailComponent: OrderConfirmationEmail({
          customerName,
          orderId,
          amount,
          paymentMethod,
          products,
          address,
        }),
      },
      titanchef: {
        from: "Titanchef <pedidos@titanchefcut.com>",
        subject: `Pedido Confirmado! #${orderId}`,
        emailComponent: TitanchefOrderConfirmationEmail({
          customerName,
          orderId,
          amount,
          paymentMethod,
          products,
          address,
        }),
      },
    }

    const config = brandConfig[brand]

    const { data, error } = await getResend().emails.send({
      from: config.from,
      to: [to],
      subject: config.subject,
      react: config.emailComponent,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending order confirmation email:", error)
    return { success: false, error }
  }
}
