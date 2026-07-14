from pydantic import BaseModel, Field

class RecommendationRequest(BaseModel):
    user_id: str = Field(None, description="Optional unique identifier of the user (enables collaborative filtering if ratings exist)", examples=["user_12345"])
    preferred_location: str = Field(None, description="Preferred city or area for hotels", examples=["Lisbon"])
    min_price: float = Field(None, ge=0.0, description="Minimum price per night", examples=[50.0])
    max_price: float = Field(None, ge=0.0, description="Maximum price per night", examples=[250.0])
    required_amenities: list[str] = Field(default_factory=list, description="List of amenities required by user", examples=[["pool", "wifi"]])
    limit: int = Field(5, ge=1, le=20, description="Maximum number of recommendations to return")

class RecommendedHotel(BaseModel):
    hotel_id: str = Field(..., description="Unique hotel identifier")
    hotel_name: str = Field(..., description="Name of the hotel")
    location: str = Field(..., description="Hotel city/location")
    price_per_night: float = Field(..., description="Cost per night in local currency")
    rating: float = Field(..., description="Overall hotel rating out of 5.0")
    amenities: list[str] = Field(..., description="Key hotel amenities available")
    match_score: float = Field(..., description="Recommender alignment score (0.0 to 1.0)", examples=[0.92])
    recommendation_type: str = Field(..., description="Method used ('collaborative', 'content-based', 'hybrid')", examples=["hybrid"])
    reason: str = Field(..., description="Reason why this hotel was recommended", examples=["Matches your location preferences and amenity filters for pool, wifi."])

class RecommendationResponse(BaseModel):
    recommendations: list[RecommendedHotel] = Field(..., description="List of personalized recommended hotels")
