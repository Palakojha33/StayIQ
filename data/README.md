# StayIQ Dataset Requirements

This directory is intended to hold the raw and processed datasets used to train the machine learning models for the StayIQ platform. 
*Note: Large datasets and CSV files are excluded from Git repository tracking via `.gitignore`.*

---

## 1. Booking Cancellation Prediction
- **Source**: Kaggle "Hotel Booking Demand" dataset
- **Expected Filename**: `hotel_bookings.csv`
- **Key Columns**:
  - `hotel`: Hotel type (`Resort Hotel` or `City Hotel`)
  - `is_canceled`: Target label (`0` = Active booking, `1` = Canceled)
  - `lead_time`: Number of days between booking and arrival
  - `arrival_date_year`, `arrival_date_month`, `arrival_date_week_number`, `arrival_date_day_of_month`
  - `stays_in_weekend_nights`, `stays_in_week_nights`: Number of stay nights
  - `adults`, `children`, `babies`: Guest counts
  - `meal`: Meal plan booked (`BB`, `HB`, `FB`, `SC`, `Undefined`)
  - `country`: Guest origin country code (e.g. `PRT`, `GBR`)
  - `market_segment`: Customer sourcing channel (e.g. `Online TA`, `Offline TA/TO`, `Direct`)
  - `distribution_channel`: Booking distribution channel (e.g. `TA/TO`, `Direct`)
  - `is_repeated_guest`: `0` or `1`
  - `previous_cancellations`: Count of previous booking cancellations by this guest
  - `previous_bookings_not_canceled`: Count of previous completed bookings by this guest
  - `reserved_room_type`, `assigned_room_type`: Room type codes (e.g. `A`, `D`)
  - `booking_changes`: Number of changes made to the booking
  - `deposit_type`: Deposit flag (`No Deposit`, `Non Refund`, `Refundable`)
  - `days_in_waiting_list`: Days booking was held in queue
  - `customer_type`: Category of booking guest (`Transient`, `Contract`, `Group`, etc.)
  - `adr`: Average Daily Rate (average room price per night)
  - `required_car_parking_spaces`: Count of requested car parking spaces
  - `total_of_special_requests`: Count of guest special requests

---

## 2. Review Sentiment & Aspect Analysis
- **Source**: Kaggle hotel reviews or TripAdvisor hotel reviews dataset
- **Expected Filename**: `hotel_reviews.csv`
- **Key Columns**:
  - `review_text`: The text feedback left by the customer.
  - `rating`: Star rating out of 5 (used to derive baseline sentiment for training).
  - *Aspect annotation targets (for aspect classification)*: `cleanliness`, `staff`, `food`, `location`, `value` (scored positive/negative/neutral).

---

## 3. Personalized Recommendation Engine
- **Source**: Simulated or open-source customer reservation/rating matrices
- **Expected Filenames**:
  - `hotels_metadata.csv`: Detailed hotel listings (ID, Name, Location, Price Tier, Amenities list, overall rating).
  - `user_ratings.csv`: User reviews and interaction history (User ID, Hotel ID, Rating score 1-5).

---

## 4. Dynamic Pricing Suggestion
- **Source**: Hotel historical sales and occupancy logs
- **Expected Filename**: `historical_pricing.csv`
- **Key Columns**:
  - `date`: YYYY-MM-DD format
  - `occupancy_rate`: Historic or forecast occupancy percentage (0.0 to 1.0)
  - `competitor_price`: Average competitor rate for that date range
  - `seasonality_index`: Multiplicative factor for peak seasons
  - `cancellation_risk_score`: Aggregated cancellation risk from Module 1
  - `target_price`: The ideal daily rate (dependent variable)
