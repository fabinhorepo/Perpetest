# Infraestrutura - Perpetest

## Componentes

### Docker Compose
Arquivo principal para orquestração local de todos os serviços.

**Serviços:**
- PostgreSQL (banco de dados principal)
- Redis (cache/sessões)
- Backend (Next.js)
- Recommendation Service (Python)
- Delivery Service (Python)

### Dockerfiles
- `../backend/Dockerfile` - Next.js backend
- `../services-python/recommendation/Dockerfile` - Serviço de recomendação
- `../services-python/delivery/Dockerfile` - Serviço de entrega

## Iniciando Ambiente

### Pré-requisitos
- Docker (v20+)
- Docker Compose (v2+)

### Primeiro Acesso

```bash
# Da raiz do projeto
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend
```

### Conectar ao Banco

```bash
# Via psql
psql -h localhost -U perpetest -d perpetest

# Via Docker
docker-compose exec postgres psql -U perpetest -d perpetest
```

### Conectar ao Redis

```bash
# Via redis-cli
docker-compose exec redis redis-cli

# Verificar conectividade
docker-compose exec redis redis-cli ping
```

## Variáveis de Ambiente

As seguintes variáveis são definidas no docker-compose.yml e podem ser sobrescrita:

```yaml
POSTGRES_DB: perpetest
POSTGRES_USER: perpetest
POSTGRES_PASSWORD: perpetest123
DATABASE_URL: postgresql://perpetest:perpetest123@postgres:5432/perpetest
REDIS_URL: redis://redis:6379
NODE_ENV: development
```

## Volumes Persistentes

- `postgres_data` - Dados do PostgreSQL
  - Caminho: `/var/lib/postgresql/data`

## Health Checks

Todos os serviços têm health checks configurados:

```bash
# Backend
curl http://localhost:3000/api/health

# Recommendation
curl http://localhost:8001/health

# Delivery
curl http://localhost:8002/health

# PostgreSQL
docker-compose exec postgres pg_isready -U perpetest

# Redis
docker-compose exec redis redis-cli ping
```

## Troubleshooting

### Porta já em uso
```bash
# Mudar porta no docker-compose.yml ou:
lsof -i :3000  # Encontra processo
kill -9 <PID>   # Mata processo
```

### Banco não inicia
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Inicia fresh
```

### Backend não conecta ao banco
```bash
# Verificar conexão
docker-compose exec backend npm run db:push
```

### Logs
```bash
# Todos os logs
docker-compose logs

# Apenas backend
docker-compose logs backend

# Em tempo real
docker-compose logs -f

# Últimas 100 linhas
docker-compose logs --tail 100
```

## Parar Serviços

```bash
# Parar todos
docker-compose down

# Parar e remover volumes (dados perdidos!)
docker-compose down -v

# Parar serviço específico
docker-compose stop backend
```

## Deployment em Produção

Para deploy no Render (tier free com um webservice):

1. **Consolidar serviços**
   - Mover serviços Python para o backend
   - Ou usar worker threads separados

2. **Usar banco gerenciado**
   - Render PostgreSQL add-on
   - Render Redis add-on

3. **Variáveis de ambiente em produção**
   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=rediss://...  # Note: rediss (TLS)
   NODE_ENV=production
   ```

4. **Build otimizado**
   ```bash
   docker build --target production -t perpetest-prod ./backend
   ```

## Monitoring e Observabilidade

### Prometheus (Futuro)
Preparar endpoints para métricas:
- `/metrics` no backend
- `/metrics` nos serviços Python

### Grafana (Futuro)
Dashboard para monitorar:
- Requisições por segundo
- Latência
- Taxa de erro
- Uso de DB
- Uso de cache

### ELK Stack (Futuro)
Centralizar logs dos serviços.
