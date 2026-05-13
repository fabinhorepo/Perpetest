Perpetest - Arquitetura do Sistema
==================================

## 🏗️ ESTRUTURA MONOREPO

```
perpetest/
│
├── backend/                          # Next.js 14 Backend + BFF
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── catalog/          # E1 - Catálogo (GET /species, /products, /bundles)
│   │   │   │   ├── cart/             # Carrinho (GET, POST items)
│   │   │   │   ├── orders/           # Pedidos (GET, POST, PATCH status)
│   │   │   │   ├── checkout/         # E1+E2 - Checkout Orchestrator
│   │   │   │   ├── inventory/        # E2 - Estoque (reserve, release)
│   │   │   │   ├── projects/         # Projetos de restauração
│   │   │   │   ├── pricing/          # Preços (quote)
│   │   │   │   └── health/           # Health check
│   │   │   ├── layout.tsx            # Layout base
│   │   │   ├── page.tsx              # Homepage
│   │   │   └── globals.css           # Estilos globais
│   │   ├── services/                 # Business Logic
│   │   │   ├── CatalogService.ts     # CRUD de espécies/produtos/bundles
│   │   │   ├── CartService.ts        # Gerenciamento de carrinho
│   │   │   ├── OrderService.ts       # Gerenciamento de pedidos
│   │   │   ├── InventoryService.ts   # Reservas de estoque
│   │   │   ├── PricingService.ts     # Cotação de preços
│   │   │   ├── CheckoutService.ts    # Orquestração (SAGA pattern)
│   │   │   └── ProjectService.ts     # Gerenciamento de projetos
│   │   ├── lib/
│   │   │   ├── db.ts                 # Prisma Client (single connection)
│   │   │   ├── redis.ts              # Redis Client (cache)
│   │   │   ├── logger.ts             # Pino Logger (logging estruturado)
│   │   │   └── api.ts                # Helpers (response, error, validation)
│   │   └── middleware/               # Custom middleware
│   ├── prisma/
│   │   └── schema.prisma             # Toda a modelagem de dados
│   ├── scripts/
│   │   └── seed.js                   # Database seed (espécies, clientes, etc)
│   ├── package.json                  # Dependencies
│   ├── next.config.js                # Next.js config
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.ts            # TailwindCSS config
│   ├── Dockerfile                    # Build para docker
│   ├── .env.local                    # Variáveis de dev (exemplo)
│   ├── .env.example                  # Template de .env
│   └── README.md                     # Documentação do backend
│
├── services-python/                  # Microserviços Python FastAPI
│   ├── recommendation/               # E1 - Recomendação
│   │   ├── main.py                  # FastAPI app (8001)
│   │   ├── Dockerfile
│   │   └── README.md
│   ├── delivery/                     # E2 - Logística & Roteirização
│   │   ├── main.py                  # FastAPI app (8002)
│   │   │                            # - Cálculo de frete
│   │   │                            # - Haversine distance
│   │   │                            # - Opções de entrega
│   │   │                            # - Planejamento de rotas
│   │   ├── Dockerfile
│   │   └── README.md
│   └── requirements.txt              # FastAPI + Pydantic
│
├── infra/                            # Infraestrutura
│   ├── docker-compose.yml            # Orquestração local
│   ├── init.sql                      # Script de inicialização do banco
│   └── README.md                     # Documentação de infra
│
├── docs/                             # Documentação adicional
│
├── docker-compose.yml                # Arquivo principal (root)
├── .gitignore                        # Git ignore
├── README.md                         # Documentação principal
├── QUICKSTART.md                     # Guia rápido
├── ARCHITECTURE.md                   # Este arquivo
└── test-api.sh                       # Script de testes (bash)
```

---

## 📦 TECNOLOGIAS POR LAYER

### Frontend (Próximo Passo)
- React/Next.js 14 (App Router)
- TailwindCSS
- TypeScript
- Fetch API

### Backend (Implementado)
- Node.js 20+
- Next.js 14 (API Routes)
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Pino Logger
- Zod (Validation)

### Serviços Python (Implementado)
- FastAPI 0.104+
- Pydantic
- Python 3.11+
- Math (Haversine)

### Banco de Dados
- PostgreSQL 16 (transações ACID)
- Esquema único com múltiplas tabelas
- Índices em colunas críticas
- Foreign keys para integridade

### Cache & Sessão
- Redis 7
- Ready for session storage
- Ready for rate limiting

### Docker & Orquestração
- Docker containers para cada serviço
- Docker Compose para dev
- Network bridge (perpetest-network)
- Volume persistence para dados

---

## 🔄 FLUXOS DE NEGÓCIO

### Fluxo 1: Catálogo (Browse - E1)

```
Client
  └─→ GET /api/catalog/species[?biome=Mata Atlântica]
      └─→ CatalogService.getAllSpecies()
          └─→ Prisma: SELECT * FROM Species WHERE biome = ?
              └─→ JSON response
```

### Fluxo 2: Projeto + Carrinho

```
Client
  ├─→ POST /api/projects {...}
  │   └─→ ProjectService.createProject()
  │       ├─→ Prisma: INSERT INTO Project
  │       └─→ CartService.getOrCreateCart()
  │           └─→ Prisma: INSERT INTO Cart
  │
  └─→ POST /api/cart/{cartId}/items {...}
      └─→ CartService.addItem()
          └─→ Prisma: INSERT INTO CartItem
              └─→ Increment quantity if duplicate
```

### Fluxo 3: Checkout (E1 + E2) - SAGA PATTERN

