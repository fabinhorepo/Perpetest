#!/bin/bash

# Display project structure
cat << 'EOF'

🌱 PERPETEST - Estrutura Completa

perpetest/
│
├─ 📁 backend/                          Next.js 14 Backend
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ api/
│  │  │  │  ├─ catalog/               📚 Catálogo de mudas (GET especies, products, bundles)
│  │  │  │  ├─ cart/                  🛒 Carrinho (GET, POST items)
│  │  │  │  ├─ orders/                📦 Pedidos (GET, POST, PATCH status)
│  │  │  │  ├─ checkout/              💳 Checkout (E1+E2)
│  │  │  │  ├─ inventory/             📊 Estoque (reserve, release)
│  │  │  │  ├─ projects/              🌍 Projetos de restauração
│  │  │  │  ├─ pricing/               💰 Preços (quote)
│  │  │  │  └─ health/                ❤️  Health check
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ globals.css
│  │  ├─ services/                     Business Logic
│  │  │  ├─ CatalogService.ts
│  │  │  ├─ CartService.ts
│  │  │  ├─ OrderService.ts
│  │  │  ├─ InventoryService.ts
│  │  │  ├─ PricingService.ts
│  │  │  ├─ CheckoutService.ts        ⭐ Orquestração (SAGA)
│  │  │  └─ ProjectService.ts
│  │  ├─ lib/
│  │  │  ├─ db.ts                     🗄️  Prisma
│  │  │  ├─ redis.ts                  ⚡ Cache
│  │  │  ├─ logger.ts                 📝 Logging
│  │  │  └─ api.ts                    🔧 API Utils
│  │  └─ middleware/
│  ├─ prisma/
│  │  └─ schema.prisma                ✨ Modelos completos
│  ├─ scripts/
│  │  └─ seed.js                      🌱 Database seed
│  ├─ __tests__/
│  │  └─ services.test.ts             🧪 Testes
│  ├─ package.json
│  ├─ next.config.js
│  ├─ tsconfig.json
│  ├─ tailwind.config.ts
│  ├─ Dockerfile
│  ├─ .env.local
│  ├─ .env.example
│  └─ README.md
│
├─ 🐍 services-python/
│  ├─ recommendation/                  🤖 E1 - Recomendação
│  │  ├─ main.py                      FastAPI (8001)
│  │  ├─ Dockerfile
│  │  └─ README.md
│  ├─ delivery/                        🚚 E2 - Logística
│  │  ├─ main.py                      FastAPI (8002)
│  │  ├─ Dockerfile
│  │  └─ README.md
│  └─ requirements.txt
│
├─ 🐳 infra/
│  ├─ docker-compose.yml              🎼 Orquestração
│  ├─ init.sql
│  └─ README.md
│
├─ 📚 docs/
├─ docker-compose.yml                 (root)
├─ .gitignore
├─ README.md                          📖 Documentação Principal
├─ QUICKSTART.md                      🚀 Guia Rápido (5 min)
├─ ARCHITECTURE.md                    🏗️  Arquitetura Completa
└─ test-api.sh                        🧪 Script de Testes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 STACK TECNOLÓGICO

Backend:
  • Node.js 20 + Next.js 14 (App Router)
  • TypeScript + Zod (Type Safety)
  • Prisma ORM (Database)
  • PostgreSQL 16 (Data)
  • Redis 7 (Cache)
  • Pino (Logging)
  • TailwindCSS (UI)

Python Services:
  • FastAPI 0.104+
  • Pydantic
  • Math libraries (Haversine)

DevOps:
  • Docker (containerization)
  • Docker Compose (orchestration)
  • Ready for Kubernetes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️  SERVIÇOS EM EXECUÇÃO

Backend:        http://localhost:3000
                GET  /                      (Homepage)
                GET  /api/health            (Health Check)
                GET  /api/catalog/species
                GET  /api/catalog/products
                GET  /api/catalog/bundles
                POST /api/projects
                POST /api/cart/{cartId}/items
                POST /api/orders
                POST /api/checkout/prepare
                POST /api/checkout/confirm

Recommendation: http://localhost:8001
                GET  /health
                POST /recommendations/projects/{id}
                POST /recommendations/cart/{id}

Delivery:       http://localhost:8002
                GET  /health
                POST /delivery/quote
                POST /delivery/routes/plan

PostgreSQL:     localhost:5432
Redis:          localhost:6379

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 QUICKSTART

1. docker-compose up -d
2. curl http://localhost:3000/api/health
3. Abra http://localhost:3000
4. Rode: bash test-api.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Leia Primeiro:

1. README.md               - Visão geral do projeto
2. QUICKSTART.md          - Começa em 5 minutos
3. ARCHITECTURE.md        - Arquitetura técnica completa
4. backend/README.md      - Documentação do backend
5. services-python/       - READMEs dos serviços Python

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ CÓDIGOS PRINCIPAIS

E1 - Marketplace de E-commerce com Recomendação
   ├─ Endpoints: /api/catalog/*, /api/cart/*, /api/pricing/*
   ├─ Service: CatalogService, CartService, PricingService
   └─ Python: /api/recommendations/*

E2 - Módulo de Logística com Otimização de Rotas
   ├─ Endpoints: /api/checkout/*
   ├─ Service: CheckoutService, InventoryService
   └─ Python: /api/delivery/quote, /delivery/routes/plan

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Desenvolvido com ❤️  para restauração ambiental 🌱

EOF
