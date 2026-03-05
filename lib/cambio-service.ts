/**
 * Serviço de integração com a API CambioReal (CambioCheckout).
 * Centraliza autenticação, criação de transações (PIX e cartão) e consulta de status.
 */

const CAMBIO_API_URL = process.env.CAMBIO_API_URL || "https://sandbox.cambioreal.com"
const CAMBIO_APP_ID = process.env.NEXT_PUBLIC_CAMBIO_APP_ID || ""
const CAMBIO_APP_SECRET = process.env.CAMBIO_APP_SECRET || ""

interface CambioPixResponse {
    success: boolean
    transactionId: string
    pixData?: {
        code: string       // Código copia-e-cola
        qrCodeUrl: string  // URL da imagem do QR Code
        expiresAt: number  // Unix timestamp de expiração
    }
    error?: string
}

interface CambioCardResponse {
    success: boolean
    transactionId: string
    status: string
    error?: string
}

interface CambioStatusResponse {
    status: string
    paid: boolean
    error?: string
}

interface CambioProduct {
    descricao: string
    base_value: number
    valor: number
    quantidade?: number
    ref?: string
    marca?: string
    sku?: string
    categoria?: string
}

interface CreatePixParams {
    amount: number
    customer: {
        name: string
        email: string
        cpf: string
        phone?: string
        ip: string
    }
    address?: {
        street: string
        city: string
        state: string
        cep: string
    }
    metadata?: Record<string, string>
}

interface CreateCardParams {
    amount: number
    card_hash: string
    dfp_id: string
    installments: number
    customer: {
        name: string
        email: string
        cpf: string
        phone?: string
        ip: string
    }
    address?: {
        street: string
        city: string
        state: string
        cep: string
    }
    products: CambioProduct[]
    metadata?: Record<string, string>
}

/**
 * Obtém token de autenticação da CambioReal.
 */
async function authenticate(): Promise<string> {
    const response = await fetch(`${CAMBIO_API_URL}/service/v1/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            app_id: CAMBIO_APP_ID,
            app_secret: CAMBIO_APP_SECRET,
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Falha na autenticação CambioReal: ${errorData.message || response.statusText}`)
    }

    const data = await response.json()
    return data.token || data.access_token
}

/**
 * Cria uma transação PIX na CambioReal.
 */
export async function createPixTransaction(params: CreatePixParams): Promise<CambioPixResponse> {
    try {
        const token = await authenticate()

        const body = {
            amount: params.amount,
            currency: "BRL",
            payment_method: "pix",
            client: {
                name: params.customer.name,
                email: params.customer.email,
                cpf: params.customer.cpf,
                phone: params.customer.phone || "",
                ip: params.customer.ip,
            },
            ...(params.address && {
                address: {
                    street: params.address.street,
                    city: params.address.city,
                    state: params.address.state,
                    zip_code: params.address.cep.replace(/\D/g, ""),
                    country: "BR",
                },
            }),
            metadata: params.metadata || {},
        }

        const response = await fetch(`${CAMBIO_API_URL}/service/v1/baas/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return {
                success: false,
                transactionId: "",
                error: data.message || data.error || "Erro ao gerar PIX",
            }
        }

        // Extrair dados do PIX da resposta
        const pixInfo = data.pix || data.qr_code || data

        return {
            success: true,
            transactionId: data.id || data.transaction_id || "",
            pixData: {
                code: pixInfo.qr_code_text || pixInfo.code || pixInfo.copy_paste || "",
                qrCodeUrl: pixInfo.qr_code_url || pixInfo.qr_code_image || pixInfo.image_url || "",
                expiresAt: pixInfo.expires_at
                    ? (typeof pixInfo.expires_at === "number"
                        ? pixInfo.expires_at
                        : Math.floor(new Date(pixInfo.expires_at).getTime() / 1000))
                    : Math.floor(Date.now() / 1000) + 1800, // 30 min default
            },
        }
    } catch (error) {
        console.error("Erro CambioReal (PIX):", error)
        return {
            success: false,
            transactionId: "",
            error: error instanceof Error ? error.message : "Erro ao processar PIX",
        }
    }
}

/**
 * Cria uma transação com cartão de crédito via card_hash na CambioReal.
 */
export async function createCardTransaction(params: CreateCardParams): Promise<CambioCardResponse> {
    try {
        const token = await authenticate()

        const body = {
            amount: params.amount,
            currency: "BRL",
            payment_method: "credit_card",
            card: {
                card_hash: params.card_hash,
                dfp_id: params.dfp_id,
            },
            installments: params.installments,
            client: {
                name: params.customer.name,
                email: params.customer.email,
                cpf: params.customer.cpf,
                phone: params.customer.phone || "",
                ip: params.customer.ip,
            },
            ...(params.address && {
                address: {
                    street: params.address.street,
                    city: params.address.city,
                    state: params.address.state,
                    zip_code: params.address.cep.replace(/\D/g, ""),
                    country: "BR",
                },
            }),
            products: params.products.map((p) => ({
                descricao: p.descricao,
                base_value: p.base_value,
                valor: p.valor,
                quantidade: p.quantidade || 1,
                ref: p.ref || "",
                marca: p.marca || "",
                sku: p.sku || "",
                categoria: p.categoria || "",
            })),
            metadata: params.metadata || {},
        }

        const response = await fetch(`${CAMBIO_API_URL}/service/v1/baas/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return {
                success: false,
                transactionId: "",
                status: "failed",
                error: data.message || data.error || "Erro ao processar cartão",
            }
        }

        const txStatus = data.status || ""
        const isPaid = txStatus === "paid" || txStatus === "approved" || txStatus === "succeeded"

        return {
            success: isPaid,
            transactionId: data.id || data.transaction_id || "",
            status: txStatus,
            error: isPaid ? undefined : (data.refuse_reason || data.status_reason || "Pagamento não aprovado"),
        }
    } catch (error) {
        console.error("Erro CambioReal (Cartão):", error)
        return {
            success: false,
            transactionId: "",
            status: "error",
            error: error instanceof Error ? error.message : "Erro ao processar cartão",
        }
    }
}

/**
 * Consulta o status de uma transação na CambioReal.
 */
export async function getTransactionStatus(transactionId: string): Promise<CambioStatusResponse> {
    try {
        const token = await authenticate()

        const response = await fetch(`${CAMBIO_API_URL}/service/v1/baas/transactions/${transactionId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return {
                status: "error",
                paid: false,
                error: data.message || "Erro ao consultar status",
            }
        }

        const txStatus = data.status || ""
        const isPaid = txStatus === "paid" || txStatus === "approved" || txStatus === "succeeded"

        return {
            status: txStatus,
            paid: isPaid,
        }
    } catch (error) {
        console.error("Erro ao consultar status CambioReal:", error)
        return {
            status: "error",
            paid: false,
            error: error instanceof Error ? error.message : "Erro ao consultar status",
        }
    }
}
