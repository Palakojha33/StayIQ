from fastapi import APIRouter, HTTPException
from app.schemas.recovery import (
    RecoveryScoreRequest, 
    RecoveryScoreResponse, 
    ComplaintQueueItem, 
    RecoveryDraftRequest, 
    RecoveryDraftResponse, 
    RecoveryOutcomeRequest, 
    RecoveryOutcomeResponse
)
from app.services.recovery import (
    calculate_escalation_risk, 
    get_complaint_queue, 
    draft_recovery_action, 
    log_recovery_outcome
)

router = APIRouter(prefix="/recovery", tags=["Guest Recovery Copilot"])

@router.post("/score", response_model=RecoveryScoreResponse)
def score_escalation_risk(request: RecoveryScoreRequest):
    try:
        return calculate_escalation_risk(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Escalation risk scoring failed: {str(e)}")

@router.get("/queue", response_model=list[ComplaintQueueItem])
def get_priority_queue():
    try:
        return get_complaint_queue()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Priority Queue: {str(e)}")

@router.post("/draft", response_model=RecoveryDraftResponse)
def generate_draft(request: RecoveryDraftRequest):
    try:
        return draft_recovery_action(request.complaint_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Apology draft generation failed: {str(e)}")

@router.post("/outcome", response_model=RecoveryOutcomeResponse)
def log_outcome(request: RecoveryOutcomeRequest):
    try:
        return log_recovery_outcome(request.complaint_id, request.follow_up_rating)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outcome resolution logging failed: {str(e)}")
