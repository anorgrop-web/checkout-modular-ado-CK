// Serviço de busca de CEP com redundância de APIs
// Tenta múltiplas APIs em caso de falha, com timeout para evitar lentidão

export interface CepResult {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface CepProvider {
  name: string
  fetch: (cep: string, signal: AbortSignal) => Promise<CepResult | null>
}

// Timeout para cada requisição individual (3 segundos)
const REQUEST_TIMEOUT = 3000

// Timeout máximo total para todas as tentativas (8 segundos)
const MAX_TOTAL_TIMEOUT = 8000

// Provider 1: ViaCEP
const viaCepProvider: CepProvider = {
  name: "ViaCEP",
  fetch: async (cep: string, signal: AbortSignal): Promise<CepResult | null> => {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal })
    const data = await response.json()

    if (data.erro) return null

    return {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      localidade: data.localidade || "",
      uf: data.uf || "",
    }
  },
}

// Provider 2: BrasilAPI
const brasilApiProvider: CepProvider = {
  name: "BrasilAPI",
  fetch: async (cep: string, signal: AbortSignal): Promise<CepResult | null> => {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, { signal })

    if (!response.ok) return null

    const data = await response.json()

    return {
      logradouro: data.street || "",
      bairro: data.neighborhood || "",
      localidade: data.city || "",
      uf: data.state || "",
    }
  },
}

// Provider 3: OpenCEP (backup adicional)
const openCepProvider: CepProvider = {
  name: "OpenCEP",
  fetch: async (cep: string, signal: AbortSignal): Promise<CepResult | null> => {
    const response = await fetch(`https://opencep.com/v1/${cep}`, { signal })

    if (!response.ok) return null

    const data = await response.json()

    return {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      localidade: data.localidade || "",
      uf: data.uf || "",
    }
  },
}

// Lista de providers em ordem de prioridade
const providers: CepProvider[] = [viaCepProvider, brasilApiProvider, openCepProvider]

// Função auxiliar para criar timeout com AbortController
function fetchWithTimeout(provider: CepProvider, cep: string, timeoutMs: number): Promise<CepResult | null> {
  return new Promise(async (resolve) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      resolve(null)
    }, timeoutMs)

    try {
      const result = await provider.fetch(cep, controller.signal)
      clearTimeout(timeoutId)
      resolve(result)
    } catch {
      clearTimeout(timeoutId)
      resolve(null)
    }
  })
}

export interface FetchCepResponse {
  success: boolean
  data?: CepResult
  error?: "not_found" | "network_error" | "timeout"
  provider?: string
}

/**
 * Busca CEP com sistema de redundância
 * - Tenta a primeira API (ViaCEP)
 * - Se falhar, tenta as outras em sequência
 * - Cada requisição tem timeout individual de 3s
 * - Timeout máximo total de 8s
 * - Retorna erro apropriado se CEP não existir
 */
export async function fetchCep(cep: string): Promise<FetchCepResponse> {
  // Validação básica do CEP
  const digits = cep.replace(/\D/g, "")
  if (digits.length !== 8) {
    return { success: false, error: "not_found" }
  }

  // Criar timeout global
  const startTime = Date.now()

  for (const provider of providers) {
    // Verificar se ainda temos tempo
    const elapsedTime = Date.now() - startTime
    if (elapsedTime >= MAX_TOTAL_TIMEOUT) {
      return { success: false, error: "timeout" }
    }

    // Calcular timeout restante (mínimo entre timeout individual e tempo restante)
    const remainingTime = MAX_TOTAL_TIMEOUT - elapsedTime
    const timeout = Math.min(REQUEST_TIMEOUT, remainingTime)

    try {
      const result = await fetchWithTimeout(provider, digits, timeout)

      if (result) {
        return {
          success: true,
          data: result,
          provider: provider.name,
        }
      }
      // Se retornou null mas não deu erro, significa que o CEP não foi encontrado
      // Continua para o próximo provider
    } catch {
      // Erro de rede, tenta próximo provider
      continue
    }
  }

  // Se nenhum provider retornou dados, o CEP provavelmente não existe
  return { success: false, error: "not_found" }
}

/**
 * Estratégia alternativa: busca em paralelo (mais rápido, mas usa mais recursos)
 * Use esta função se preferir velocidade sobre economia de requisições
 */
export async function fetchCepParallel(cep: string): Promise<FetchCepResponse> {
  const digits = cep.replace(/\D/g, "")
  if (digits.length !== 8) {
    return { success: false, error: "not_found" }
  }

  // Criar controller global para cancelar as outras requisições quando uma tiver sucesso
  const globalController = new AbortController()

  const promises = providers.map(async (provider) => {
    try {
      const result = await fetchWithTimeout(provider, digits, REQUEST_TIMEOUT)
      if (result) {
        globalController.abort() // Cancela as outras requisições
        return { success: true as const, data: result, provider: provider.name }
      }
      return null
    } catch {
      return null
    }
  })

  // Usar Promise.race com um timeout global
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), MAX_TOTAL_TIMEOUT)
  })

  try {
    const results = await Promise.race([
      Promise.any(promises.map((p) => p.then((r) => r || Promise.reject()))),
      timeoutPromise,
    ])

    if (results && typeof results === "object" && "success" in results) {
      return results as FetchCepResponse
    }
  } catch {
    // Todas as promises falharam
  }

  return { success: false, error: "not_found" }
}
