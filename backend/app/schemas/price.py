from pydantic import BaseModel, Field

class PriceRequest(BaseModel):
    date: str = Field(..., description="Target date for pricing (YYYY-MM-DD)", examples=["2026-07-20"])
    base_price: float = Field(..., ge=0.0, description="Base room price before adjustments", examples=[120.0])
    occupancy_rate: float = Field(..., ge=0.0, le=1.0, description="Forecasted or current occupancy rate (0.0 to 1.0)", examples=[0.82])
    competitor_price: float = Field(None, ge=0.0, description="Average room rate of key competitors", examples=[135.0])
    seasonality_index: float = Field(None, ge=0.0, description="Seasonality multiplier (1.0 = average, >1.0 = peak, <1.0 = off-peak)", examples=[1.15])
    cancellation_risk_score: float = Field(..., ge=0.0, le=1.0, description="Estimated cancellation risk from prediction model (0.0 to 1.0)", examples=[0.35])

class PriceFactorAdjustment(BaseModel):
    factor: str = Field(..., description="Driving pricing factor (e.g. occupancy, seasonality, cancellation_risk)", examples=["occupancy"])
    adjustment_amount: float = Field(..., description="Monetary rate adjustment (+/-)", examples=[15.5])
    impact: str = Field(..., description="Directional impact of factor ('increase', 'decrease', 'neutral')", examples=["increase"])

class PriceResponse(BaseModel):
    recommended_price: float = Field(..., description="Final optimized suggested price per night", examples=[138.5])
    price_change_percentage: float = Field(..., description="Percentage difference from base price", examples=[15.4])
    demand_forecast: str = Field(..., description="Forecasted demand intensity ('Low', 'Medium', 'High')", examples=["High"])
    adjustments: list[PriceFactorAdjustment] = Field(..., description="Breakdown of price adjustments per factor")
