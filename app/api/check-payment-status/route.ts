import { NextResponse } from "next/server"
import { getTransactionStatus } from "@/lib/cambio-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get("paymentIntentId")

    if (!paymentIntentId) {
      return NextResponse.json({ error: "ID da transação é obrigatório" }, { status: 400 })
    }

    const result = await getTransactionStatus(paymentIntentId)

    return NextResponse.json({
      status: result.status,
      paid: result.paid,
    })
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error)
    return NextResponse.json({ error: "Erro ao verificar status" }, { status: 500 })
  }
}
