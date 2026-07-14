from fastapi import APIRouter, HTTPException
from app.schemas.price import PriceRequest, PriceResponse
from app.services.price import calculate_dynamic_price

router = APIRouter(prefix="/predict", tags=["Dynamic Pricing"])

@router.post("/price", response_model=PriceResponse)
def predict_price(request: PriceRequest):
    try:
        return calculate_dynamic_price(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dynamic pricing prediction failed: {str(e)}")
