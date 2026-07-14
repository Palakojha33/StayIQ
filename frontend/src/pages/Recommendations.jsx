import React, { useState } from 'react';
import { Hotel, User, MapPin, DollarSign, Sparkles, Star, Tag } from 'lucide-react';
import { StayIQAPI } from '../lib/api';

const AMENITY_OPTIONS = [
  { id: 'wifi', name: 'Free Wi-Fi' },
  { id: 'pool', name: 'Swimming Pool' },
  { id: 'spa', name: 'Wellness Spa' },
  { id: 'parking', name: 'Free Parking' },
  { id: 'gym', name: 'Fitness Gym' },
  { id: 'breakfast', name: 'Breakfast Included' },
  { id: 'restaurant', name: 'Restaurant' }
];

export default function Recommendations() {
  const [userId, setUserId] = useState('user_12345');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAmenityChange = (id) => {
    setAmenities(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      user_id: userId || null,
      preferred_location: location || null,
      min_price: priceRange.min || null,
      max_price: priceRange.max || null,
      required_amenities: amenities,
      limit: 5
    };

    try {
      const response = await StayIQAPI.getRecommendations(payload);
      setResult(response);
    } catch (err) {
      setError("Failed to fetch hotel recommendations. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="space-y-8 animate-pulse-slow">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Hotel className="w-8 h-8 text-brand-primary" />
          Personalized Recommendation Engine
        </h1>
        <p class="text-gray-400 mt-1 text-sm font-medium">
          Hybrid Collaborative & Content Filtering recommender engine suggests ideal hotel matches.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Filters Panel */}
        <form onSubmit={handleRecommend} class="glass-card p-6 rounded-2xl border border-brand-border/20 space-y-5">
          <h2 class="text-lg font-bold text-white border-b border-brand-border/40 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-secondary" />
            Traveler Preferences
          </h2>

          {/* User ID */}
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-primary" /> User Profile ID
            </label>
            <input 
              type="text" 
              placeholder="e.g. user_12345"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              class="glass-input p-2.5 rounded-xl text-sm text-white"
            />
          </div>

          {/* Location */}
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-secondary" /> Preferred Location
            </label>
            <select 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              class="glass-input p-2.5 rounded-xl text-sm text-white"
            >
              <option value="">Any Location (Portugal)</option>
              <option value="Lisbon">Lisbon</option>
              <option value="Porto">Porto</option>
              <option value="Albufeira">Albufeira</option>
              <option value="Carvoeiro">Carvoeiro</option>
              <option value="Coimbra">Coimbra</option>
            </select>
          </div>

          {/* Price Range */}
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-brand-success" /> Max Budget Per Night
            </label>
            <div class="flex justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>$0</span>
              <span class="text-brand-success">${priceRange.max} max</span>
            </div>
            <input 
              type="range"
              min="50"
              max="300"
              step="10"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
              class="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-success border border-brand-border/30"
            />
          </div>

          {/* Amenities */}
          <div class="flex flex-col gap-2.5">
            <label class="text-xs font-semibold text-gray-300">Required Amenities</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {AMENITY_OPTIONS.map(opt => (
                <label key={opt.id} class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox"
                    checked={amenities.includes(opt.id)}
                    onChange={() => handleAmenityChange(opt.id)}
                    class="rounded bg-brand-darkest border-brand-border/60 text-brand-primary focus:ring-brand-primary w-4 h-4"
                  />
                  {opt.name}
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            class="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-glow-primary transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Consulting Recommender Matrix...' : 'Run Personalized Query'}
          </button>
        </form>

        {/* Results Panel */}
        <div class="lg:col-span-2 space-y-6">
          
          {loading && (
            <div class="glass-card p-12 rounded-2xl border border-brand-border/20 flex flex-col items-center justify-center gap-3 py-36">
              <div class="w-12 h-12 border-4 border-t-brand-secondary border-brand-primary/20 rounded-full animate-spin"></div>
              <p class="text-xs text-gray-400 font-medium">Reconstructing sparse rating matrix...</p>
            </div>
          )}

          {!loading && !result && !error && (
            <div class="glass-card p-12 rounded-2xl border border-brand-border/20 flex flex-col items-center text-center justify-center py-36 text-slate-500 gap-3">
              <Hotel className="w-12 h-12 opacity-40 text-brand-primary" />
              <div>
                <p class="text-sm font-semibold text-slate-400">Query Recommendations</p>
                <p class="text-xs text-slate-500 mt-1">Submit travel preferences to trigger the matrix factorization recommendations.</p>
              </div>
            </div>
          )}

          {error && (
            <div class="bg-brand-danger/10 border border-brand-danger/30 p-4 rounded-xl text-xs text-brand-danger">
              {error}
            </div>
          )}

          {result && (
            <div class="space-y-6">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-4.5 h-4.5 text-brand-secondary" />
                Matching Hotels ({result.recommendations.length} items)
              </h2>

              {result.recommendations.length === 0 ? (
                <div class="glass-card p-8 rounded-2xl border border-brand-border/20 text-center text-xs text-slate-500">
                  No hotels matched the filter constraints. Try widening your budget or reducing amenity requirements.
                </div>
              ) : (
                <div class="space-y-4">
                  {result.recommendations.map((hotel) => (
                    <div 
                      key={hotel.hotel_id}
                      class="glass-card p-5 rounded-2xl border border-brand-border/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 hover:scale-[1.01] hover:border-brand-primary/40"
                    >
                      <div class="space-y-2 max-w-lg">
                        <div class="flex items-center gap-2">
                          <h3 class="text-base font-bold text-white">{hotel.hotel_name}</h3>
                          <span class={`text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded tracking-wider ${
                            hotel.recommendation_type === 'collaborative'
                              ? 'text-brand-accent bg-brand-accent/15 border border-brand-accent/30'
                              : 'text-brand-secondary bg-brand-secondary/15 border border-brand-secondary/30'
                          }`}>
                            {hotel.recommendation_type}
                          </span>
                        </div>

                        <div class="flex items-center gap-4 text-xs text-slate-400">
                          <span class="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-secondary" /> {hotel.location}
                          </span>
                          <span class="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-brand-warning text-brand-warning" /> {hotel.rating.toFixed(1)}
                          </span>
                        </div>

                        {/* Reason */}
                        <p class="text-[11px] text-slate-400 leading-relaxed font-medium bg-brand-darkest/40 p-2.5 rounded-lg border border-brand-border/10">
                          <span class="font-bold text-slate-300">Match Reason:</span> {hotel.reason}
                        </p>

                        {/* Amenities */}
                        <div class="flex flex-wrap gap-1">
                          {hotel.amenities.map((am, amIdx) => (
                            <span key={amIdx} class="text-[9px] font-semibold text-slate-500 bg-slate-900 border border-brand-border/30 px-2 py-0.5 rounded">
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price and Match Score indicators */}
                      <div class="flex md:flex-col justify-between w-full md:w-auto items-center md:items-end border-t md:border-t-0 border-brand-border/20 pt-3 md:pt-0 shrink-0">
                        <div class="text-right">
                          <span class="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Price per night</span>
                          <p class="text-lg font-extrabold text-white mt-0.5">${hotel.price_per_night.toFixed(0)}</p>
                        </div>
                        <div class="mt-0.5 md:mt-2 text-right">
                          <span class="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Match Confidence</span>
                          <span class="inline-block text-xs font-bold text-brand-success bg-brand-success/10 border border-brand-success/35 px-2 py-0.5 rounded-full mt-1">
                            {Math.round(hotel.match_score * 100)}% Match
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
