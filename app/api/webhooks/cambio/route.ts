import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderConfirmation } from "@/lib/email"

export const dynamic = "force-dynamic"

const CAMBIO_API_URL = process.env.CAMBIO_API_URL || "https://www.cambioreal.com"
const CAMBIO_APP_ID = process.env.NEXT_PUBLIC_CAMBIO_APP_ID || ""
const CAMBIO_APP_SECRET = process.env.CAMBIO_APP_SECRET || ""

function detectBrandFromOfferId(offerId: string | undefined): "katuchef" | "titanchef" {
    return "titanchef"
}

export async function POST(request: Request) {
    try {
        // 1. A CambioReal envia webhook como form-data, NÃO como JSON
        const formData = await request.formData()
        const webhookId = formData.get("id")?.toString() || ""
        const webhookToken = formData.get("token")?.toString() || ""

        console.log("Webhook CambioReal recebido. id:", webhookId, "token:", webhookToken.substring(0, 30) + "...")

        if (!webhookToken) {
            console.error("Webhook sem token — ignorando")
            return NextResponse.json({ received: true })
        }

        // 2. Consultar a API da CambioReal para obter os dados completos da transação
        const apiResponse = await fetch(`${CAMBIO_API_URL}/service/v1/checkout/get/${webhookToken}`, {
            method: "GET",
            headers: {
                "X-APP-ID": CAMBIO_APP_ID,
                "Content-Type": "application/json",
                "Authorization": `Basic ${Buffer.from(`${CAMBIO_APP_ID}:${CAMBIO_APP_SECRET}`).toString("base64")}`,
            },
        })

        const apiText = await apiResponse.text()

        // Verificar se é JSON válido
        if (apiText.startsWith("<!") || apiText.startsWith("<html") || apiText.startsWith("<HTML")) {
            console.error("CambioReal retornou HTML na consulta do webhook. Token:", webhookToken.substring(0, 30))
            return NextResponse.json({ received: true })
        }

        let apiData
        try {
            apiData = JSON.parse(apiText)
        } catch (parseErr) {
            console.error("Erro ao parsear resposta da CambioReal no webhook:", apiText.substring(0, 500))
            return NextResponse.json({ received: true })
        }

        console.log("Webhook - Dados da API:", JSON.stringify(apiData, null, 2).substring(0, 2000))

        // 3. Extrair dados da transação
        const transaction = apiData.data?.transaction || apiData.data || {}
        const transactionStatus = transaction.status || apiData.data?.status || ""
        const transactionId = webhookToken
        const amount = transaction.amount || apiData.data?.amount || 0
        const paymentMethod = transaction.payment_method || apiData.data?.payment_method || "pix"

        // Tentar extrair dados do cliente da resposta da API
        const client = apiData.data?.client || transaction.client || {}
        const customerName = client.name || ""
        const customerEmail = client.email || ""

        // Endereço
        const clientAddress = client.address || {}
        const addressStreet = clientAddress.street || ""
        const addressCity = clientAddress.city || ""
        const addressState = clientAddress.state || ""
        const addressCep = clientAddress.zip_code || ""

        console.log("Webhook - Status:", transactionStatus, "| Cliente:", customerName, customerEmail, "| Valor:", amount)

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 4. Processar baseado no status
        const isPaid = ["paid", "approved", "succeeded", "compensated"].includes(transactionStatus.toLowerCase())
        const isRefused = ["refused", "failed", "declined", "cancelled"].includes(transactionStatus.toLowerCase())
        const isRefunded = ["refunded", "chargedback"].includes(transactionStatus.toLowerCase())

        if (isPaid) {
            console.log("Webhook - Transação PAGA:", transactionId.substring(0, 16) + "...")

            try {
                // Tentar atualizar pedido existente (criado como "pendente" no create-payment-intent)
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
                        console.log("Pedido atualizado para aprovado. token:", transactionId.substring(0, 16))
                    }
                } else {
                    // Fallback: inserir como novo
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
                        valor: amount,
                        transaction_id: transactionId,
                    })

                    if (insertError) {
                        console.error("Erro ao inserir pedido (fallback):", insertError.message)
                    } else {
                        console.log("Pedido inserido (fallback):", transactionId.slice(-8).toUpperCase())
                    }
                }
            } catch (dbErr) {
                console.error("Erro no Supabase (webhook):", dbErr)
            }

            // Enviar e-mail de confirmação
            if (customerEmail && customerName) {
                const brand = detectBrandFromOfferId(undefined)
                const address = addressStreet
                    ? { street: addressStreet, city: addressCity, state: addressState, cep: addressCep }
                    : undefined

                const emailResult = await sendOrderConfirmation({
                    to: customerEmail,
                    customerName,
                    orderId: transactionId.slice(-8).toUpperCase(),
                    amount: typeof amount === "number" ? amount : parseFloat(amount || "0"),
                    paymentMethod,
                    products: [],
                    address,
                    brand,
                })

                if (emailResult.success) {
                    console.log("E-mail enviado para " + customerEmail)
                } else {
                    console.error("Falha ao enviar e-mail:", emailResult.error)
                }
            } else {
                console.warn("E-mail NÃO enviado - dados faltando:", { customerEmail, customerName })
            }

        } else if (isRefused) {
            console.log("Webhook - Transação RECUSADA:", transactionId.substring(0, 16))

        } else if (isRefunded) {
            console.log("Webhook - Transação ESTORNADA:", transactionId.substring(0, 16))
            try {
                await supabase
                    .from("pedidos")
                    .update({ status: "estornado" })
                    .eq("transaction_id", transactionId)
            } catch (err) {
                console.error("Erro ao atualizar estorno:", err)
            }

        } else {
            console.log("Webhook - Status não tratado:", transactionStatus, "Token:", transactionId.substring(0, 16))
        }

        // Sempre retornar 200 rápido (CambioReal exige resposta em <5 segundos)
        return NextResponse.json({ received: true })

    } catch (error) {
        console.error("Erro no webhook CambioReal:", error)
        // Retornar 200 mesmo com erro para a CambioReal não reenviar
        return NextResponse.json({ received: true })
    }
}
