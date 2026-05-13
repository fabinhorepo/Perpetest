# Perpetest - Mata Sagrada Ambiental

Plataforma de e-commerce para viveiro de mudas florestais com foco em restauração ambiental, gestão de logística inteligente e recomendação personalizada.

## Características Principais

### E-Commerce (E1)
- Catálogo de mudas florestais com filtros por bioma, grupo ecológico e velocidade de crescimento
- Bundles pré-configurados para diferentes objetivos (APP, RL, enriquecimento, paisagismo)
- Carrinho de compras com recomendações cruzadas (cross-sell)
- Sistema de recomendação inteligente baseado em características do projeto

### Logística e Roteirização (E2)
- Cálculo de frete baseado em distância geográfica e volume
- Opções de entrega: Econômico (7-14 dias), Expresso (3-5 dias), Dedicado (1-2 dias)
- Serviço de otimização de rotas (preparado para VRP)
- Integração com checkout para cálculo de frete em tempo real

### Gestão de Projetos
- Criação e gerenciamento de projetos de restauração ambiental
- Vinculação de compras a projetos específicos
- Histórico de pedidos por projeto

## Arquitetura

```
perpetest/
├── backend/                    # Next.js 14 backend com API routes
│   ├── src/
│   │   ├── app/               # App Router do Next.js
│   │   │   └── api/          # API routes
│   │   │       ├── catalog/
│   │   │       ├── cart/
│   │   │       ├── orders/
│   │   │       ├── checkout/
│   │   │       ├── inventory/
│   │   │       ├── projects/
│   │   │       ├── pricing/
│   │   │       └── health/
│   │   ├── services/          # Business logic
│   │   │   ├── CatalogService.ts
│   │   │   ├── CartService.ts
│   │   │   ├── OrderService.ts
│   │   │   ├── CheckoutService.ts
│   │   │   ├── ProjectService.ts
│   │   │   └── PricingService.ts
│   │   ├── lib/              # Utilities
│   │   │   ├── db.ts         # Prisma
│   │   │   ├── redis.ts      # Cache
│   │   │   ├── logger.ts     # Logging
│   │   │   └── api.ts        # API helpers
│   │   └── middleware/        # Custom middleware
│   ├── prisma/
│   │   └── schema.prisma     # Data models
│   ├── scripts/
│   │   └── seed.js           # Database seeding
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
│
├── services-python/           # Microserviços Python
│   ├── recommendation/        # Recomendação (E1)
│   │   ├── main.py
│   │   ├── Dockerfile
│   │   └── README.md
│   ├── delivery/             # Logística (E2)
│   │   ├── main.py
│   │   ├── Dockerfile
│   │   └── README.md
│   └── requirements.txt
│
├── docker-compose.yml         # Orquestração local
├── README.md                 # Este arquivo
└── docs/                     # Documentação adicional
```

## Stack Tecnológico

### Backend
- **Node.js 20+** com **Next.js 14** (App Router)
- **TypeScript** para type safety
- **Prisma** como ORM
- **PostgreSQL** como banco principal
- **Redis** para cache/sessões
- **Pino** para logging estruturado

### Serviços Python
- **FastAPI** para APIs de recomendação e logística
- **Python 3.11+**
- Pronto para integração com modelos ML

### Containerização
- **Docker** para cada serviço
- **Docker Compose** para ambiente de desenvolvimento
- Preparado para **Kubernetes** em produção

## Quick Start

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 20+ (opcional, para desenvolvimento local)
- Python 3.11+ (opcional, para desenvolvimento dos serviços Python)

### 1. Clone e configure

```bash
git clone <repo-url>
cd perpetest
```

### 2. Configure variáveis de ambiente

```bash
cp backend/.env.example backend/.env
```

### 3. Inicie os serviços

```bash
docker-compose up -d
```

Aguarde a inicialização:
- PostgreSQL: http://localhost:5432
- Redis: http://localhost:6379
- Backend: http://localhost:3000
- Recommendation Service: http://localhost:8001
- Delivery Service: http://localhost:8002

### 4. Verifique se tudo está funcionando

