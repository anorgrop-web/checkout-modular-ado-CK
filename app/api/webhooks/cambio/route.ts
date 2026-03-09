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

        console.log("WEBHOOK BODY COMPLETO:", JSON.stringify(body, null, 2).substring(0, 3000))

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
                    // Tenta atualizar pedido existente (criado como "pendente" no create-payment-intent)
                    const { data: existingOrder } = await supabase
                        .from("pedidos")
                        .select("id")
                        .eq("transaction_id", transactionId)
                        .maybeSingle()

                    if (existingOrder) {
                        const { error: updateError } = await supabase
                            .from("pedidos")
                            .update({
                                status: "aprovado",
                                codigo_rastreio: transactionId.slice(-8).toUpperCase(),
                                nome_cliente: customerName || undefined,
                                email_cliente: customerEmail || undefined,
                                cidade_destino: addressCity || undefined,
                                uf_destino: addressState || undefined,
                                cep: addressCep || undefined,
                                endereco_completo: addressStreet || undefined,
                            })
                            .eq("transaction_id", transactionId)

                        if (updateError) {
                            console.error("Erro ao atualizar pedido:", updateError.message)
                        } else {
                            console.log("Pedido atualizado para aprovado: " + transactionId.slice(-8).toUpperCase())
                        }
                    } else {
                        // Pedido não encontrado — inserir como novo (fallback)
                        const { error: insertError } = await supabase.from("pedidos").insert({
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

                        if (insertError) {
                            console.error("Erro ao inserir pedido (fallback):", insertError.message)
                        } else {
                            console.log("Pedido inserido (fallback): " + transactionId.slice(-8).toUpperCase())
                        }
                    }
                } catch (dbErr) {
                    console.error("Erro no upsert do Supabase:", dbErr)
                }

                console.log("WEBHOOK DADOS CLIENTE:", {
                    customerName,
                    customerEmail,
                    paymentMethod,
                    transactionId,
                    hasMetadata: !!transaction.metadata,
                    hasClient: !!transaction.client,
                    metadataKeys: Object.keys(transaction.metadata || {}),
                    clientKeys: Object.keys(transaction.client || {}),
                })

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
                } else {
                    console.error("E-MAIL NÃO ENVIADO - dados faltando:", {
                        customerEmail: customerEmail || "(vazio)",
                        customerName: customerName || "(vazio)",
                    })
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
