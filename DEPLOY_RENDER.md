# 🚀 GUIA DE DEPLOY - RENDER FREE TIER

## 📍 Objetivo
Deploy do **Perpetest** em um único webservice no Render com PostgreSQL e Redis gerenciados.

---

## ✅ PRÉ-REQUISITOS

Antes de começar, você precisa ter:

- [ ] Conta no [Render](https://render.com) (grátis)
- [ ] Repositório Git (GitHub, GitLab, Gitea)
- [ ] Code já commitado no Git
- [ ] Este projeto clonado/versionado

---

## 🔧 PASSO 1: Preparar o Código para Render

### 1.1 Criar `.renderignore` (raiz do projeto)

```
# Ignore arquivos desnecessários
node_modules/
.env
.env.local
.env.*.local
.git
.gitignore
dist/
build/
*.log
.DS_Store
__pycache__/
*.pyc
```

### 1.2 Criar `render.yaml` (raiz do projeto)

Este arquivo define TODA a infraestrutura no Render:

```yaml
databases:
  - name: perpetest-db
    databaseName: perpetest_db
    user: perpetest_user
    plan: free
    version: 16
    region: ohio

  - name: perpetest-redis
    provider: redis
    plan: free
    version: 7
    region: ohio
    evictionPolicy: noeviction

services:
  - type: web
    name: perpetest-backend
    plan: free
    runtime: node
    region: ohio
    buildCommand: |
      cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: perpetest-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: perpetest-redis
          type: redis
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: LOG_LEVEL
        value: info
      - key: JWT_SECRET
        generateValue: true
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: NEXTAUTH_URL
        value: https://perpetest-backend.onrender.com
    healthCheckPath: /api/health
```

### 1.3 Atualizar `backend/package.json`

Adicione scripts de build e start:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "node scripts/seed.js"
  }
}
```

### 1.4 Criar `backend/next.config.js` se não existir

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pino', '@prisma/client'],
  },
  reactStrictMode: true,
}

module.exports = nextConfig
```

### 1.5 Criar `backend/.env.production`

```env
# Database
DATABASE_URL="your-render-database-url"

# Cache
REDIS_URL="your-render-redis-url"

# Environment
NODE_ENV=production
LOG_LEVEL=info

# Security
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://perpetest-backend.onrender.com"

# Services (apontam para endpoint Render)
RECOMMENDATION_SERVICE_URL="https://perpetest-recommendation.onrender.com"
DELIVERY_SERVICE_URL="https://perpetest-delivery.onrender.com"

# Payment (quando integrar)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 🌍 PASSO 2: Preparar Banco de Dados

### 2.1 Criar script de migração

Crie `backend/scripts/migrate.sh`:

```bash
#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node scripts/seed.js

echo "✅ Database ready!"
```

### 2.2 Atualizar Dockerfile

Atualize `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy Prisma schema
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY backend/src ./src
COPY backend/public ./public
COPY backend/tsconfig.json ./
COPY backend/next.config.js ./
COPY backend/.env.production ./.env.production

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

---

## 📤 PASSO 3: Fazer Push para Git

```bash
# Navegar até o projeto
cd c:\Users\KABUM\Documents\Portifólio\Perpetest

# Adicionar ao git
git add .
git commit -m "🚀 Prepare for Render deployment"
git push origin main
```

---

## 🎯 PASSO 4: Deploy no Render (Interface Web)

### 4.1 Acessar Render

1. Vá para https://render.com
2. Faça login (ou crie conta)
3. Clique em **"New +" → "Blueprint"**

### 4.2 Conectar Repositório Git

1. Escolha seu provider (GitHub, GitLab, Gitea)
2. Autorize Render
3. Selecione o repositório `Perpetest`
4. Clique em **"Connect"**

### 4.3 Confirmar Configuração

1. Render lê automaticamente `render.yaml`
2. Revise a configuração:
   - [ ] Database: PostgreSQL 16
   - [ ] Redis: 7
   - [ ] Service: Next.js
   - [ ] Region: Ohio (free tier)
