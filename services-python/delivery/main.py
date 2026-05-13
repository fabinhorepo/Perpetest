from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
import math

app = FastAPI(title="Delivery Service", version="1.0.0")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Location(BaseModel):
    latitude: float
    longitude: float

class DeliveryQuoteRequest(BaseModel):
    originLat: float
    originLon: float
    destinationLat: float
    destinationLon: float
    volume: float  # Liters
    weight: float  # kg
    itemsCount: int

class DeliveryQuoteOption(BaseModel):
    id: str
    name: str
    estimatedCost: float
    estimatedDays: int
    description: str

@app.get("/health")
async def health():
    return {"status": "ok", "service": "delivery"}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points on Earth in kilometers.
    """
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

@app.post("/delivery/quote")
async def get_delivery_quote(request: DeliveryQuoteRequest):
    """
    Calculate delivery quote based on distance, volume, and weight.
    Uses haversine formula for distance calculation.
    """
    try:
        # Calculate distance
        distance = haversine_distance(
            request.originLat,
            request.originLon,
            request.destinationLat,
            request.destinationLon
        )
        
        logger.info(f"Calculated distance: {distance:.2f} km")
        
        # Base cost calculation
        # R$ 0.50 per km + R$ 0.10 per liter + R$ 0.05 per kg
        base_cost = (distance * 0.50) + (request.volume * 0.10) + (request.weight * 0.05)
        
        # Generate delivery options
        options = [
            DeliveryQuoteOption(
                id="ECONOMICAL",
                name="Econômico (7-14 dias)",
                estimatedCost=base_cost,
                estimatedDays=10,
                description="Consolidado com outras entregas"
            ),
            DeliveryQuoteOption(
                id="EXPRESS",
                name="Expresso (3-5 dias)",
                estimatedCost=base_cost * 1.5,
                estimatedDays=4,
                description="Entrega mais rápida"
            ),
            DeliveryQuoteOption(
                id="DEDICATED",
                name="Dedicado (1-2 dias)",
                estimatedCost=base_cost * 3,
                estimatedDays=1,
                description="Veículo dedicado para sua entrega"
            )
        ]
        
        logger.info(f"Generated {len(options)} delivery options for distance {distance:.2f}km")
        
        return {
            "distance": round(distance, 2),
            "options": options
        }
        
    except Exception as e:
        logger.error(f"Error calculating delivery quote: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate delivery quote")

@app.post("/delivery/routes/plan")
async def plan_routes(deliveryDate: str, orders: Optional[List[dict]] = None):
    """
    Plan delivery routes for a specific date.
    Simplified implementation: just sorts orders by location.
    """
    try:
        if not orders:
            orders = []
        
        # In a real implementation, this would use a VRP solver
        # For now, just return a simple route
        route = {
            "id": f"route-{deliveryDate}",
            "date": deliveryDate,
            "stops": [
                {
                    "sequence": i + 1,
                    "orderId": order.get("orderId"),
                    "eta": f"{10 + i}:00"
                }
                for i, order in enumerate(orders[:10])
            ],
            "status": "PLANNED"
        }
        
        logger.info(f"Planned route with {len(route['stops'])} stops for {deliveryDate}")
        return route
        
    except Exception as e:
        logger.error(f"Error planning routes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to plan routes")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
