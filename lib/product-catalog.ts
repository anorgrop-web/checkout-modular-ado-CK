/**
 * Catálogo de produtos por rota/página de checkout.
 * Usado para enviar dados de produtos à API da CambioReal.
 */

export interface ProductItem {
  descricao: string
  base_value: number
  valor: number
  quantidade: number
  ref: string
  marca: string
  sku: string
  categoria: string
}

export interface ProductCatalogEntry {
  product: ProductItem
}

// Mapeamento de rota → produto
const catalog: Record<string, ProductCatalogEntry> = {
  "/": {
    product: {
      descricao: "Titanchef - Tábua de corte alta resistência - Kit 3 tamanhos",
      base_value: 89.87,
      valor: 89.87,
      quantidade: 1,
      ref: "TC-KIT3-001",
      marca: "Titanchef",
      sku: "TC-KIT3",
      categoria: "Utensílios de Cozinha",
    },
  },
  "/grande": {
    product: {
      descricao: "Titanchef - Tábua de corte alta resistência - Grande 34x24cm",
      base_value: 79.90,
      valor: 79.90,
      quantidade: 1,
      ref: "TC-GRD-001",
      marca: "Titanchef",
      sku: "TC-GRD34",
      categoria: "Utensílios de Cozinha",
    },
  },
  "/medio": {
    product: {
      descricao: "Titanchef - Tábua de corte alta resistência - Média 30x20cm",
      base_value: 69.90,
      valor: 69.90,
      quantidade: 1,
      ref: "TC-MED-001",
      marca: "Titanchef",
      sku: "TC-MED30",
      categoria: "Utensílios de Cozinha",
    },
  },
  "/pequeno": {
    product: {
      descricao: "Titanchef - Tábua de corte alta resistência - Pequena 25x15cm",
      base_value: 59.90,
      valor: 59.90,
      quantidade: 1,
      ref: "TC-PEQ-001",
      marca: "Titanchef",
      sku: "TC-PEQ25",
      categoria: "Utensílios de Cozinha",
    },
  },
  "/titanchef": {
    product: {
      descricao: "Titanchef - Tábua de corte alta resistência - Kit 3 tamanhos",
      base_value: 89.87,
      valor: 89.87,
      quantidade: 1,
      ref: "TC-KIT3-002",
      marca: "Titanchef",
      sku: "TC-KIT3-V2",
      categoria: "Utensílios de Cozinha",
    },
  },
  "/titanchefgrande": {
    product: {
      descricao: "Titanchef - Tábua de corte alta resistência - Grande 34x24cm",
      base_value: 79.90,
      valor: 79.90,
      quantidade: 1,
      ref: "TC-GRD-002",
      marca: "Titanchef",
      sku: "TC-GRD34-V2",
      categoria: "Utensílios de Cozinha",
    },
  },
  "/titanchefmedio": {
    product: {
      descricao: "Titanchef - Tábua de corte alta resistência - Média 30x20cm",
      base_value: 69.90,
      valor: 69.90,
      quantidade: 1,
      ref: "TC-MED-002",
      marca: "Titanchef",
      sku: "TC-MED30-V2",
      categoria: "Utensílios de Cozinha",
    },
  },
  "/titanchefpequeno": {
    product: {
      descricao: "Titanchef - Tábua de corte alta resistência - Pequena 25x15cm",
      base_value: 59.90,
      valor: 59.90,
      quantidade: 1,
      ref: "TC-PEQ-002",
      marca: "Titanchef",
      sku: "TC-PEQ25-V2",
      categoria: "Utensílios de Cozinha",
    },
  },
}

/**
 * Retorna o produto correspondente à rota do checkout.
 */
export function getProductForRoute(route: string): ProductCatalogEntry {
  return catalog[route] || catalog["/"]
}

/**
 * Cria um item de frete para o array de products da CambioReal.
 */
export function createShippingProduct(shippingCost: number, shippingMethod: string): ProductItem {
  const shippingRefs: Record<string, string> = {
    pac: "FRETE-PAC",
    jadlog: "FRETE-JADLOG",
    sedex: "FRETE-SEDEX",
  }

  return {
    descricao: "Frete",
    base_value: shippingCost,
    valor: shippingCost,
    quantidade: 1,
    ref: shippingRefs[shippingMethod] || "FRETE",
    marca: "",
    sku: "",
    categoria: "Frete",
  }
}