3. Clique em **"Deploy"**

### 4.4 Aguardar Deploy

- ⏳ Pode levar 5-10 minutos
- 📊 Acompanhe na dashboard
- 🔍 Veja logs em "Logs" tab

---

## 🔑 PASSO 5: Configurar Variáveis de Ambiente

Após deploy bem-sucedido:

1. Vá para seu webservice `perpetest-backend`
2. Clique em **"Environment"**
3. As variáveis já devem estar preenchidas automaticamente pelo `render.yaml`
4. **Gere novos secrets:**
   - JWT_SECRET: Clique em "Generate"
   - NEXTAUTH_SECRET: Clique em "Generate"
5. Clique em **"Save"**

---

## 🗄️ PASSO 6: Executar Migrações

Após sucesso do deploy:

1. Na dashboard, clique em **"Shell"** (ou terminal)
2. Execute:

```bash
# Aplicar migrações
npx prisma migrate deploy

# Seed database
node scripts/seed.js

# Verificar status
npx prisma studio
```

---

## ✅ PASSO 7: Testar Deploy

### 7.1 Health Check

```bash
# Substituir URL com sua URL real
curl https://perpetest-backend.onrender.com/api/health

# Resposta esperada:
# {"status":"ok","timestamp":"2026-05-11T12:00:00Z"}
```

### 7.2 Teste de API

```bash
# Listar espécies
curl https://perpetest-backend.onrender.com/api/catalog/species | jq '.'

# Listar produtos
curl https://perpetest-backend.onrender.com/api/catalog/products | jq '.'

# Listar bundles
curl https://perpetest-backend.onrender.com/api/catalog/bundles | jq '.'
```

### 7.3 Teste de Criação

```bash
# Criar cliente
curl -X POST https://perpetest-backend.onrender.com/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Customer"
  }'
```

---

## 🐍 PASSO 8 (OPCIONAL): Deploy de Serviços Python

Se quiser também deployar os serviços Python no Render (em webservices separados):

### 8.1 Criar serviço para Recommendation

Na dashboard do Render:
1. **New → Web Service**
2. Conecte repo
3. **Name:** `perpetest-recommendation`
4. **Start Command:** `cd services-python/recommendation && uvicorn main:app --host 0.0.0.0 --port 8001`
5. **Environment Variables:**
   - DATABASE_URL: [mesma do backend]
   - REDIS_URL: [mesma do backend]

### 8.2 Criar serviço para Delivery

Repita para Delivery:
1. **Name:** `perpetest-delivery`
2. **Start Command:** `cd services-python/delivery && uvicorn main:app --host 0.0.0.0 --port 8002`

### 8.3 Atualizar URLs no Backend

Em `backend/.env.production`:

```env
RECOMMENDATION_SERVICE_URL="https://perpetest-recommendation.onrender.com"
DELIVERY_SERVICE_URL="https://perpetest-delivery.onrender.com"
```

---

## 📊 PASSO 9: Monitorar e Logs

### 9.1 Logs em Tempo Real

Na dashboard:
1. Clique em seu webservice
2. **Logs** → Veja requests em tempo real

### 9.2 Métricas

- CPU: Deve estar < 20% em produção
- Memória: Deve estar < 50%
- Conexões DB: Deve estar < 5

### 9.3 Alertas

Configurar alertas:
1. **Settings** → **Notifications**
2. Habilite email alerts
3. Configure thresholds

---

## 🔧 TROUBLESHOOTING

### Erro: "Build failed"

```bash
# Solução: Verifique logs
# Dashboard → Logs → procure por erro

# Causas comuns:
# - Prisma não gerado
# - Dependências não instaladas
# - TypeScript errors
```

### Erro: "Database connection refused"

```bash
# Solução: Verificar DATABASE_URL
# Vá em: Settings → Environment → DATABASE_URL

# Deve estar assim:
# postgres://user:pass@host:5432/dbname
```

