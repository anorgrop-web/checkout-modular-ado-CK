/**
 * Serviço de integração com a API CambioReal (CambioCheckout).
 * Centraliza criação de transações (PIX e cartão) e consulta de status.
 * Autenticação via headers X-APP-ID e X-APP-SECRET em cada request.
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
        number?: string
        district?: string
        city: string
        state: string
        cep: string
    }
    products?: Array<{
        descricao: string
        base_value: number
        valor: number
        qty: number
        ref: string
        category: string
        brand: string
        sku: string
    }>
    metadata?: Record<string, string>
}

interface CreateCardParams {
    amount: number
    card_hash: string
    card_brand?: string
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
        number?: string
        district?: string
        city: string
        state: string
        cep: string
    }
    products: CambioProduct[]
    metadata?: Record<string, string>
}

/**
 * Retorna os headers de autenticação para a API CambioReal.
 * A autenticação é feita via headers X-APP-ID e X-APP-SECRET em cada request.
 */
function getCambioHeaders(): Record<string, string> {
    return {
        "X-APP-ID": CAMBIO_APP_ID,
        "X-APP-SECRET": CAMBIO_APP_SECRET,
        "Content-Type": "application/json",
    }
}

/**
 * Cria uma transação PIX na CambioReal.
 */
export async function createPixTransaction(params: CreatePixParams): Promise<CambioPixResponse> {
    try {
        const body = {
            order_id: crypto.randomUUID().substring(0, 12),
            amount: params.amount,
            currency: "BRL",
            payment_method: "pix",
            duplicate: 0,
            take_rates: 1,
            client: {
                name: params.customer.name,
                email: params.customer.email,
                document: params.customer.cpf,
                birth_date: "2000-01-01",
                phone: params.customer.phone || "",
                ip: params.customer.ip,
                ...(params.address && {
                    address: {
                        street: params.address.street,
                        number: params.address.number || "",
                        district: params.address.district || "",
                        city: params.address.city,
                        state: params.address.state,
                        zip_code: params.address.cep.replace(/\D/g, ""),
                    },
                }),
            },
            products: params.products && params.products.length > 0
                ? params.products
                : [
                    {
                        descricao: "Produto",
                        base_value: params.amount,
                        valor: params.amount,
                        qty: 1,
                        ref: "PROD-001",
                        category: "",
                        brand: "",
                        sku: "",
                    },
                ],
        }

        const response = await fetch(`${CAMBIO_API_URL}/service/v2/checkout/request`, {
            method: "POST",
            headers: getCambioHeaders(),
            body: JSON.stringify(body),
        })

        const responseText = await response.text()
        const data = JSON.parse(responseText)

        if (!response.ok || data.status === "error") {
            return {
                success: false,
                transactionId: "",
                error: data.message || data.errors?.join(", ") || "Erro ao gerar PIX",
            }
        }

        console.log("PIX RESPONSE:", JSON.stringify(data, null, 2).substring(0, 1500))

        const tx = data.data?.transaction

        return {
            success: true,
            transactionId: data.data?.id || "",
            pixData: {
                code: tx?.number || "",
                qrCodeUrl: tx?.barcode || "",
                expiresAt: (() => {
                    if (tx?.expires_at) {
                        const parsed = new Date(tx.expires_at).getTime()
                        if (!isNaN(parsed) && parsed > Date.now()) {
                            return Math.floor(parsed / 1000)
                        }
                    }
                    return Math.floor(Date.now() / 1000) + 1800
                })(),
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
        const rawBin = params.card_hash.substring(0, 6) || "000000"
        const detectedBrand = params.card_brand || "visa"

        const body = {
            order_id: crypto.randomUUID().substring(0, 12),
            amount: params.amount,
            currency: "BRL",
            payment_method: "credit_card",
            duplicate: 0,
            take_rates: 1,
            card: {
                bin: rawBin,
                brand: detectedBrand,
                country: "BR",
                dfp_id: params.dfp_id,
                holder: params.customer.name,
                installments: params.installments,
                token: params.card_hash,
                type: "credit",
            },
            client: {
                name: params.customer.name,
                email: params.customer.email,
                document: params.customer.cpf,
                birth_date: "2000-01-01",
                phone: params.customer.phone || "",
                ip: params.customer.ip,
                ...(params.address && {
                    address: {
                        street: params.address.street,
                        number: params.address.number || "",
                        district: params.address.district || "",
                        city: params.address.city,
                        state: params.address.state,
                        zip_code: params.address.cep.replace(/\D/g, ""),
                    },
                }),
            },
            products: params.products.map((p) => ({
                descricao: p.descricao,
                base_value: p.base_value,
                valor: p.valor,
                qty: p.quantidade || 1,
                ref: p.ref || "",
                category: p.categoria || "",
                brand: p.marca || "",
                sku: p.sku || "",
            })),
        }

        const response = await fetch(`${CAMBIO_API_URL}/service/v2/checkout/request`, {
            method: "POST",
            headers: getCambioHeaders(),
            body: JSON.stringify(body),
        })

        const responseText = await response.text()
        const data = JSON.parse(responseText)

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
        const response = await fetch(`${CAMBIO_API_URL}/service/v2/checkout/request/${transactionId}`, {
            method: "GET",
            headers: getCambioHeaders(),
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
