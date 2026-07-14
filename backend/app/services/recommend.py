from app.schemas.recommend import RecommendationRequest, RecommendationResponse, RecommendedHotel

# Mock list of database hotels
MOCK_HOTELS = [
    {
        "hotel_id": "hot_001",
        "hotel_name": "Hotel Altis Prime",
        "location": "Lisbon",
        "price_per_night": 120.00,
        "rating": 4.6,
        "amenities": ["pool", "wifi", "parking", "spa", "gym"],
        "collaborative_score": 0.88
    },
    {
        "hotel_id": "hot_002",
        "hotel_name": "Lisbon Plaza Hotel",
        "location": "Lisbon",
        "price_per_night": 95.00,
        "rating": 4.4,
        "amenities": ["wifi", "parking", "breakfast", "bar"],
        "collaborative_score": 0.72
    },
    {
        "hotel_id": "hot_003",
        "hotel_name": "The Yeatman Palace",
        "location": "Porto",
        "price_per_night": 250.00,
        "rating": 4.9,
        "amenities": ["pool", "wifi", "parking", "spa", "gym", "restaurant", "view"],
        "collaborative_score": 0.95
    },
    {
        "hotel_id": "hot_004",
        "hotel_name": "Porto Bay Flores",
        "location": "Porto",
        "price_per_night": 180.00,
        "rating": 4.7,
        "amenities": ["wifi", "spa", "restaurant", "breakfast", "gym"],
        "collaborative_score": 0.85
    },
    {
        "hotel_id": "hot_005",
        "hotel_name": "Algarve Luxury Beach Resort",
        "location": "Albufeira",
        "price_per_night": 160.00,
        "rating": 4.5,
        "amenities": ["pool", "wifi", "beach", "parking", "restaurant"],
        "collaborative_score": 0.79
    },
    {
        "hotel_id": "hot_006",
        "hotel_name": "Tivoli Carvoeiro Hotel",
        "location": "Carvoeiro",
        "price_per_night": 220.00,
        "rating": 4.8,
        "amenities": ["pool", "wifi", "beach", "spa", "bar", "restaurant"],
        "collaborative_score": 0.91
    },
    {
        "hotel_id": "hot_007",
        "hotel_name": "Hotel Dom Luis Historic",
        "location": "Coimbra",
        "price_per_night": 75.00,
        "rating": 4.1,
        "amenities": ["wifi", "parking", "breakfast"],
        "collaborative_score": 0.65
    },
    {
        "hotel_id": "hot_008",
        "hotel_name": "Sana Silver Coast",
        "location": "Caldas da Rainha",
        "price_per_night": 110.00,
        "rating": 4.3,
        "amenities": ["wifi", "parking", "breakfast", "bar"],
        "collaborative_score": 0.70
    }
]

def recommend_hotels(request: RecommendationRequest) -> RecommendationResponse:
    filtered_hotels = []
    
    for h in MOCK_HOTELS:
        # Filter by Location
        if request.preferred_location:
            if request.preferred_location.lower() not in h["location"].lower():
                continue
                
        # Filter by Price Range
        if request.min_price is not None and h["price_per_night"] < request.min_price:
            continue
        if request.max_price is not None and h["price_per_night"] > request.max_price:
            continue
            
        # Filter by Amenities (must match all requested amenities)
        if request.required_amenities:
            missing_amenity = False
            for req_am in request.required_amenities:
                if req_am.lower() not in [a.lower() for a in h["amenities"]]:
                    missing_amenity = True
                    break
            if missing_amenity:
                continue
                
        # If we passed all filters, compute a match score
        # Content match: based on requested criteria alignment (defaults to 1.0)
        content_score = 1.0
        
        # Rating boost
        rating_factor = (h["rating"] - 3.0) / 2.0  # Normalize 3-5 rating to 0-1
        
        # Hybrid combination: 40% Collaborative (matrix factorization), 40% Rating, 20% Content alignment
        match_score = (0.4 * h["collaborative_score"]) + (0.4 * rating_factor) + (0.2 * content_score)
        match_score = max(0.1, min(0.99, match_score))
        
        # Create recommendation object
        reco_type = "hybrid"
        if request.user_id and not request.required_amenities and not request.preferred_location:
            reco_type = "collaborative"
        elif not request.user_id:
            reco_type = "content-based"
            
        reason_phrases = []
        if request.preferred_location:
            reason_phrases.append(f"located in {h['location']}")
        if request.required_amenities:
            reason_phrases.append("offers requested amenities")
        if h["rating"] >= 4.5:
            reason_phrases.append("exceptional guest rating")
            
        reason = "Recommended because it "
        if reason_phrases:
            reason += ", ".join(reason_phrases) + "."
        else:
            reason += "matches your traveler profile and price range."
            
        filtered_hotels.append(RecommendedHotel(
            hotel_id=h["hotel_id"],
            hotel_name=h["hotel_name"],
            location=h["location"],
            price_per_night=h["price_per_night"],
            rating=h["rating"],
            amenities=h["amenities"],
            match_score=round(match_score, 2),
            recommendation_type=reco_type,
            reason=reason
        ))
        
    # Sort recommendations by match score descending
    filtered_hotels.sort(key=lambda x: x.match_score, reverse=True)
    
    # Apply limit
    limit = request.limit if request.limit else 5
    recommendations = filtered_hotels[:limit]
    
    return RecommendationResponse(recommendations=recommendations)