### Erro: "Out of memory"

```bash
# Solução: Free tier tem limite
# - Limpe cache: DELETE FROM Redis
# - Reduza dataset seed
# - Considere upgrade
```

### Aplicação não inicia

```bash
# Solução: Checar prisma:generate
# No build command, certifique-se que:
npm run build
# Já chama: prisma generate
```

---

## 📈 SCALING (Próximo Passo)

Quando precisar escalar:

### Upgrade de Plano

1. **Database:**
   - Free → Standard ($15/mês)
   - Melhor performance e backup

2. **Redis:**
   - Free → Standard ($15/mês)

3. **Webservice:**
   - Free → Starter ($7/mês)
   - Melhor CPU/RAM

### Múltiplas Instâncias

1. Em **Settings** → **Scaling**
2. Aumente **Max Instances**
3. Render fará load balance automaticamente

---

## 🔒 SEGURANÇA EM PRODUÇÃO

### Checklist de Segurança

- [ ] JWT_SECRET é unique (gerado pelo Render)
- [ ] DATABASE_URL não está em código
- [ ] NEXTAUTH_URL é correto (https)
- [ ] Firewall do DB permite apenas Render
- [ ] Backups automáticos habilitados
- [ ] SSL/TLS ativado (automático)
- [ ] Rate limiting configurado
- [ ] CORS properly set

### Configurar CORS

Em `backend/src/lib/api.ts`:

```typescript
export function setupCORS(response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', 'https://your-frontend.com')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}
```

---

## 📊 CUSTOS ESPERADOS

### Render Free Tier
- Webservice: **GRÁTIS** (com sleep após inatividade)
- PostgreSQL: **GRÁTIS** (500 MB, 100 connections)
- Redis: **GRÁTIS** (256 MB)

**Total: $0/mês** ✅

### Se Precisar de Performance

| Tier | Webservice | Database | Redis | Total |
|------|-----------|----------|-------|-------|
| Free | $0 | $0 | $0 | **$0** |
| Starter | $7 | $15 | $15 | **$37** |
| Production | $25+ | $50+ | $50+ | **$125+** |

---

## 🎯 CHECKLIST DE DEPLOY

- [ ] Código em Git
- [ ] render.yaml criado
- [ ] .env.production configurado
- [ ] Dockerfile atualizado
- [ ] Scripts de build/start corretos
- [ ] Primeiras migrações prontas
- [ ] Seed data preparado
- [ ] Git push feito
- [ ] Render conectado ao repo
- [ ] Deploy iniciado
- [ ] Health check passando
- [ ] API endpoints testados
- [ ] Logs sendo monitorados
- [ ] Variáveis de ambiente confirmadas

---

## 🚀 PRÓXIMOS PASSOS

1. **Frontend** (React)
   - Criar UI conectada à API
   - Deploy em Vercel (gratuito)

2. **Domain**
   - Comprar domínio
   - Apontar para Render
   - SSL automático

3. **CI/CD**
   - GitHub Actions
   - Auto-deploy no push

4. **Analytics**
   - Sentry para error tracking
   - LogRocket para user sessions

---

## 📞 SUPORTE

### Links Úteis

- [Render Docs](https://render.com/docs)
- [Render Dashboard](https://dashboard.render.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

### Encontrou erro?

1. Cheque os logs: Dashboard → Logs
2. Teste localmente: `docker-compose up -d`
3. Verifique variáveis de ambiente
4. Consulte documentação do Render

---

## 🎉 SUCESSO!

Se tudo passou nos testes, seu sistema está **LIVE em produção** no Render! 🚀

URL: `https://perpetest-backend.onrender.com`

---

**Data:** 11 de Maio de 2026  
**Versão:** 1.0.0  
**Tempo esperado:** 30-45 minutos  
**Dificuldade:** ⭐⭐ (Fácil com este guia)
