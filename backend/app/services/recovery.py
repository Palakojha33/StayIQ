import re
import uuid
from app.schemas.recovery import (
    RecoveryScoreRequest, 
    RecoveryScoreResponse, 
    ComplaintQueueItem, 
    RecoveryDraftResponse, 
    RecoveryOutcomeResponse
)

# In-Memory Database for demonstration
COMPLAINT_DATABASE = [
    ComplaintQueueItem(
        complaint_id="comp_001",
        guest_name="John Doe",
        loyalty_tier="Platinum",
        review_text="The bathroom shower was dirty and sheets had dust. Very disappointed with housekeeping.",
        escalation_risk_score=88.5,
        risk_band="Critical",
        aspect="cleanliness",
        status="open"
    ),
    ComplaintQueueItem(
        complaint_id="comp_002",
        guest_name="Mary Smith",
        loyalty_tier="Gold",
        review_text="The reception clerk at front desk was extremely rude. Delayed check-in for 45 minutes.",
        escalation_risk_score=76.0,
        risk_band="High",
        aspect="staff",
        status="open"
    ),
    ComplaintQueueItem(
        complaint_id="comp_003",
        guest_name="Robert Johnson",
        loyalty_tier="Silver",
        review_text="The food at the breakfast buffet was freezing cold and tasted old. Terrible dining quality.",
        escalation_risk_score=55.0,
        risk_band="Medium",
        aspect="food",
        status="open"
    ),
    ComplaintQueueItem(
        complaint_id="comp_004",
        guest_name="Emily Davis",
        loyalty_tier="Standard",
        review_text="Charged an extra $30 facility fee that wasn't mentioned. Overpriced value and dishonest billing.",
        escalation_risk_score=42.0,
        risk_band="Medium",
        aspect="value",
        status="open"
    )
]

# Track historical counts for Recovery Effectiveness index
HISTORICAL_TOTAL = 12
HISTORICAL_RESOLVED = 8

FRUSTRATION_KEYWORDS = ["dirty", "rude", "cold", "bad", "terrible", "worst", "slow", "delay", "charge", "refund", "fee", "disappointed", "never", "overpriced", "stains"]

def calculate_escalation_risk(request: RecoveryScoreRequest) -> RecoveryScoreResponse:
    text = request.review_text.lower()
    
    # 1. Negation/frustration keyword count
    negation_count = 0
    for kw in FRUSTRATION_KEYWORDS:
        negation_count += len(re.findall(r'\b' + re.escape(kw) + r'\b', text))
        
    # 2. Rating Mismatch Detection
    # If sentiment is very negative but guest is repeated/high tier, or vice versa, flag mismatch
    rating_mismatch = False
    if request.sentiment_score < 0.35 and request.past_complaints_count == 0 and request.loyalty_tier in ["Gold", "Platinum"]:
        rating_mismatch = True

    # 3. Compute Risk Score (out of 100)
    # Factor A: Sentiment (lower sentiment -> higher risk)
    sentiment_factor = (1.0 - request.sentiment_score) * 45
    
    # Factor B: Past complaint history (past complaints compound risk)
    history_factor = min(30.0, request.past_complaints_count * 10)
    
    # Factor C: Keywords intensity
    keyword_factor = min(15.0, negation_count * 5.0)
    
    # Factor D: Loyalty multiplier (Gold/Platinum escalations have higher business impact/churn cost)
    tier_boost = 0.0
    if request.loyalty_tier == "Platinum":
        tier_boost = 10.0
    elif request.loyalty_tier == "Gold":
        tier_boost = 5.0

    risk_score = sentiment_factor + history_factor + keyword_factor + tier_boost
    risk_score = max(5.0, min(99.0, risk_score)) # Bound between 5 and 99
    
    # Categorize Risk Band
    if risk_score >= 85.0:
        band = "Critical"
    elif risk_score >= 60.0:
        band = "High"
    elif risk_score >= 30.0:
        band = "Medium"
    else:
        band = "Low"
        
    return RecoveryScoreResponse(
        escalation_risk_score=round(risk_score, 1),
        risk_band=band,
        negation_count=negation_count,
        rating_mismatch=rating_mismatch
    )

def get_complaint_queue() -> list[ComplaintQueueItem]:
    # Return only open complaints sorted by risk score descending
    open_complaints = [c for c in COMPLAINT_DATABASE if c.status == "open"]
    open_complaints.sort(key=lambda x: x.escalation_risk_score, reverse=True)
    return open_complaints

