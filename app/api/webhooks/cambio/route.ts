import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderConfirmation } from "@/lib/email"

export const dynamic = "force-dynamic"

const WEBHOOK_SECRET = process.env.CAMBIO_WEBHOOK_SECRET || ""

function detectBrandFromOfferId(offerId: string | undefined): "katuchef" | "titanchef" {
    return "titanchef"
}

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const body = await request.json()

        if (WEBHOOK_SECRET) {
            const signature = request.headers.get("x-webhook-signature") ||
                request.headers.get("x-cambio-signature") || ""
            if (signature && signature !== WEBHOOK_SECRET) {
                console.error("Webhook signature invalida")
                return NextResponse.json({ error: "Assinatura invalida" }, { status: 401 })
            }
        }

        const event = body.event || body.type || ""
        const transaction = body.transaction || body.data || body

        console.log("Webhook CambioReal recebido: " + event)

        switch (event) {
            case "transaction.paid":
            case "transaction.approved":
            case "payment.approved": {
                const metadata = transaction.metadata || {}
                const customerName = metadata.customer_name || transaction.client?.name || ""
                const customerEmail = metadata.customer_email || transaction.client?.email || ""
                const paymentMethod = metadata.payment_method || "pix"
                const offerId = metadata.offer_id || metadata.oid
                const transactionId = transaction.id || transaction.transaction_id || ""

                const brand = detectBrandFromOfferId(offerId)

                const addressStreet = metadata.address_street || transaction.address?.street || ""
                const addressCity = metadata.address_city || transaction.address?.city || ""
                const addressState = metadata.address_state || transaction.address?.state || ""
                const addressCep = metadata.address_cep || transaction.address?.zip_code || ""

                try {
                    const { error: supabaseError } = await supabase.from("pedidos").insert({
                        codigo_rastreio: transactionId.slice(-8).toUpperCase(),
                        nome_cliente: customerName,
                        email_cliente: customerEmail,
                        cidade_destino: addressCity || "Brasil",
                        uf_destino: addressState || "BR",
                        cep: addressCep,
                        endereco_completo: addressStreet,
                        data_compra: new Date().toISOString(),
                        status: "aprovado",
                        metodo_pagamento: paymentMethod,
                        valor: (transaction.amount || 0),
                        transaction_id: transactionId,
                    })

                    if (supabaseError) {
                        console.error("Erro ao salvar pedido no Supabase:", supabaseError.message)
                    } else {
                        console.log("Pedido salvo: " + transactionId.slice(-8).toUpperCase())
                    }
                } catch (dbErr) {
                    console.error("Erro no insert do Supabase:", dbErr)
                }

                if (customerEmail && customerName) {
                    const address = addressStreet
                        ? {
                            street: addressStreet,
                            city: addressCity,
                            state: addressState,
                            cep: addressCep,
                        }
                        : undefined

                    const amount = typeof transaction.amount === "number"
                        ? transaction.amount
                        : parseFloat(transaction.amount || "0")

                    const emailResult = await sendOrderConfirmation({
                        to: customerEmail,
                        customerName,
                        orderId: transactionId.slice(-8).toUpperCase(),
                        amount,
                        paymentMethod,
                        products: [],
                        address,
                        brand,
                    })

                    if (emailResult.success) {
                        console.log("E-mail enviado para " + customerEmail + " (brand: " + brand + ")")
                    } else {
                        console.error("Falha ao enviar e-mail para " + customerEmail + ":", emailResult.error)
                    }
                }

                break
            }

            case "transaction.refused":
            case "transaction.failed":
            case "payment.refused": {
                const txId = transaction.id || transaction.transaction_id || ""
                console.log("Transacao " + txId + " recusada/falhou")
                break
            }

            case "transaction.refunded":
            case "payment.refunded": {
                const txId = transaction.id || transaction.transaction_id || ""
                console.log("Transacao " + txId + " estornada")

                try {
                    const codigo = txId.slice(-8).toUpperCase()
                    await supabase
                        .from("pedidos")
                        .update({ status: "estornado" })
                        .eq("codigo_rastreio", codigo)
                } catch (err) {
                    console.error("Erro ao atualizar estorno:", err)
                }

                break
            }

            default:
                console.log("Evento nao tratado: " + event)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Erro no webhook CambioReal:", error)
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }
}