```
Client POST /api/checkout/confirm
  │
  ├─1. CheckoutService.confirmCheckout()
  │   ├─2. CartService.getCart() → Items list
  │   ├─3. PricingService.quoteItems() → Price calculation
  │   │   └─ Apply volume discounts
  │   │
  │   ├─4. InventoryService.reserveItems()
  │   │   └─ Check stock, update reservedQty
  │   │
  │   ├─5. OrderService.createOrder()
  │   │   └─ INSERT INTO Order, OrderItem, OrderStatusHistory
  │   │
  │   ├─6. PaymentService (simulated)
  │   │   └─ INSERT INTO Payment (PENDING)
  │   │
  │   ├─7. Update Order status → RESERVED
  │   ├─8. Confirm reservations
  │   ├─9. CartService.clearCart()
  │   │
  │   └─ On Error: Rollback (release reservations)
  │
  └─ Response: { order, payment, transactionLog }
```

### Fluxo 4: Recomendação (E1)

```
Client GET /api/recommendations/projects/{projectId}
  │
  └─→ Python Service (8001)
      ├─ Fetch Project info from Backend
      ├─ Match biome + objective
      ├─ Return: Bundles + cross-sell Products
      └─ JSON response
```

### Fluxo 5: Entrega (E2)

```
Checkout Service
  └─→ POST /api/checkout/prepare
      ├─→ Python Service (8002) POST /delivery/quote
      │   ├─ Calculate distance (Haversine)
      │   ├─ Calculate cost: distance + volume + weight
      │   ├─ Generate options: ECONOMICAL, EXPRESS, DEDICATED
      │   └─ Return: Options with pricing
      │
      └─→ Response to client with shipping options

Client selects option
  └─→ POST /api/checkout/confirm {freightOption: "ECONOMICAL"}
      └─→ Include freight cost in final order amount
```

---

## 🗄️ MODELO DE DADOS (Prisma Schema)

### Domínios

#### 1. Customer & Projects
```
Customer
├─ Address (1→N)
└─ Project (1→N)
   └─ Cart (1→1)
```

#### 2. Catalog
```
Species (1→N) Batch (1→N) NurseryStock (1←→1)
   ↓
Product (1→1) → PriceEntry
   ↓
Bundle (1→N) BundleItem (N→1 Species)
```

#### 3. Cart & Orders
```
Cart (1→N) CartItem
   ├─ ProductId | BundleId
   └─ Quantity

Order (1→N) OrderItem
├─ ProjectId
├─ Status history
└─ Payment (1←→1)
```

#### 4. Delivery
```
Vehicle (1→N) Route (1→N) Stop (N→1 Order)
```

---

## 🔐 Padrões de Segurança

### Input Validation
- Zod schemas para cada endpoint
- Type-safe validation
- Early reject de payloads inválidos

### Database Security
- Prepared statements (Prisma)
- Foreign key constraints
- Check constraints (NOT NULL, UNIQUE)

### API Security (Preparado para)
- JWT authentication (NextAuth)
- Rate limiting
- CORS configuration
- Request logging

---

## 📊 Performance & Scalability

### Indexação
```sql
CREATE INDEX idx_species_biome ON species(biome);
CREATE INDEX idx_product_species_id ON product(speciesId);
CREATE INDEX idx_order_customer_id ON order(customerId);
CREATE INDEX idx_order_status ON order(status);
CREATE INDEX idx_cartitem_cart_id ON cartitem(cartId);
```

### Caching (Redis)
- Cart data
- Product listings
- Recommendations

### Connection Pooling
- Prisma handles automatically
- Single connection to DB per backend instance

---

## 🚀 Deployment (Render - Free Tier)

### Single Webservice Strategy

1. **Consolidate Services**
   - Run all Python code as worker threads in Node
   - OR: Deploy Python services separately on Render free tier

2. **Environment**
   ```
   DATABASE_URL = Render PostgreSQL add-on
   REDIS_URL = Render Redis add-on
   NODE_ENV = production
   ```

3. **Build Process**
   - Next.js build optimization
   - Tree-shaking
   - Image optimization

4. **Monitoring**
   - Render logs via web UI
   - Health check: GET /api/health
   - Automatic restart on failure

---

## 📈 Evolution Path

### Phase 1 (Current)
✅ Core API endpoints
✅ Basic data models
✅ Docker setup

### Phase 2
⬜ Frontend UI (React components)
⬜ Authentication
⬜ Payment integration

### Phase 3
⬜ ML Recommendations (scikit-learn)
⬜ Real VRP solver (Google OR-Tools)
⬜ Real-time delivery tracking (WebSocket)

### Phase 4
⬜ Elasticsearch for full-text search
⬜ Message queue (Kafka/RabbitMQ)
⬜ Kubernetes deployment
⬜ Multi-region replication

---

## 🧪 Testing Strategy

### Unit Tests
- Services business logic
- Utility functions

### Integration Tests
- API endpoints
- Database operations

### E2E Tests (Cypress)
- Complete user flows
- Checkout end-to-end

---

## 📝 API Documentation

Auto-generated via OpenAPI (Swagger) - ready to implement:
- POST /api/docs (Swagger UI)
- POST /api/openapi.json (OpenAPI spec)

---

## 🔗 Referências & Dependências

- Prisma: https://www.prisma.io/
- Next.js: https://nextjs.org/
- FastAPI: https://fastapi.tiangolo.com/
- PostgreSQL: https://www.postgresql.org/
- TailwindCSS: https://tailwindcss.com/
- Pino: https://getpino.io/

---

**Desenvolvido com ❤️ para restauração ambiental 🌱**
