# 🚀 Perpetest - Quick Start Guide

## 5 Minutos para Começar

### 1. Pré-requisitos Instalados
```bash
docker --version      # v20+
docker-compose --version  # v2+
```

### 2. Clone e Inicie

```bash
cd perpetest
docker-compose up -d
```

Aguarde ~30 segundos...

### 3. Verif

ique Tudo Rodando

```bash
# Backend
curl http://localhost:3000/api/health

# Recommendation Service
curl http://localhost:8001/health

# Delivery Service
curl http://localhost:8002/health
```

Todos devem retornar `{"status": "ok", ...}`

### 4. Teste Rápido

```bash
# Ver espécies disponíveis
curl http://localhost:3000/api/catalog/species | jq '.'

# Ver bundles
curl http://localhost:3000/api/catalog/bundles | jq '.'
```

### 5. Abra no Navegador

```
http://localhost:3000
```

---

## 📊 Fluxo Completo (Teste Manual)

### A. Criar Projeto
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "name": "Meu Projeto de Restauração",
    "biome": "Mata Atlântica",
    "areaSizeHa": 5.0,
    "objective": "APP"
  }' | jq '.'
```

Guarde `project.id` e `cart.id` dos resultados.

### B. Adicionar Mudas ao Carrinho

```bash
# Primeiro, pegar ID de um produto
PRODUCT_ID=$(curl -s http://localhost:3000/api/catalog/products | jq -r '.data[0].id')

# Adicionar ao carrinho
curl -X POST http://localhost:3000/api/cart/CART_ID/items \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 100
  }" | jq '.'
```

### C. Preparar Checkout

```bash
curl -X POST http://localhost:3000/api/checkout/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "CART_ID",
    "deliveryAddress": "Rua Principal, 123 - São Paulo, SP",
    "deliveryLat": -23.5505,
    "deliveryLon": -46.6333
  }' | jq '.'
```

Veja as opções de frete!

### D. Confirmar Pedido

```bash
curl -X POST http://localhost:3000/api/checkout/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "CART_ID",
    "customerId": "customer-123",
    "projectId": "PROJECT_ID",
    "deliveryAddress": "Rua Principal, 123 - São Paulo, SP",
    "deliveryLat": -23.5505,
    "deliveryLon": -46.6333,
    "freightOption": "ECONOMICAL",
    "paymentMethod": "PIX"
  }' | jq '.'
```

✅ Pedido criado!

---

## 📚 Documentação Completa

- [README Principal](./README.md)
- [Backend README](./backend/README.md)
- [Recommendation Service](./services-python/recommendation/README.md)
- [Delivery Service](./services-python/delivery/README.md)
- [Infra README](./infra/README.md)

---

## 🔧 Desenvolvendo Localmente

### Sem Docker (Desenvolvimento)

#### Backend

```bash
cd backend
npm install
npm run dev
```

Acesse: http://localhost:3000

#### Serviços Python

```bash
cd services-python/recommendation
pip install -r requirements.txt
python main.py
```

Acesso: http://localhost:8001

---

## 🐛 Troubleshooting

### "Connection refused"
```bash
docker-compose restart backend
```

### "Database not found"
```bash
docker-compose down -v
docker-compose up -d
# Aguarde 30 segundos
```

### "Port already in use"
```bash
# Mudar porta em docker-compose.yml ou:
kill -9 $(lsof -t -i:3000)
```

---

## 🎯 Próximos Passos

1. ✅ Estude a arquitetura em [README.md](./README.md)
2. ✅ Implemente autenticação
3. ✅ Crie frontend com componentes React
4. ✅ Integre gateway de pagamento real
5. ✅ Implemente modelos de recomendação ML
6. ✅ Otimize rotas com solver VRP

---

## 💬 Precisa de Ajuda?

- 📖 Leia a documentação de cada serviço
- 🐳 Verifique logs: `docker-compose logs -f`
- 🔍 Teste endpoints com curl ou Postman
- 📞 Entre em contato com o time

---

**Bom desenvolvimento! 🌱**
