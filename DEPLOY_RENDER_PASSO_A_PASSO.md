# 🚀 DEPLOY NO RENDER FREE TIER - GUIA COMPLETO

## 📋 Índice
1. [Visão Geral & Limites](#visão-geral--limites)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo 1: Preparar o Código](#passo-1-preparar-o-código)
4. [Passo 2: Configurar GitHub](#passo-2-configurar-github)
5. [Passo 3: Criar Conta no Render](#passo-3-criar-conta-no-render)
6. [Passo 4: Deploy via render.yaml](#passo-4-deploy-via-renderyaml)
7. [Passo 5: Verificar e Testar](#passo-5-verificar-e-testar)
8. [Troubleshooting](#troubleshooting)
9. [Monitoramento & Manutenção](#monitoramento--manutenção)

---

## 🎯 Visão Geral & Limites

### O que é Render Free Tier?
Render é uma plataforma de hospedagem que permite fazer deploy de aplicações web, bancos de dados e caches **gratuitamente** com limitações.

### 📊 Limites do Free Tier (2026)

| Recurso | Limite | Detalhes |
|---------|--------|----------|
| **RAM** | 512 MB | Por serviço web |
| **CPU** | ~0.1 vCPU | Compartilhado |
| **Instância-Horas** | 750/mês | ~1 serviço 24/7 |
| **Spin-Down** | 15 minutos | Inativo = hibernação |
| **Cold Start** | ~1 minuto | Tempo de retorno após hibernação |
| **PostgreSQL Storage** | ~1 GB | Grátis, expira em ~30-90 dias |
| **Redis** | ~25 MB | Em-memória, sem persistência |
| **Build Timeout** | ~45 minutos | Limite de tempo de compilação |

### ⚠️ Restrições Importantes
- ❌ Dados do Postgres **desaparecem** após ~30 dias de inatividade
- ❌ Redis **não persiste** dados (tudo é perdido no restart)
- ❌ Serviços ficam dormindo após 15 min sem requisições
- ❌ **Não é adequado para produção** - use apenas para demos/testes
- ✅ Ideal para: protótipos, portfolios, testes, aprendizado

---

## ✅ Pré-requisitos

Antes de começar, você deve ter:

- [x] **Conta GitHub** (ya tiene! ✅ fabinhorepo)
- [x] **Repositório GitHub público** (ya creamos Perpetest! ✅)
- [x] **Todos os arquivos commitados** (ya hizo push! ✅)
- [x] **Conta Render** (vamos criar)
- [x] **Token GitHub pessoal** (vamos gerar)

### Verificar se tudo está no GitHub
```bash
git remote -v
# Deve mostrar:
# origin  https://github.com/fabinhorepo/Perpetest.git (fetch)
# origin  https://github.com/fabinhorepo/Perpetest.git (push)
```

---

## 🔧 PASSO 1: Preparar o Código

### 1.1 Verificar estrutura necessária

Você já tem estes arquivos no projeto:
```
✅ render.yaml          # Configuração de infraestrutura
✅ backend/package.json # Com scripts "build" e "start"
✅ .gitignore           # Arquivo .env ignorado
```

### 1.2 Validar `render.yaml`

Verifique se seu `render.yaml` contém:

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

services:
  - type: web
    name: perpetest-backend
    plan: free
    runtime: node
    region: ohio
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    healthCheckPath: /api/health
```

### 1.3 Validar scripts no `backend/package.json`

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

### 1.4 Criar `.renderignore` (opcional, mas recomendado)

Crie na raiz do projeto:

```
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
.next/
.turbo/
coverage/
```

### ✅ Fazer commit de qualquer mudança

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## 🔐 PASSO 2: Configurar GitHub (Gerar Token)

O Render precisa de acesso ao seu repositório. Vamos gerar um token pessoal.

### 2.1 Acessar GitHub Settings

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** > **"Generate new token (classic)"**

### 2.2 Configurar o Token

Preencha com:
- **Token name**: `Render Deployment`
- **Expiration**: `90 days` (ou nunca expirar)
- **Scopes**: Selecione:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `workflow` (Update GitHub Action workflows)

### 2.3 Copiar e Salvar

```
ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **Salve em lugar seguro!** Você só verá uma vez.

---

## 🌐 PASSO 3: Criar Conta no Render

### 3.1 Acessar Render
Vá para: https://render.com

### 3.2 Sign Up
Clique em **"Get Started"** ou **"Sign Up"**

Opções de signup:
- Email + Senha
- **GitHub** (recomendado - facilita conexão com repos)
- Google
- GitLab

**👍 Recomendação**: Use GitHub para conectar automaticamente

### 3.3 Verificar Email
Você receberá um email de verificação. Confirme.

### 3.4 Dashboard Initial
Você verá um dashboard vazio. Perfeito!

---

## 🚀 PASSO 4: Deploy via render.yaml

### 4.1 Acessar Render Dashboard
https://dashboard.render.com/

### 4.2 Conectar GitHub

1. No dashboard, clique em **"New +"** (canto superior direito)
2. Selecione **"Blueprint" ou "Web Service from Git"**
3. Clique em **"Connect your GitHub account"**

### 4.3 Autorizar Render no GitHub

- Será redirecionado para GitHub
- Clique em **"Authorize render"**
- Render pedirá permissões - aprove

### 4.4 Selecionar Repositório

1. De volta no Render, você verá a lista de repositórios
2. Procure por **"Perpetest"**
3. Clique para selecionar

### 4.5 Selecionar Branch

- **Branch**: `main`
- **Root Directory**: deixar vazio (raiz do repo)

### 4.6 Aprovar Deployment da Blueprint

1. Render detectará o arquivo `render.yaml`
2. Mostrará um preview da infraestrutura
3. Revise e clique em **"Deploy Blueprint"**

Render criará automaticamente:
- ✅ Banco de dados PostgreSQL
- ✅ Cache Redis
- ✅ Web Service (backend)

### 4.7 Esperar Deploy

Você será redirecionado para a página de **Build Logs**.

**Timeline esperado:**
- **0-2 min**: Inicializar build
- **2-10 min**: Download de dependências (`npm install`)
- **10-20 min**: Build do Next.js
- **20-25 min**: Start do serviço
- **Total**: ~5-20 minutos

**Monitor o log:**
```
Cloning from git...
Building backend...
Running npm install...
Running npm run build...
Starting service...
```

---

## ✅ PASSO 5: Verificar e Testar

### 5.1 Verificar Status do Serviço

No dashboard Render:
1. Clique na aba **"Services"**
2. Você verá **"perpetest-backend"**
3. Status deve estar **"Live"** (verde)

### 5.2 Acessar a Aplicação

Render fornecerá uma URL automática:
```
https://perpetest-backend.onrender.com
```

Teste os endpoints:

```bash
# Health check
curl https://perpetest-backend.onrender.com/api/health

# Listar espécies
curl https://perpetest-backend.onrender.com/api/catalog/species

# Listar bundles
curl https://perpetest-backend.onrender.com/api/catalog/bundles
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T01:30:00Z"
}
```

### 5.3 Verificar Banco de Dados

No dashboard Render:
1. Clique na aba **"Databases"**
2. Você verá **"perpetest-db"** (PostgreSQL)
3. Status: **"Available"** (verde)

### 5.4 Verificar Redis

No dashboard Render:
1. Na aba **"Databases"**
2. Você verá **"perpetest-redis"**
3. Status: **"Available"** (verde)

### 5.5 Executar Migrações (se necessário)

Se seu projeto usa Prisma:

```bash
# No seu terminal local
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**Ou** adicione ao `buildCommand` no `render.yaml`:

```yaml
buildCommand: |
  cd backend && npm install && npx prisma migrate deploy && npm run build
```

---

## 🐛 Troubleshooting

### ❌ Erro: "Build failed"

**Causa comum**: Dependências faltando ou `npm install` falhando

**Solução:**
1. Verifique se `package.json` está correto
2. Teste localmente: `npm install && npm run build`
3. Verifique se há arquivos `.env` que não deveriam estar no git

```bash
# Ver logs no Render
# Dashboard > Services > perpetest-backend > Logs
```

---

### ❌ Erro: "Service crashed"

**Causa comum**: Falta de memória (512 MB limite)

**Solução:**
1. Reduza dependências no `package.json`
2. Revise o `next.config.js` para otimizações
3. Use `npm prune --production` antes do deploy

```bash
# Verificar tamanho das dependências
npm ls --depth=0
```

---

### ❌ Erro: "Health check failed"

**Causa comum**: `/api/health` não existe ou retorna erro

**Solução:**
1. Verifique se existe `backend/src/app/api/health/route.ts`
2. Teste localmente: `curl http://localhost:3000/api/health`
3. Se não existe, crie o arquivo

**Criar endpoint de health:**

```typescript
// backend/src/app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  })
}
```

---

### ❌ Erro: "Cannot connect to database"

**Causa comum**: `DATABASE_URL` incorreta ou não configurada

**Solução:**
1. No Render Dashboard > perpetest-db > Connection Info
2. Copie a `Connection String`
3. Render já injecta automaticamente via `fromDatabase`
4. Verifique se seu código lê `process.env.DATABASE_URL`

```typescript
// Verificar em backend/src/lib/db.ts
const databaseUrl = process.env.DATABASE_URL
console.log('Database URL configured:', !!databaseUrl)
```

---

### ❌ Erro: "Redis connection timeout"

**Causa comum**: `REDIS_URL` não configurada

**Solução:**
1. No `render.yaml`, certifique-se de ter:
```yaml
- key: REDIS_URL
  fromService:
    name: perpetest-redis
    type: redis
    property: connectionString
```

2. Teste a conexão:
```typescript
const redis = require('redis')
const client = redis.createClient({
  url: process.env.REDIS_URL
})
```

---

### ⏱️ Erro: "Service spun down"

**Causa comum**: Inatividade > 15 minutos

**Comportamento normal no free tier!**

Solução:
1. Primeira requisição após spin-down levará ~1 minuto
2. Não há como evitar isso no free tier
3. Use pago se precisar de 24/7 instant

---

## 📊 Monitoramento & Manutenção

### 5.1 Acessar Logs

```
Dashboard > Services > perpetest-backend > Logs
```

Monitore:
- ✅ Erros de inicialização
- ✅ Erros de conexão com DB
- ✅ Uso de memória
- ✅ Requisições HTTP

### 5.2 Acompanhar Uso Mensal

```
Dashboard > Settings > Account
```

Você verá:
- Horas usadas de 750
- Próximos reset em: [data]

**Cálculo:**
- 1 serviço web 24/7 = 730 horas/mês ≈ 97% do limite
- Sobra: ~20 horas para testes adicionais

### 5.3 Manter Dados do PostgreSQL

⚠️ **IMPORTANTE**: Postgres expira em ~30 dias no free tier!

**Exportar dados regularmente:**

```bash
# Conexão ao DB do Render
pg_dump -h hostname -U username -d dbname > backup.sql

# Restaurar depois
psql -h hostname -U username -d dbname < backup.sql
```

Automatizar com cron job ou GitHub Actions (para CI/CD).

### 5.4 Monitorar Instância

Render fornece métricas básicas:
```
Dashboard > Services > perpetest-backend > Analytics
```

Veja:
- CPU usage
- Memory usage
- Network I/O
- Requisições por minuto

### 5.5 Configurar Alertas (Render Pro)

Infelizmente, **alertas** são apenas para planos pagos.

Alternativa: Use ferramentas externas como:
- UptimeRobot (gratuito): https://uptimerobot.com
- Pingdom
- Checkly

---

## 🔄 Atualizar Seu Deploy

Sempre que fazer mudanças no código:

```bash
# 1. Fazer mudanças localmente
# 2. Commit
git add .
git commit -m "Update features"

# 3. Push para GitHub
git push origin main

# 4. Render redeploy automático!
# (se "Auto Deploy" estiver ativado)
```

**Verificar Auto Deploy:**
```
Dashboard > Services > perpetest-backend > Settings > Auto Deploy
```

Se estiver OFF, faça deploy manual:
```
Dashboard > Services > perpetest-backend > Manual Deploy
```

---

## 📚 Recursos Úteis

- 📖 Render Docs: https://render.com/docs
- 🆘 Render Support: https://render.com/support
- 🐛 Render Status: https://status.render.com
- 💬 Community: https://render.com/forum

---

## ✨ Resumo: Checklist Final

- [ ] Código está no GitHub (✅ https://github.com/fabinhorepo/Perpetest)
- [ ] `render.yaml` está na raiz do projeto
- [ ] `backend/package.json` tem scripts "build" e "start"
- [ ] Conta Render criada
- [ ] GitHub conectado ao Render
- [ ] Blueprint deploada
- [ ] Serviço rodando (status: Live)
- [ ] `/api/health` retorna 200 OK
- [ ] PostgreSQL e Redis conectados
- [ ] Testes de endpoints funcionando

---

**🎉 Parabéns! Seu Perpetest está no ar!**

URL: `https://perpetest-backend.onrender.com`

**Próximos passos:**
1. Testar todos os endpoints
2. Fazer backup regular dos dados do PostgreSQL
3. Monitorar logs diariamente
4. Planejar upgrade para plano pago se crescer

---

*Última atualização: Maio 2026*
