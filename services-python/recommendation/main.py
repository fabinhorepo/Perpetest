from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
import requests

app = FastAPI(title="Recommendation Service", version="1.0.0")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BACKEND_URL = "http://localhost:3000/api"

class BundleRecommendation(BaseModel):
    bundleId: str
    name: str
    reason: str
    score: float

class RecommendationRequest(BaseModel):
    projectId: str
    cartId: Optional[str] = None

@app.get("/health")
async def health():
    return {"status": "ok", "service": "recommendation"}

@app.post("/recommendations/projects/{project_id}")
async def get_project_recommendations(project_id: str):
    """
    Get bundle recommendations for a project based on biome and objective.
    """
    try:
        # In a real implementation, this would:
        # 1. Fetch project details from backend
        # 2. Query a database or ML model
        # 3. Return personalized recommendations
        
        # For now, return mock recommendations
        recommendations = [
            {
                "bundleId": "bundle-1",
                "name": "Bundle de Restauração - Mata Atlântica",
                "reason": "Otimizado para seu bioma e objetivo",
                "score": 0.95
            },
            {
                "bundleId": "bundle-2",
                "name": "Bundle de Enriquecimento",
                "reason": "Complementa bem projetos de restauração",
                "score": 0.85
            }
        ]
        
        logger.info(f"Generated {len(recommendations)} recommendations for project {project_id}")
        return {"recommendations": recommendations}
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@app.post("/recommendations/cart/{cart_id}")
async def get_cart_recommendations(cart_id: str):
    """
    Get cross-sell recommendations based on current cart contents.
    """
    try:
        # Mock recommendations for cross-sell
        recommendations = [
            {
                "productId": "product-1",
                "name": "Espécie Complementar - Guanandi",
                "reason": "Combina bem com sua seleção",
                "score": 0.88
            },
            {
                "productId": "product-2",
                "name": "Espécie Complementar - Ipê",
                "reason": "Aumenta biodiversidade",
                "score": 0.82
            }
        ]
        
        logger.info(f"Generated {len(recommendations)} cross-sell recommendations for cart {cart_id}")
        return {"recommendations": recommendations}
        
    except Exception as e:
        logger.error(f"Error generating cross-sell recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate cross-sell recommendations")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
