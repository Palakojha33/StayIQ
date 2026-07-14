import os
from app.schemas.review import ReviewRequest, ReviewResponse, AspectSentiment

# Global transformer pipeline cache
_nlp_pipeline = None

# Keywords lists for aspect extraction
ASPECT_KEYWORDS = {
    "cleanliness": ["clean", "dirty", "dusty", "neat", "spotless", "washroom", "bathroom", "shower", "towel", "sheets", "smell", "hygiene", "tidy", "messy"],
    "staff": ["staff", "reception", "manager", "host", "service", "friendly", "helpful", "rude", "welcoming", "cheer", "polite", "assistance", "employee", "desk"],
    "food": ["food", "breakfast", "dinner", "restaurant", "buffet", "coffee", "meal", "delicious", "tasty", "menu", "chef", "bar", "dining", "eat"],
    "location": ["location", "close", "near", "distance", "walk", "subway", "metro", "view", "center", "noisy", "area", "neighborhood", "beach", "traffic"],
    "value": ["price", "value", "expensive", "cheap", "cost", "worth", "money", "affordable", "deal", "overpriced", "fee", "charge", "rate", "bill"]
}

# Positive / negative sentiment keywords for lightweight rule-based fallback
POS_WORDS = {"good", "great", "excellent", "friendly", "clean", "nice", "love", "perfect", "delicious", "amazing", "wonderful", "helpful", "spotless", "convenient", "reasonable"}
NEG_WORDS = {"bad", "poor", "dirty", "rude", "cold", "expensive", "slow", "loud", "noisy", "disappointed", "worst", "uncomfortable", "overpriced", "hate", "terrible"}

def get_nlp_pipeline():
    global _nlp_pipeline
    if _nlp_pipeline is None:
        # Avoid loading heavy transformers if we are on Vercel or STANDALONE_MODE is not active
        is_vercel = os.getenv("VERCEL") == "1"
        standalone_mode = os.getenv("STANDALONE_MODE", "0") == "1"
        
        if is_vercel or not standalone_mode:
            print("Running in serverless/mock mode: DistilBERT loading bypassed.")
            return None
        
        try:
            from transformers import pipeline
            print("STANDALONE_MODE active: Loading DistilBERT sentiment analysis pipeline...")
            # DistilBERT fine-tuned on SST-2 for binary classification
            _nlp_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
        except Exception as e:
            print(f"Failed to load transformers pipeline: {e}. Falling back to rule-based analysis.")
            _nlp_pipeline = None
            
    return _nlp_pipeline

def analyze_review_sentiment(request: ReviewRequest) -> ReviewResponse:
    text = request.review_text.lower()
    pipeline = get_nlp_pipeline()
    
    overall_sentiment = "neutral"
    overall_score = 0.5
    
    if pipeline is not None:
        try:
            # DistilBERT classification
            result = pipeline(request.review_text)[0]
            label = result['label'] # 'POSITIVE' or 'NEGATIVE'
            score = result['score']
            
            overall_sentiment = "positive" if label == "POSITIVE" else "negative"
            overall_score = score if label == "POSITIVE" else (1 - score)
        except Exception as e:
            print(f"Transformers pipeline execution failed: {e}")
            pipeline = None # Force fallback on next runs
            
    # Fallback/Lightweight Rule-Based Analyzer (used on Vercel or if transformers loading failed)
    if pipeline is None:
        # Simple word matching sentiment
        words = text.split()
        pos_count = sum(1 for w in words if w in POS_WORDS)
        neg_count = sum(1 for w in words if w in NEG_WORDS)
        
        total_hits = pos_count + neg_count
        if total_hits > 0:
            diff = pos_count - neg_count
            overall_score = 0.5 + (diff / (2 * total_hits)) # Normalize between 0 and 1
            if diff > 0:
                overall_sentiment = "positive"
            elif diff < 0:
                overall_sentiment = "negative"
            else:
                overall_sentiment = "neutral"
        else:
            overall_score = 0.5
            overall_sentiment = "neutral"
            
    # Aspect-based sentiment extraction
    # We split review into sentences to do finer-grained aspect association
    import re
    sentences = re.split(r'[.!?]+', text)
    aspect_findings = []
    
    for aspect, keywords in ASPECT_KEYWORDS.items():
        matching_sentences = []
        aspect_pos = 0
        aspect_neg = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Check if any keyword matches this sentence
            found_keywords = [kw for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', sentence)]
            if found_keywords:
                matching_sentences.append(sentence)
                # Count sentence local sentiment
                words_in_sent = sentence.split()
                aspect_pos += sum(1 for w in words_in_sent if w in POS_WORDS)
                aspect_neg += sum(1 for w in words_in_sent if w in NEG_WORDS)
                
        if matching_sentences:
            # Deduce sentiment for this aspect
            total_aspect_hits = aspect_pos + aspect_neg
            if total_aspect_hits > 0:
                aspect_diff = aspect_pos - aspect_neg
                aspect_conf = 0.5 + (abs(aspect_diff) / (2 * total_aspect_hits))
                if aspect_diff > 0:
                    aspect_sent = "positive"
                elif aspect_diff < 0:
                    aspect_sent = "negative"
                else:
                    aspect_sent = "neutral"
            else:
                # Default to overall review sentiment if aspect text is neutral
                aspect_sent = overall_sentiment
                aspect_conf = 0.70
                
            aspect_findings.append(AspectSentiment(
                aspect=aspect,
                sentiment=aspect_sent,
                confidence=round(aspect_conf, 2),
                snippets=matching_sentences[:2] # Return at most 2 matching lines
            ))
            
    # Default aspects if none found to show UI richness
    if not aspect_findings:
        # Inject staff/location default based on review content or overall sentiment
        aspect_findings.append(AspectSentiment(
            aspect="general",
            sentiment=overall_sentiment,
            confidence=round(overall_score, 2),
            snippets=[request.review_text[:100] + "..."]
        ))
        
    return ReviewResponse(
        sentiment=overall_sentiment,
        sentiment_score=round(overall_score, 2),
        aspects=aspect_findings
    )
