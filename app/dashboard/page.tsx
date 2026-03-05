"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, QrCode, CircleCheckBig, TrendingUp, DollarSign, Loader2, Lock, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { DateRange } from "react-day-picker"

interface StatsData {
  pixGeneratedQtd: number
  pixGeneratedValue: number
  pixPaidQtd: number
  pixPaidValue: number
  pixConversionRate: number
  totalRevenue: number
  recentPixOrders: Array<{
    id: string
    amount: number
    status: string
    created: number
    customerName: string
    customerEmail: string
  }>
  totalPaymentIntents: number
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const handleLogin = useCallback(() => {
    if (password === "Senhacheckout1!") {
      setIsAuthenticated(true)
      setPasswordError("")
    } else {
      setPasswordError("Senha incorreta")
    }
  }, [password])

  const fetchStats = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setIsLoading(true)
    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd")
      const endDate = format(dateRange.to, "yyyy-MM-dd")

      const response = await fetch(`/api/admin/stats?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          "x-admin-password": "Senhacheckout1!",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pago</Badge>
      case "requires_action":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Aguardando</Badge>
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  const setPresetDateRange = (preset: "today" | "7days" | "30days" | "thisMonth") => {
    const today = new Date()
    switch (preset) {
      case "today":
        setDateRange({ from: today, to: today })
        break
      case "7days":
        setDateRange({ from: subDays(today, 7), to: today })
        break
      case "30days":
        setDateRange({ from: subDays(today, 30), to: today })
        break
      case "thisMonth":
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) })
        break
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Dashboard Administrativo</CardTitle>
            <CardDescription>Digite a senha para acessar as métricas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Dashboard PIX</h1>
                <p className="text-sm text-muted-foreground">Métricas de conversão</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Preset buttons */}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setPresetDateRange("today")}>
                  Hoje
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPresetDateRange("7days")}>
                  7 dias
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPresetDateRange("30days")}>
                  30 dias
                </Button>
              </div>

              {/* Date picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <Button onClick={fetchStats} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {!stats ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">Selecione um período e clique em "Buscar"</p>
              <p className="text-sm text-muted-foreground">Os dados de conversão PIX serão exibidos aqui</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* PIX Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* PIX Generated */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">PIX Gerados</CardTitle>
                  <QrCode className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.pixGeneratedQtd}</div>
                  <p className="text-sm text-muted-foreground">pedidos</p>
                  <div className="mt-2 text-lg font-semibold text-blue-600">
                    {formatCurrency(stats.pixGeneratedValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">valor total gerado</p>
                </CardContent>
              </Card>

              {/* PIX Paid */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">PIX Pagos</CardTitle>
                  <CircleCheckBig className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.pixPaidQtd}</div>
                  <p className="text-sm text-muted-foreground">pedidos</p>
                  <div className="mt-2 text-lg font-semibold text-green-600">{formatCurrency(stats.pixPaidValue)}</div>
                  <p className="text-xs text-muted-foreground">valor liquidado</p>
                </CardContent>
              </Card>

              {/* Conversion Rate */}
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.pixConversionRate.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">PIX pagos / gerados</p>
                  <div className="mt-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">faturamento total</p>
                </CardContent>
              </Card>
            </div>

            {/* Funnel Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão PIX</CardTitle>
                <CardDescription>Comparativo entre PIX gerados e pagos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "PIX Gerados", value: stats.pixGeneratedQtd, color: "#3b82f6" },
                        { name: "PIX Pagos", value: stats.pixPaidQtd, color: "#22c55e" },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [value, "Quantidade"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Pedidos PIX</CardTitle>
                <CardDescription>Os 10 pedidos PIX mais recentes</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentPixOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum pedido PIX encontrado no período selecionado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentPixOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(-8)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created * 1000), "dd/MM/yy HH:mm", {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
