"""
Diagrama de Fluxo de Dados - Perpetest
"""

# Fluxo 1: Checkout Completo (E1 + E2)
#
# Client                          Backend (Next.js)           Python Services         Database
# ├─ Create Project ────────────→ POST /api/projects
# │                              ├─ ProjectService.create()  
# │                              ├─ CartService.getOrCreate()
# │                              └─→ RETURN: Project + Cart
# │
# ├─ Add to Cart ────────────────→ POST /api/cart/items
# │                              ├─ CartService.addItem()
# │                              └─→ RETURN: Updated Cart
# │
# ├─ Prepare Checkout ───────────→ POST /api/checkout/prepare
# │                              ├─ PricingService.quoteItems()
# │                              │
# │                              └─→ POST /delivery/quote  ────→ Python (8002)
# │                                 └─ Haversine distance calc
# │                                 └─ RETURN: 3 Options
# │
# └─ Confirm Checkout ───────────→ POST /api/checkout/confirm
#                                ├─ 1. Get Cart Items
#                                ├─ 2. Quote Pricing
#                                │
#                                ├─ 3. Reserve Inventory  ──→ UPDATE NurseryStock
#                                │
#                                ├─ 4. Create Order    ──→ INSERT Order, OrderItem
#                                │
#                                ├─ 5. Init Payment   ──→ INSERT Payment
#                                │
#                                ├─ 6. Update Status ──→ UPDATE Order (RESERVED)
#                                │
#                                ├─ 7. Clear Cart   ──→ DELETE CartItem
#                                │
#                                └─ RETURN: Order + Payment


# Fluxo 2: Recomendação (E1)
#
# Client
# ├─ Browse Project ──────────────→ GET /api/catalog/bundles[?targetBiome]
# │                              └─ RETURN: Relevant Bundles
# │
# └─ Get Recommendations ────────→ POST /api/recommendations/projects/{id}
#                                ├─ Fetch Project info from DB
#                                │
#                                └─→ GET /recommendations/projects/... (8001)
#                                   ├─ Match biome + objective
#                                   ├─ Apply rules
#                                   └─ RETURN: Suggested Bundles + cross-sell


# Fluxo 3: Entrega (E2)
#
# Checkout Service
# └─ Calculate Freight ──────────→ POST /delivery/quote
#                                ├─ Distance calc (Haversine)
#                                ├─ Cost calc: 0.50/km + 0.10/L + 0.05/kg
#                                ├─ Generate 3 options:
#                                │  ├─ ECONOMICAL (1x)
#                                │  ├─ EXPRESS (1.5x)
#                                │  └─ DEDICATED (3x)
#                                └─ RETURN: Options with ETAs


# Banco de Dados Schema
#
# PostgreSQL
# ├─ Customer
# │  ├─ Address (1→N)
# │  ├─ Project (1→N)
# │  ├─ Order (1→N)
# │  └─ Cart (1→1 per Project)
# │
# ├─ Catalog
# │  ├─ Species
# │  ├─ Batch
# │  ├─ Product (Species → Products)
# │  ├─ Bundle (N Products)
# │  └─ PriceList
# │
# ├─ Cart & Order
# │  ├─ Cart (1→N CartItem)
# │  ├─ CartItem (Product OR Bundle)
# │  ├─ Order (1→N OrderItem)
# │  ├─ OrderItem (Product OR Bundle)
# │  ├─ OrderStatusHistory
# │  └─ Payment (1←→1 Order)
# │
# ├─ Inventory
# │  ├─ NurseryStock (Batch → Stock qty)
# │  └─ Reservation (Track reserves)
# │
# └─ Delivery
#    ├─ Vehicle
#    ├─ Route
#    └─ Stop

---

# ENDPOINTS POR FUNCIONALIDADE

## E1 - MARKETPLACE (E-commerce + Recomendação)

Catálogo:
  GET  /api/catalog/species[?biome]
  GET  /api/catalog/products[?biome]
  GET  /api/catalog/bundles[?targetBiome,targetObjective]

Projetos:
  POST /api/projects
  GET  /api/projects?customerId

Carrinho:
  GET  /api/cart/{cartId}
  POST /api/cart/{cartId}/items
  DELETE /api/cart/{cartId}/items/{itemId}

Preços:
  POST /api/pricing/quote

Recomendação (Python):
  POST /api/recommendations/projects/{projectId}
  POST /api/recommendations/cart/{cartId}

## E2 - LOGÍSTICA (Entrega + Roteirização)

Checkout (Orquestrador):
  POST /api/checkout/prepare
  POST /api/checkout/confirm

Inventário:
  POST /api/inventory/reserve
  POST /api/inventory/release

Delivery (Python):
  POST /delivery/quote
  POST /delivery/routes/plan
  GET  /delivery/orders/{orderId}

Pedidos:
  POST /api/orders
  GET  /api/orders[?customerId]
  GET  /api/orders/{orderId}
  PATCH /api/orders/{orderId}/status

---

# TRANSAÇÕES & ROLLBACK

Checkout Flow (SAGA Pattern):

1. START Transaction
   ├─ Reserve Inventory ─→ ON_ERROR: Release
   ├─ Create Order      ─→ ON_ERROR: Delete Order + Release
   ├─ Init Payment      ─→ ON_ERROR: Cancel Payment + Rollback above
   ├─ Confirm Reserves  ─→ ON_ERROR: Release Inventory
   ├─ Update Order      ─→ ON_ERROR: Rollback Order status
   ├─ Clear Cart        ─→ ON_ERROR: Keep Cart (allow retry)
   └─ COMMIT

On ANY error → Log transaction history → Return error + undo steps

---

# PERFORMANCE OPTIMIZATIONS

Indexing:
  CREATE INDEX idx_species_biome ON species(biome);
  CREATE INDEX idx_product_speciesid ON product(speciesId);
  CREATE INDEX idx_order_customerid ON order(customerId);
  CREATE INDEX idx_order_status ON order(status);
  CREATE INDEX idx_cartitem_cartid ON cartitem(cartId);

Caching (Redis):
  SET   cart:{cartId} → JSON (TTL: 1h)
  GET   products:by_biome:{biome} (TTL: 24h)
  GET   recommendations:project:{projectId} (TTL: 1h)

Connection Pooling:
  Prisma manages automatically
  Single instance per Next.js server

---

# MONITORAMENTO & OBSERVABILIDADE

Logging (Pino):
  ├─ All API requests/responses
  ├─ Database queries (dev only)
  ├─ Business logic events
  └─ Errors with stack trace

Health Check:
  GET /api/health → DB + Redis connectivity

Metrics (Ready for Prometheus):
  ├─ Requests per second
  ├─ Response times (p50, p95, p99)
  ├─ Error rates
  ├─ Database query times
  └─ Cache hit rates

---

# SECURITY LAYERS

Input Validation:
  Zod schemas for all endpoints

Database:
  Foreign key constraints
  CHECK constraints
  NOT NULL constraints

API Auth (Ready):
  NextAuth JWT tokens
  Rate limiting
  CORS

---

🌱 Desenvolvido para restauração ambiental
