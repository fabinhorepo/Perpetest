# Recommendation Service

## Overview
Microservice for generating bundle recommendations and cross-sell suggestions based on project characteristics and cart contents.

## Setup

```bash
pip install -r requirements.txt
```

## Running

```bash
python main.py
```

Service will be available at `http://localhost:8001`

## API Endpoints

### Health Check
```bash
curl http://localhost:8001/health
```

### Get Project Recommendations
```bash
curl -X POST http://localhost:8001/recommendations/projects/project-123
```

Response:
```json
{
  "recommendations": [
    {
      "bundleId": "bundle-1",
      "name": "Bundle de Restauração - Mata Atlântica",
      "reason": "Otimizado para seu bioma e objetivo",
      "score": 0.95
    }
  ]
}
```

### Get Cart Cross-Sell Recommendations
```bash
curl -X POST http://localhost:8001/recommendations/cart/cart-123
```

Response:
```json
{
  "recommendations": [
    {
      "productId": "product-1",
      "name": "Espécie Complementar - Guanandi",
      "reason": "Combina bem com sua seleção",
      "score": 0.88
    }
  ]
}
```

## Implementation Notes

- Currently uses heuristic-based recommendations
- Ready for upgrade to ML models (collaborative filtering, content-based)
- Integrates with backend API for project/cart data
- Can be easily extended with user preference tracking
