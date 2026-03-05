import { NextResponse } from "next/server"
import { createPixTransaction, createCardTransaction } from "@/lib/cambio-service"
import { getProductForRoute, createShippingProduct } from "@/lib/product-catalog"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1"

    const body = await request.json()
    const {
      amount,
      paymentMethodType,
      customer_name,
      customer_email,
      customer_cpf,
      customer_phone,
      address,
      offer_id,
      // Cartão-specific
      card_hash,
      dfp_id,
      installments,
      // Rota de origem para catálogo de produtos
      checkout_route,
      // Frete
      shipping_cost,
      shipping_method,
      // PIX billing details (legado – mantém compatibilidade)
      billingDetails,
    } = body

    if (paymentMethodType === "pix") {
      const cpf = customer_cpf || billingDetails?.tax_id || ""

      const result = await createPixTransaction({
        amount,
        customer: {
          name: customer_name || billingDetails?.name || "",
          email: customer_email || billingDetails?.email || "",
          cpf: cpf.replace(/\D/g, ""),
          phone: customer_phone || "",
          ip: clientIp,
        },
        address: address
          ? {
            street: address.street || "",
            city: address.city || "",
            state: address.state || "",
            cep: address.cep || "",
          }
          : undefined,
        metadata: {
          customer_name: customer_name || "",
          customer_email: customer_email || "",
          payment_method: "pix",
          offer_id: offer_id || "1",
          checkout_route: checkout_route || "/",
        },
      })

      if (!result.success || !result.pixData) {
        return NextResponse.json(
          { error: result.error || "Erro ao gerar código PIX" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        paymentIntentId: result.transactionId,
        pixData: {
          code: result.pixData.code,
          qrCodeUrl: result.pixData.qrCodeUrl,
          expiresAt: result.pixData.expiresAt,
        },
      })
    } else {
      // Cartão de crédito
      if (!card_hash || !dfp_id) {
        return NextResponse.json(
          { error: "card_hash e dfp_id são obrigatórios para pagamento com cartão" },
          { status: 400 }
        )
      }

      // Montar array de products
      const route = checkout_route || "/"
      const catalogEntry = getProductForRoute(route)
      const products = [
        {
          descricao: catalogEntry.product.descricao,
          base_value: catalogEntry.product.base_value,
          valor: catalogEntry.product.valor,
          quantidade: catalogEntry.product.quantidade,
          ref: catalogEntry.product.ref,
          marca: catalogEntry.product.marca,
          sku: catalogEntry.product.sku,
          categoria: catalogEntry.product.categoria,
        },
      ]

      // Adiciona frete como produto separado se houver custo
      if (shipping_cost && shipping_cost > 0) {
        const shippingProduct = createShippingProduct(shipping_cost, shipping_method || "")
        products.push({
          descricao: shippingProduct.descricao,
          base_value: shippingProduct.base_value,
          valor: shippingProduct.valor,
          quantidade: shippingProduct.quantidade,
          ref: shippingProduct.ref,
          marca: shippingProduct.marca,
          sku: shippingProduct.sku,
          categoria: shippingProduct.categoria,
        })
      }

      const result = await createCardTransaction({
        amount,
        card_hash,
        dfp_id,
        installments: installments || 1,
        customer: {
          name: customer_name || "",
          email: customer_email || "",
          cpf: (customer_cpf || "").replace(/\D/g, ""),
          phone: customer_phone || "",
          ip: clientIp,
        },
        address: address
          ? {
            street: address.street || "",
            city: address.city || "",
            state: address.state || "",
            cep: address.cep || "",
          }
          : undefined,
        products,
        metadata: {
          customer_name: customer_name || "",
          customer_email: customer_email || "",
          payment_method: "card",
          offer_id: offer_id || "1",
          checkout_route: checkout_route || "/",
        },
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Pagamento não aprovado" },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        status: result.status,
      })
    }
  } catch (error) {
    console.error("Erro ao criar pagamento:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro ao processar pagamento"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
