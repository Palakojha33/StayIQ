import os
import pickle
import joblib
from app.schemas.cancellation import CancellationRequest, CancellationResponse, RiskFactor

# Global variable to cache the trained model when available
_model = None

def get_cancellation_model():
    global _model
    if _model is None:
        model_path = os.path.join(os.getenv("MODEL_DIR", "app/models"), "cancellation_model.joblib")
        if os.path.exists(model_path):
            try:
                _model = joblib.load(model_path)
            except Exception as e:
                print(f"Error loading cancellation model: {e}")
    return _model

def predict_booking_cancellation(request: CancellationRequest) -> CancellationResponse:
    model = get_cancellation_model()
    
    # If the actual model has been trained and saved, run real inference
    if model is not None:
        try:
            # Prepare feature vector (this is a placeholder for actual training columns)
            # In your notebooks, export the exact feature list needed
            # features = ...
            # prob = model.predict_proba(features)[0][1]
            pass
        except Exception as e:
            print(f"Error running real inference: {e}")
            
    # Mock logic based on empirical rules from hotel booking dataset patterns:
    # 1. Lead time increases risk
    # 2. Non Refund deposits dramatically decrease risk (usually is_canceled probability ~ 0.05 or lower)
    # 3. Previous cancellations increase risk
    # 4. Special requests and parking spaces decrease risk
    
    prob = 0.15  # Base probability
    factors = []
    
    # Lead time impact
    if request.lead_time > 150:
        prob += 0.30
        factors.append(RiskFactor(feature="lead_time", impact="positive", score=0.30))
    elif request.lead_time > 60:
        prob += 0.15
        factors.append(RiskFactor(feature="lead_time", impact="positive", score=0.15))
    else:
        prob -= 0.05
        factors.append(RiskFactor(feature="lead_time", impact="negative", score=-0.05))
        
    # Deposit Type impact
    if request.deposit_type == "Non Refund":
        prob -= 0.25
        factors.append(RiskFactor(feature="deposit_type", impact="negative", score=-0.25))
    elif request.deposit_type == "Refundable":
        prob -= 0.10
        factors.append(RiskFactor(feature="deposit_type", impact="negative", score=-0.10))
    else:
        prob += 0.10
        factors.append(RiskFactor(feature="deposit_type", impact="positive", score=0.10))
        
    # Previous cancellations impact
    if request.previous_cancellations > 0:
        prob += 0.20
        factors.append(RiskFactor(feature="previous_cancellations", impact="positive", score=0.20))
        
    # Special requests impact
    if request.total_of_special_requests > 0:
        deduction = min(0.15, request.total_of_special_requests * 0.05)
        prob -= deduction
        factors.append(RiskFactor(feature="total_of_special_requests", impact="negative", score=-deduction))
        
    # Parking spaces impact
    if request.required_car_parking_spaces > 0:
        prob -= 0.10
        factors.append(RiskFactor(feature="required_car_parking_spaces", impact="negative", score=-0.10))

    # Repeated guest impact
    if request.is_repeated_guest == 1:
        prob -= 0.08
        factors.append(RiskFactor(feature="is_repeated_guest", impact="negative", score=-0.08))

    # Bound probability between 0.02 and 0.98
    prob = max(0.02, min(0.98, prob))
    
    # Classify risk level
    if prob >= 0.60:
        risk_level = "High"
    elif prob >= 0.30:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    # Ensure at least one risk factor is returned if empty
    if not factors:
        factors.append(RiskFactor(feature="base_rate", impact="neutral", score=0.0))
        
    # Sort factors by absolute score value descending
    factors.sort(key=lambda x: abs(x.score), reverse=True)
        
    return CancellationResponse(
        is_canceled_probability=round(prob, 2),
        cancellation_risk_level=risk_level,
        key_risk_factors=factors
    )
