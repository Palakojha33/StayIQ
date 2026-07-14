from fastapi import APIRouter, HTTPException
from app.schemas.review import ReviewRequest, ReviewResponse
from app.services.review import analyze_review_sentiment

router = APIRouter(prefix="/analyze", tags=["Sentiment & Aspect"])

@router.post("/review", response_model=ReviewResponse)
def analyze_review(request: ReviewRequest):
    try:
        return analyze_review_sentiment(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review analysis failed: {str(e)}")