def determine_compensation(tier: str, band: str) -> str:
    # Gold/Platinum x High/Critical
    if tier == "Platinum":
        if band in ["Critical", "High"]:
            return "Complimentary Stay Night voucher + VIP Spa treatment access"
        return "Room Upgrade + Complimentary dinner credit ($50 value)"
    elif tier == "Gold":
        if band in ["Critical", "High"]:
            return "Room Upgrade voucher + Complimentary dinner credit ($35 value)"
        return "Dining credit voucher ($35 value)"
    elif tier == "Silver":
        if band in ["Critical", "High"]:
            return "20% discount coupon off next stay reservation"
        return "Dining credit voucher ($25 value)"
    else: # Standard
        if band in ["Critical", "High"]:
            return "15% discount coupon off next stay reservation"
        return "Complimentary beverage drink voucher at hotel bar"

def determine_department(aspect: str) -> str:
    mapping = {
        "cleanliness": "Housekeeping Department",
        "staff": "Front Desk & Guest Services",
        "food": "Food & Beverage (F&B) Management",
        "location": "Guest Relations (Noise/Facilities)",
        "value": "Finance & Front Office billing desk"
    }
    return mapping.get(aspect.lower(), "Duty Manager Desk")

def generate_apology_draft(guest_name: str, aspect: str, compensation: str) -> str:
    # A template generator representing the placeholder step (easily replaced with OpenAI/Gemini SDK later)
    aspect_descriptions = {
        "cleanliness": "the cleanliness standards of your room not meeting expectations",
        "staff": "the unacceptable check-in wait times and customer service from our front office team",
        "food": "the quality and temperature issues experienced during your breakfast service",
        "location": "the noise and convenience disturbances during your stay",
        "value": "the misunderstanding regarding billing fees and perceived value"
    }
    desc = aspect_descriptions.get(aspect.lower(), "the inconvenience and service issues experienced during your stay")
    
    draft = (
        f"Dear {guest_name},\n\n"
        f"On behalf of hotel management, I want to personally apologize for the issues regarding {desc}. "
        f"We take pride in providing seamless comfort, and we fell short of our standard during your visit.\n\n"
        f"To restore your confidence, we would like to offer you a {compensation}. "
        f"A member of our management team will coordinate directly to arrange this for you.\n\n"
        f"We appreciate your feedback and hope to welcome you back for a truly exceptional stay.\n\n"
        f"Warm regards,\n"
        f"Guest Recovery Operations Team"
    )
    return draft

def draft_recovery_action(complaint_id: str) -> RecoveryDraftResponse:
    # Find complaint in database
    complaint = next((c for c in COMPLAINT_DATABASE if c.complaint_id == complaint_id), None)
    if not complaint:
        # Fallback dummy if not found
        complaint = ComplaintQueueItem(
            complaint_id=complaint_id,
            guest_name="Valued Guest",
            loyalty_tier="Standard",
            review_text="Service issue",
            escalation_risk_score=50.0,
            risk_band="Medium",
            aspect="general",
            status="open"
        )
        
    comp = determine_compensation(complaint.loyalty_tier, complaint.risk_band)
    dept = determine_department(complaint.aspect)
    apology = generate_apology_draft(complaint.guest_name, complaint.aspect, comp)
    
    return RecoveryDraftResponse(
        complaint_id=complaint.complaint_id,
        draft_apology=apology,
        suggested_compensation=comp,
        assigned_department=dept
    )

def log_recovery_outcome(complaint_id: str, follow_up_rating: int) -> RecoveryOutcomeResponse:
    global HISTORICAL_RESOLVED
    
    # Mark complaint as resolved in database
    complaint = next((c for c in COMPLAINT_DATABASE if c.complaint_id == complaint_id), None)
    
    if complaint:
        complaint.status = "resolved"
        # If the follow-up rating is positive (>= 4), it's a successful recovery
        if follow_up_rating >= 4:
            HISTORICAL_RESOLVED += 1
            msg = f"Complaint '{complaint_id}' successfully resolved. Guest recovery accepted with positive feedback ({follow_up_rating}/5)."
        else:
            msg = f"Complaint '{complaint_id}' marked resolved. Guest feedback remains negative ({follow_up_rating}/5)."
    else:
        # Fallback dummy outcome
        HISTORICAL_RESOLVED += 1
        msg = f"Resolved external complaint '{complaint_id}'."
        
    # Calculate recovery effectiveness: (resolved / total) * 100
    total_runs = HISTORICAL_TOTAL + (len(COMPLAINT_DATABASE) - len([c for c in COMPLAINT_DATABASE if c.status == "open"]))
    effectiveness = (HISTORICAL_RESOLVED / total_runs) * 100.0
    
    return RecoveryOutcomeResponse(
        success=True,
        message=msg,
        new_recovery_effectiveness=round(effectiveness, 1)
    )
