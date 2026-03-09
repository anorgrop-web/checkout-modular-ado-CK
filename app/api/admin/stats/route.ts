import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const ADMIN_PASSWORD = "Senhacheckout1!"

export async function GET(request: Request) {
  // Validar senha admin
  const adminPassword = request.headers.get("x-admin-password")
  if (adminPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Buscar pedidos do Supabase no período
    let query = supabase
      .from("pedidos")
      .select("*")
      .order("data_compra", { ascending: false })

    if (startDate) {
      // Converte a data local (Brasília UTC-3) para UTC para busca correta no Supabase
      query = query.gte("data_compra", `${startDate}T03:00:00.000Z`)
    }
    if (endDate) {
      query = query.lte("data_compra", `${endDate}T23:59:59.999Z`)
    }

    const { data: pedidos, error: dbError } = await query

    if (dbError) {
      console.error("Erro ao buscar pedidos:", dbError)
      return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
    }

    const orders = pedidos || []

    // Calcular métricas
    let pixGeneratedQtd = 0
    let pixGeneratedValue = 0
    let pixPaidQtd = 0
    let pixPaidValue = 0
    let totalRevenue = 0

    const recentPixOrders: Array<{
      id: string
      amount: number
      status: string
      created: number
      customerName: string
      customerEmail: string
    }> = []

    for (const order of orders) {
      const isPix = order.metodo_pagamento === "pix"
      const isCard = order.metodo_pagamento === "card"
      const amount = typeof order.valor === "number" ? order.valor : parseFloat(order.valor || "0")
      const isApproved = order.status === "aprovado"
      const isPending = order.status === "pendente"

      if (isPix) {
        // PIX Gerados = todos os pedidos PIX (pendentes + aprovados)
        pixGeneratedQtd++
        pixGeneratedValue += amount

        if (isApproved) {
          pixPaidQtd++
          pixPaidValue += amount
        }

        recentPixOrders.push({
          id: order.codigo_rastreio || order.id || "",
          amount,
          status: isApproved ? "succeeded" : isPending ? "requires_action" : order.status || "pending",
          created: order.data_compra
            ? Math.floor(new Date(order.data_compra).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          customerName: order.nome_cliente || "N/A",
          customerEmail: order.email_cliente || "N/A",
        })
      }

      if (isApproved) {
        totalRevenue += amount
      }
    }

    const pixConversionRate = pixGeneratedQtd > 0 ? (pixPaidQtd / pixGeneratedQtd) * 100 : 0

    // Pegar os 10 mais recentes
    const top10RecentOrders = recentPixOrders.slice(0, 10)

    return NextResponse.json({
      pixGeneratedQtd,
      pixGeneratedValue,
      pixPaidQtd,
      pixPaidValue,
      pixConversionRate,
      totalRevenue,
      recentPixOrders: top10RecentOrders,
      totalPaymentIntents: orders.length,
    })
  } catch (error) {
    console.error("Erro ao buscar stats:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro ao buscar estatísticas"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
