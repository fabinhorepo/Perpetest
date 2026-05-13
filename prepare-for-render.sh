#!/bin/bash

# ════════════════════════════════════════════════════════════════
# PERPETEST - PREPARE FOR RENDER DEPLOYMENT
# ════════════════════════════════════════════════════════════════

echo ""
echo "🚀 Preparando Perpetest para Deploy no Render..."
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Flags
ERRORS=0
WARNINGS=0

# ════════════════════════════════════════════════════════════════
# CHECKLIST
# ════════════════════════════════════════════════════════════════

echo "📋 VERIFICANDO ARQUIVOS..."
echo ""

# 1. render.yaml
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✓${NC} render.yaml encontrado"
else
    echo -e "${RED}✗${NC} render.yaml NÃO encontrado"
    ERRORS=$((ERRORS+1))
fi

# 2. .renderignore
if [ -f ".renderignore" ]; then
    echo -e "${GREEN}✓${NC} .renderignore encontrado"
else
    echo -e "${YELLOW}⚠${NC} .renderignore não encontrado (criar: git create .renderignore)"
    WARNINGS=$((WARNINGS+1))
fi

# 3. backend/package.json
if [ -f "backend/package.json" ]; then
    echo -e "${GREEN}✓${NC} backend/package.json encontrado"
else
    echo -e "${RED}✗${NC} backend/package.json NÃO encontrado"
    ERRORS=$((ERRORS+1))
fi

# 4. backend/tsconfig.json
if [ -f "backend/tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} backend/tsconfig.json encontrado"
else
    echo -e "${RED}✗${NC} backend/tsconfig.json NÃO encontrado"
    ERRORS=$((ERRORS+1))
fi

# 5. backend/prisma/schema.prisma
if [ -f "backend/prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} backend/prisma/schema.prisma encontrado"
else
    echo -e "${RED}✗${NC} backend/prisma/schema.prisma NÃO encontrado"
    ERRORS=$((ERRORS+1))
fi

# 6. backend/next.config.js
if [ -f "backend/next.config.js" ]; then
    echo -e "${GREEN}✓${NC} backend/next.config.js encontrado"
else
    echo -e "${RED}✗${NC} backend/next.config.js NÃO encontrado"
    ERRORS=$((ERRORS+1))
fi

# 7. backend/.env.production
if [ -f "backend/.env.production" ]; then
    echo -e "${GREEN}✓${NC} backend/.env.production encontrado"
else
    echo -e "${YELLOW}⚠${NC} backend/.env.production não encontrado (criar template)"
    WARNINGS=$((WARNINGS+1))
fi

# 8. backend/Dockerfile
if [ -f "backend/Dockerfile" ]; then
    echo -e "${GREEN}✓${NC} backend/Dockerfile encontrado"
else
    echo -e "${YELLOW}⚠${NC} backend/Dockerfile não encontrado (opcional para Render)"
    WARNINGS=$((WARNINGS+1))
fi

echo ""
echo "📦 VERIFICANDO DEPENDÊNCIAS..."
echo ""

# Verificar se node_modules existe
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules já instalado"
else
    echo -e "${YELLOW}⚠${NC} node_modules não encontrado"
    echo "   → Execute: cd backend && npm install"
fi

echo ""
echo "🔍 VERIFICANDO GIT..."
echo ""

# Verificar se está em repo Git
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Repositório Git encontrado"
    
    # Verificar branch
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    echo -e "${GREEN}✓${NC} Branch: $BRANCH"
    
    # Verificar se há mudanças
    if git diff-index --quiet HEAD --; then
        echo -e "${GREEN}✓${NC} Todos os arquivos commitados"
    else
        echo -e "${YELLOW}⚠${NC} Existem mudanças não commitadas"
        echo "   → Execute: git add . && git commit -m 'Ready for Render'"
    fi
else
    echo -e "${RED}✗${NC} Não está em um repositório Git"
    echo "   → Execute: git init"
    ERRORS=$((ERRORS+1))
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 RESUMO"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "Erros: ${RED}${ERRORS}${NC}"
echo -e "Avisos: ${YELLOW}${WARNINGS}${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TUDO PRONTO PARA DEPLOY!${NC}"
    echo ""
    echo "PRÓXIMOS PASSOS:"
    echo "1. git add ."
    echo "2. git commit -m 'Deploy Render'"
    echo "3. git push origin main"
    echo "4. Ir a: https://render.com/dashboard"
    echo "5. New → Blueprint → Conectar repo → Deploy"
    echo ""
else
    echo -e "${RED}❌ EXISTEM ERROS A CORRIGIR${NC}"
    echo ""
    echo "Corrija os erros acima e execute novamente:"
    echo "bash prepare-for-render.sh"
    echo ""
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "💡 DICAS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. render.yaml define toda a infraestrutura"
echo "2. Render lê automaticamente e cria:"
echo "   - PostgreSQL 16 (free tier)"
echo "   - Redis 7 (free tier)"
echo "   - Webservice Node.js"
echo ""
echo "3. Primeiro deploy leva ~5-10 minutos"
echo "4. Verifique logs em: dashboard → perpetest-backend → Logs"
echo ""
echo "5. URL do deploy:"
echo "   https://perpetest-backend.onrender.com"
echo ""
echo "6. Teste com:"
echo "   curl https://perpetest-backend.onrender.com/api/health"
echo ""

exit 0
