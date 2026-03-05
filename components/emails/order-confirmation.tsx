import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components"

interface OrderConfirmationEmailProps {
  customerName: string
  orderId: string
  amount: number
  paymentMethod: string
  products?: Array<{
    name: string
    quantity: number
    price: number
  }>
  address?: {
    street: string
    city: string
    state: string
    cep: string
  }
}

export function OrderConfirmationEmail({
  customerName,
  orderId,
  amount,
  paymentMethod,
  products = [],
  address,
}: OrderConfirmationEmailProps) {
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount)

  return (
    <Html>
      <Head />
      <Preview>Seu pedido TitanChef foi confirmado! Pedido #{orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://mk6n6kinhajxg1fp.public.blob.vercel-storage.com/Comum%20/logo-katuchef-JsXXPXXFVyY0zzWCjwC8RUx61IAnqx.png"
              width="180"
              height="60"
              alt="Katuchef"
              style={logo}
            />
          </Section>

          {/* Header */}
          <Section style={headerSection}>
            <Heading style={heading}>Pedido Confirmado!</Heading>
            <Text style={subheading}>Obrigado por sua compra, {customerName}!</Text>
          </Section>

          <Hr style={hr} />

          {/* Order Details */}
          <Section style={orderSection}>
            <Text style={sectionTitle}>Detalhes do Pedido</Text>
            <Row>
              <Column>
                <Text style={label}>Número do Pedido:</Text>
                <Text style={value}>#{orderId}</Text>
              </Column>
              <Column>
                <Text style={label}>Forma de Pagamento:</Text>
                <Text style={value}>{paymentMethod === "pix" ? "PIX" : "Cartão de Crédito"}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Products */}
          {products.length > 0 && (
            <Section style={productsSection}>
              <Text style={sectionTitle}>Itens do Pedido</Text>
              {products.map((product, index) => (
                <Row key={index} style={productRow}>
                  <Column style={productName}>
                    <Text style={productText}>
                      {product.quantity}x {product.name}
                    </Text>
                  </Column>
                  <Column style={productPrice}>
                    <Text style={productText}>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(product.price)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* Total */}
          <Section style={totalSection}>
            <Row>
              <Column>
                <Text style={totalLabel}>Total:</Text>
              </Column>
              <Column>
                <Text style={totalValue}>{formattedAmount}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Shipping Address */}
          {address && (
            <Section style={addressSection}>
              <Text style={sectionTitle}>Endereço de Entrega</Text>
              <Text style={addressText}>{address.street}</Text>
              <Text style={addressText}>
                {address.city}, {address.state}
              </Text>
              <Text style={addressText}>CEP: {address.cep}</Text>
            </Section>
          )}

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>Se você tiver alguma dúvida sobre seu pedido, entre em contato conosco.</Text>
            <Text style={footerText}>© {new Date().getFullYear()} TitanChef. Todos os direitos reservados.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
}

const logoSection = {
  padding: "32px 20px",
  textAlign: "center" as const,
}

const logo = {
  margin: "0 auto",
}

const headerSection = {
  padding: "0 40px",
  textAlign: "center" as const,
}

const heading = {
  color: "#16a34a",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 8px",
}

const subheading = {
  color: "#525f7f",
  fontSize: "16px",
  margin: "0",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 40px",
}

const orderSection = {
  padding: "0 40px",
}

const sectionTitle = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  marginBottom: "16px",
}

const label = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0 0 4px",
}

const value = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 16px",
}

const productsSection = {
  padding: "0 40px",
}

const productRow = {
  marginBottom: "8px",
}

const productName = {
  width: "70%",
}

const productPrice = {
  width: "30%",
  textAlign: "right" as const,
}

const productText = {
  color: "#374151",
  fontSize: "14px",
  margin: "0",
}

const totalSection = {
  padding: "16px 40px",
  backgroundColor: "#f9fafb",
}

const totalLabel = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
}

const totalValue = {
  color: "#16a34a",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "right" as const,
}

const addressSection = {
  padding: "0 40px",
}

const addressText = {
  color: "#374151",
  fontSize: "14px",
  margin: "0 0 4px",
}

const footerSection = {
  padding: "0 40px",
  textAlign: "center" as const,
}

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  margin: "0 0 8px",
}

export default OrderConfirmationEmail
