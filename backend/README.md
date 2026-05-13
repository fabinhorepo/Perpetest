# Backend - Perpetest

Backend da plataforma Perpetest usando Next.js 14 com App Router.

## Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── catalog/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── checkout/
│   │   ├── inventory/
│   │   ├── projects/
│   │   ├── pricing/
│   │   └── health/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/                   # Utilities & helpers
│   ├── db.ts             # Prisma client
│   ├── redis.ts          # Redis client
│   ├── logger.ts         # Pino logger
│   └── api.ts            # API helpers
├── services/              # Business logic
│   ├── CatalogService.ts
│   ├── CartService.ts
│   ├── OrderService.ts
│   ├── InventoryService.ts
│   ├── PricingService.ts
│   ├── CheckoutService.ts
│   └── ProjectService.ts
└── middleware/            # Custom middleware
```

## Ambiente de Desenvolvimento

### Instalação

```bash
npm install
```

### Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Configure as variáveis conforme seu ambiente.

### Rodando Localmente

```bash
npm run dev
```

Acesse http://localhost:3000

### Banco de Dados

#### Sync Schema com Banco (desenvolvimento)
```bash
npm run db:push
```

#### Criar Migrations
```bash
npm run db:migrate
```

#### Seed do Banco
```bash
npm run db:seed
```

#### Abrir Prisma Studio
```bash
npm run db:studio
```

## Testes

```bash
npm test
npm run test:watch
```

## Build para Produção

```bash
npm run build
npm start
```

## Estrutura de Serviços

### CatalogService
Gerencia catálogo de espécies, produtos e bundles.

**Métodos:**
- `getAllSpecies(biome?)` - Lista espécies
- `getSpeciesById(id)` - Busca espécie por ID
- `createSpecies(data)` - Cria nova espécie
- `getAllProducts(biome?)` - Lista produtos
- `getProductById(id)` - Busca produto por ID
- `getAllBundles(targetBiome?, targetObjective?)` - Lista bundles
- `getBundleById(id)` - Busca bundle por ID

### CartService
Gerencia carrinho de compras.

**Métodos:**
- `getOrCreateCart(customerId, projectId?)` - Cria ou busca carrinho
- `getCart(cartId)` - Busca carrinho com items
- `addItem(cartId, data)` - Adiciona item ao carrinho
- `removeItem(itemId)` - Remove item do carrinho
- `clearCart(cartId)` - Limpa todo o carrinho

### InventoryService
Gerencia reservas de estoque.

**Métodos:**
- `reserveItems(items, expiresAt)` - Reserva múltiplos itens
- `confirmReservations(reservationIds)` - Confirma reservas
- `releaseReservations(reservationIds)` - Libera reservas

### OrderService
Gerencia pedidos.

**Métodos:**
- `createOrder(data)` - Cria novo pedido
- `getOrder(id)` - Busca pedido por ID
- `updateOrderStatus(orderId, status, reason?)` - Atualiza status
- `getCustomerOrders(customerId)` - Lista pedidos do cliente

### PricingService
Gerencia preços e cotações.

**Métodos:**
- `getProductPrice(productId)` - Busca preço de produto
- `quoteItems(items, customerType?)` - Cotação de itens

### CheckoutService
Orquestra o fluxo de checkout.

**Métodos:**
- `prepareCheckout(input)` - Prepara checkout com opções de frete
- `confirmCheckout(input)` - Confirma e efetiva pedido

### ProjectService
Gerencia projetos de restauração.

**Métodos:**
- `createProject(data)` - Cria novo projeto
- `getProject(id)` - Busca projeto
- `getCustomerProjects(customerId)` - Lista projetos do cliente
- `updateProject(id, data)` - Atualiza projeto

## API Endpoints

### Catálogo

**GET /api/catalog/species**
- Query params: `biome` (opcional)
- Retorna: Lista de espécies

**GET /api/catalog/products**
- Query params: `biome` (opcional)
- Retorna: Lista de produtos

**GET /api/catalog/bundles**
- Query params: `targetBiome`, `targetObjective` (opcionais)
- Retorna: Lista de bundles

### Projetos

**POST /api/projects**
- Body: `{ customerId, name, biome, areaSizeHa, objective, ... }`
- Retorna: Projeto criado + carrinho associado

**GET /api/projects**
- Query params: `customerId` (obrigatório)
- Retorna: Lista de projetos do cliente

### Carrinho

**GET /api/cart/[cartId]**
- Retorna: Carrinho com items

**POST /api/cart/[cartId]/items**
- Body: `{ productId | bundleId, quantity }`
- Retorna: Item adicionado + carrinho atualizado

### Pedidos

**GET /api/orders**
- Query params: `customerId` (obrigatório)
- Retorna: Lista de pedidos do cliente

**GET /api/orders/[orderId]**
- Retorna: Detalhes do pedido

**POST /api/orders**
- Body: Dados do novo pedido
- Retorna: Pedido criado

### Preços

**POST /api/pricing/quote**
- Body: `{ items: [{ productId | bundleId, quantity }] }`
- Retorna: Cotação com subtotal, descontos, frete

### Checkout

**POST /api/checkout/prepare**
- Body: `{ cartId, deliveryAddress, deliveryLat?, deliveryLon? }`
- Retorna: Opções de frete + pricing

**POST /api/checkout/confirm**
- Body: `{ cartId, customerId, deliveryAddress, freightOption, paymentMethod }`
- Retorna: Pedido confirmado + status de pagamento

### Health

**GET /api/health**
- Retorna: Status do serviço

## Exemplos de Requisições

### Criar Projeto
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-123",
    "name": "Restauração Mata Atlântica",
    "biome": "Mata Atlântica",
    "areaSizeHa": 5.0,
    "objective": "APP"
  }'
```

### Adicionar item ao carrinho
```bash
curl -X POST http://localhost:3000/api/cart/cart-456/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-789",
    "quantity": 100
  }'
```

### Preparar checkout
```bash
curl -X POST http://localhost:3000/api/checkout/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "cart-456",
    "deliveryAddress": "Rua Principal, 123",
    "deliveryLat": -23.5505,
    "deliveryLon": -46.6333
  }'
```

### Confirmar checkout
```bash
curl -X POST http://localhost:3000/api/checkout/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "cart-456",
    "customerId": "cust-123",
    "deliveryAddress": "Rua Principal, 123",
    "freightOption": "ECONOMICAL",
    "paymentMethod": "PIX"
  }'
```

## Logging

Logs estruturados são gerados usando Pino. Configure o nível em `.env`:

```
LOG_LEVEL=debug  # debug, info, warn, error
```

## Tratamento de Erros

Todos os endpoints retornam erro padronizado:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

Códigos comuns:
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Performance

- Cache em Redis para queries frequentes
- Índices em banco de dados para queries críticas
- Paginação implementada onde necessário
- Gzip compression habilitado

## Segurança

- Validação de input com Zod
- SQL injection prevenido pelo Prisma
- CORS configurável
- Rate limiting preparado para implementação
