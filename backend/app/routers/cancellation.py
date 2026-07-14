from fastapi import APIRouter, HTTPException
from app.schemas.cancellation import CancellationRequest, CancellationResponse
from app.services.cancellation import predict_booking_cancellation

router = APIRouter(prefix="/predict", tags=["Cancellation"])

@router.post("/cancellation", response_model=CancellationResponse)
def predict_cancellation(request: CancellationRequest):
    try:
        return predict_booking_cancellation(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cancellation prediction failed: {str(e)}")