```bash
# Health check do backend
curl http://localhost:3000/api/health

# Health check do serviço de recomendação
curl http://localhost:8001/health

# Health check do serviço de entrega
curl http://localhost:8002/health
```

## API Endpoints

### Catálogo

**GET /api/catalog/species**
```bash
curl "http://localhost:3000/api/catalog/species?biome=Mata%20Atlântica"
```

**GET /api/catalog/products**
```bash
curl "http://localhost:3000/api/catalog/products"
```

**GET /api/catalog/bundles**
```bash
curl "http://localhost:3000/api/catalog/bundles?targetBiome=Mata%20Atlântica"
```

### Projetos

**POST /api/projects**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-id",
    "name": "Projeto Restauração",
    "biome": "Mata Atlântica",
    "areaSizeHa": 5.0,
    "objective": "APP"
  }'
```

### Carrinho

**GET /api/cart/[cartId]**
```bash
curl "http://localhost:3000/api/cart/cart-123"
```

**POST /api/cart/[cartId]/items**
```bash
curl -X POST http://localhost:3000/api/cart/cart-123/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-id",
    "quantity": 100
  }'
```

### Checkout

**POST /api/checkout/prepare**
```bash
curl -X POST http://localhost:3000/api/checkout/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "cart-123",
    "deliveryAddress": "Rua Principal, 123",
    "deliveryLat": -23.5505,
    "deliveryLon": -46.6333
  }'
```

**POST /api/checkout/confirm**
```bash
curl -X POST http://localhost:3000/api/checkout/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "cart-123",
    "customerId": "customer-id",
    "projectId": "project-id",
    "deliveryAddress": "Rua Principal, 123",
    "deliveryLat": -23.5505,
    "deliveryLon": -46.6333,
    "freightOption": "ECONOMICAL",
    "paymentMethod": "PIX"
  }'
```

### Pedidos

**GET /api/orders?customerId=customer-123**
```bash
curl "http://localhost:3000/api/orders?customerId=customer-123"
```

**GET /api/orders/[orderId]**
```bash
curl "http://localhost:3000/api/orders/order-123"
```

### Preços

**POST /api/pricing/quote**
```bash
curl -X POST http://localhost:3000/api/pricing/quote \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": "product-123", "quantity": 100 }
    ]
  }'
```

## Fluxo de Checkout (E1 + E2)

1. **Cliente cria projeto** → `/api/projects`
2. **Cliente adiciona mudas ao carrinho** → `/api/cart/[cartId]/items`
3. **Cliente prepara checkout** → `/api/checkout/prepare`
   - Sistema busca preços
   - Serviço de logística calcula frete (E2)
   - Recomendações sugeridas (E1)
4. **Cliente confirma checkout** → `/api/checkout/confirm`
   - Reserva de inventário
   - Criação de pedido
   - Inicialização de pagamento
   - Limpeza do carrinho
5. **Pedido em produção**
6. **Rota de entrega planejada**
7. **Entrega realizada**

## Testes

### Testes Unitários

**Backend:**
```bash
cd backend
npm test
```

**Python:**
```bash
pip install pytest
pytest services-python/
```

## Deploy (Render - Tier Free)

### Prepare for single webservice

1. Consolidate all services into a single process
2. Use single PostgreSQL instance
3. Remove Redis (use in-memory cache)
4. Deploy on Render

```bash
# Build para produção
docker build -t perpetest-backend ./backend
```

## Próximos Passos

- [ ] Implementar autenticação com NextAuth
- [ ] Criar frontend em React/Next.js (páginas de produtos, carrinho visual)
- [ ] Integração com gateway de pagamento real (Stripe, PagSeguro)
- [ ] Implementar modelos ML para recomendação
- [ ] Integrar solver VRP para otimização real de rotas
- [ ] Adicionar WebSocket para rastreamento de entrega
- [ ] Testes E2E com Cypress
- [ ] Monitoramento com Prometheus + Grafana
- [ ] CI/CD com GitHub Actions

## Documentação

- [Backend README](./backend/README.md)
- [Recommendation Service README](./services-python/recommendation/README.md)
- [Delivery Service README](./services-python/delivery/README.md)

## License

MIT

## Contact

Para dúvidas ou sugestões, entre em contato com o time de desenvolvimento.
