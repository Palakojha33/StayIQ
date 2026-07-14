from datetime import datetime
from app.schemas.price import PriceRequest, PriceResponse, PriceFactorAdjustment

def calculate_dynamic_price(request: PriceRequest) -> PriceResponse:
    base_price = request.base_price
    current_price = base_price
    adjustments = []
    
    # 1. Occupancy Rate Adjustment
    # High occupancy -> Raise price (high demand)
    # Low occupancy -> Lower price (increase bookings)
    occupancy_pct = request.occupancy_rate
    occupancy_adj = 0.0
    if occupancy_pct > 0.85:
        # Strong demand
        occupancy_adj = base_price * 0.25
        adjustments.append(PriceFactorAdjustment(
            factor="Occupancy (High >85%)",
            adjustment_amount=round(occupancy_adj, 2),
            impact="increase"
        ))
    elif occupancy_pct > 0.70:
        occupancy_adj = base_price * 0.12
        adjustments.append(PriceFactorAdjustment(
            factor="Occupancy (Moderate-High >70%)",
            adjustment_amount=round(occupancy_adj, 2),
            impact="increase"
        ))
    elif occupancy_pct < 0.40:
        # Low demand, offer discount
        occupancy_adj = -base_price * 0.15
        adjustments.append(PriceFactorAdjustment(
            factor="Occupancy (Low <40%)",
            adjustment_amount=round(occupancy_adj, 2),
            impact="decrease"
        ))
    else:
        adjustments.append(PriceFactorAdjustment(
            factor="Occupancy (Standard)",
            adjustment_amount=0.0,
            impact="neutral"
        ))
        
    current_price += occupancy_adj
    
    # 2. Seasonality Index Adjustment
    season_idx = request.seasonality_index
    if season_idx is None:
        # Try to infer seasonality from date month
        try:
            date_obj = datetime.strptime(request.date, "%Y-%m-%d")
            month = date_obj.month
            # Peak: July (7), August (8), Dec (12)
            if month in [7, 8]:
                season_idx = 1.30
            elif month in [12, 5, 6]:
                season_idx = 1.15
            elif month in [1, 2, 11]:
                season_idx = 0.85 # low season
            else:
                season_idx = 1.0
        except Exception:
            season_idx = 1.0
            
    season_adj = 0.0
    if season_idx != 1.0:
        season_adj = base_price * (season_idx - 1.0)
        impact_dir = "increase" if season_idx > 1.0 else "decrease"
        adjustments.append(PriceFactorAdjustment(
            factor=f"Seasonality (Index {season_idx:.2f})",
            adjustment_amount=round(season_adj, 2),
            impact=impact_dir
        ))
        
    current_price += season_adj
    
    # 3. Cancellation Risk Adjustment
    # If cancellation risk is high, offer a discount but suggest a non-refundable rate
    risk_score = request.cancellation_risk_score
    risk_adj = 0.0
    if risk_score > 0.60:
        risk_adj = -base_price * 0.08
        adjustments.append(PriceFactorAdjustment(
            factor="Cancellation Risk Mitigation (High Risk)",
            adjustment_amount=round(risk_adj, 2),
            impact="decrease"
        ))
    elif risk_score < 0.20:
        # Low risk, we can charge a slight premium or maintain
        adjustments.append(PriceFactorAdjustment(
            factor="Cancellation Risk (Low Risk)",
            adjustment_amount=0.0,
            impact="neutral"
        ))
        
    current_price += risk_adj
    
    # 4. Competitor Price Boundary
    # Keep recommended price aligned to competitor rates within reason
    if request.competitor_price is not None:
        comp_price = request.competitor_price
        max_allowed = comp_price * 1.15
        min_allowed = comp_price * 0.80
        
        comp_adj = 0.0
        if current_price > max_allowed:
            comp_adj = max_allowed - current_price
            adjustments.append(PriceFactorAdjustment(
                factor="Competitor Price Cap Alignment",
                adjustment_amount=round(comp_adj, 2),
                impact="decrease"
            ))
            current_price = max_allowed
        elif current_price < min_allowed:
            comp_adj = min_allowed - current_price
            adjustments.append(PriceFactorAdjustment(
                factor="Competitor Price Floor Alignment",
                adjustment_amount=round(comp_adj, 2),
                impact="increase"
            ))
            current_price = min_allowed

    # Floor at 20.0
    recommended_price = max(20.0, current_price)
    price_diff_pct = ((recommended_price - base_price) / base_price) * 100.0
    
    # Classify demand intensity
    if request.occupancy_rate > 0.75:
        demand = "High"
    elif request.occupancy_rate > 0.45:
        demand = "Medium"
    else:
        demand = "Low"
        
    return PriceResponse(
        recommended_price=round(recommended_price, 2),
        price_change_percentage=round(price_diff_pct, 1),
        demand_forecast=demand,
        adjustments=adjustments
    )
