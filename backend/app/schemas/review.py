from pydantic import BaseModel, Field

class ReviewRequest(BaseModel):
    review_text: str = Field(..., description="The raw hotel review text to analyze", examples=["The room was extremely clean and the staff was friendly, but the breakfast food was cold."])

class AspectSentiment(BaseModel):
    aspect: str = Field(..., description="Extracted aspect (cleanliness, staff, food, location, value)", examples=["cleanliness"])
    sentiment: str = Field(..., description="Sentiment towards this aspect ('positive', 'negative', 'neutral')", examples=["positive"])
    confidence: float = Field(..., description="Sentiment classification confidence score (0 to 1)", examples=[0.95])
    snippets: list[str] = Field(..., description="Text segments or keywords matching this aspect", examples=[["room was extremely clean"]])

class ReviewResponse(BaseModel):
    sentiment: str = Field(..., description="Overall review sentiment ('positive', 'negative', 'neutral')", examples=["positive"])
    sentiment_score: float = Field(..., description="Numeric sentiment score. Positive values indicate positive sentiment, negative values indicate negative sentiment (e.g. from -1 to 1 or confidence 0 to 1)", examples=[0.85])
    aspects: list[AspectSentiment] = Field(..., description="Sentiment analysis broken down by extracted aspects")
