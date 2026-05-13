# Delivery Service

## Overview
Microservice for delivery quote calculation and route optimization.

## Setup

```bash
pip install -r requirements.txt
```

## Running

```bash
python main.py
```

Service will be available at `http://localhost:8002`

## API Endpoints

### Health Check
```bash
curl http://localhost:8002/health
```

### Get Delivery Quote

```bash
curl -X POST http://localhost:8002/delivery/quote \
  -H "Content-Type: application/json" \
  -d '{
    "originLat": -23.5505,
    "originLon": -46.6333,
    "destinationLat": -23.6000,
    "destinationLon": -46.7000,
    "volume": 100.0,
    "weight": 50.0,
    "itemsCount": 100
  }'
```

Response:
```json
{
  "distance": 8.5,
  "options": [
    {
      "id": "ECONOMICAL",
      "name": "Econômico (7-14 dias)",
      "estimatedCost": 8.5,
      "estimatedDays": 10,
      "description": "Consolidado com outras entregas"
    },
    {
      "id": "EXPRESS",
      "name": "Expresso (3-5 dias)",
      "estimatedCost": 12.75,
      "estimatedDays": 4,
      "description": "Entrega mais rápida"
    },
    {
      "id": "DEDICATED",
      "name": "Dedicado (1-2 dias)",
      "estimatedCost": 25.5,
      "estimatedDays": 1,
      "description": "Veículo dedicado para sua entrega"
    }
  ]
}
```

### Plan Routes

```bash
curl -X POST http://localhost:8002/delivery/routes/plan \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryDate": "2024-01-15",
    "orders": [
      {"orderId": "order-1"},
      {"orderId": "order-2"}
    ]
  }'
```

## Implementation Notes

- Uses Haversine formula for distance calculation
- Cost calculation: R$ 0.50/km + R$ 0.10/liter + R$ 0.05/kg
- Pricing multipliers: Express (1.5x), Dedicated (3x)
- Ready for integration with real VRP (Vehicle Routing Problem) solvers
- Can be extended with actual vehicle tracking and real-time optimization
