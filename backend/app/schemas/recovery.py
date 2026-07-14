from pydantic import BaseModel, Field

class RecoveryScoreRequest(BaseModel):
    review_text: str = Field(..., description="Complaint review message text", examples=["The room was extremely dirty and the sheets had stains."])
    loyalty_tier: str = Field(..., description="Guest loyalty tier ('Standard', 'Silver', 'Gold', 'Platinum')", examples=["Gold"])
    past_complaints_count: int = Field(..., ge=0, description="Number of past complaints logged by this guest", examples=[2])
    sentiment_score: float = Field(..., ge=0.0, le=1.0, description="Sentiment score from Module 2 (0=Very Negative, 1=Very Positive)", examples=[0.15])

class RecoveryScoreResponse(BaseModel):
    escalation_risk_score: float = Field(..., description="Likelihood of public escalation or guest churn (0 to 100)", examples=[78.5])
    risk_band: str = Field(..., description="Risk intensity classification ('Low', 'Medium', 'High', 'Critical')", examples=["High"])
    negation_count: int = Field(..., description="Count of negation/frustration keywords detected in review", examples=[2])
    rating_mismatch: bool = Field(..., description="Flag if review text sentiment conflicts with rating pattern", examples=[True])

class ComplaintQueueItem(BaseModel):
    complaint_id: str = Field(..., description="Unique complaint identifier")
    guest_name: str = Field(..., description="Name of guest")
    loyalty_tier: str = Field(..., description="Loyalty level")
    review_text: str = Field(..., description="Complaint details")
    escalation_risk_score: float = Field(..., description="Calculated escalation score")
    risk_band: str = Field(..., description="Risk category")
    aspect: str = Field(..., description="Identified problem category (cleanliness, staff, etc.)")
    status: str = Field("open", description="Complaint status ('open', 'resolved')")

class RecoveryDraftRequest(BaseModel):
    complaint_id: str = Field(..., description="Target complaint ID", examples=["comp_001"])

class RecoveryDraftResponse(BaseModel):
    complaint_id: str = Field(..., description="Complaint ID reference")
    draft_apology: str = Field(..., description="AI-generated personalized apology draft text")
    suggested_compensation: str = Field(..., description="Optimized suggested compensation based on tier and risk")
    assigned_department: str = Field(..., description="Responsible hotel department to handle issue")

class RecoveryOutcomeRequest(BaseModel):
    complaint_id: str = Field(..., description="Complaint ID reference", examples=["comp_001"])
    follow_up_rating: int = Field(..., ge=1, le=5, description="Follow-up satisfaction rating left by guest (1-5)", examples=[4])

class RecoveryOutcomeResponse(BaseModel):
    success: bool = Field(..., description="Status of outcome logging")
    message: str = Field(..., description="Description of resolution status")
    new_recovery_effectiveness: float = Field(..., description="Updated percentage of successful guest recoveries")
