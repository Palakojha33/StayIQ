from fastapi import APIRouter, HTTPException
from app.schemas.recommend import RecommendationRequest, RecommendationResponse
from app.services.recommend import recommend_hotels

router = APIRouter(prefix="/recommend", tags=["Recommendations"])

@router.post("", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest):
    try:
        return recommend_hotels(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hotel recommendation failed: {str(e)}")
