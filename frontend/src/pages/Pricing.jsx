import React, { useState } from 'react';
import { TrendingUp, Calendar, AlertTriangle, Sparkles, DollarSign, Percent, Info } from 'lucide-react';
import { StayIQAPI } from '../lib/api';

export default function Pricing() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    base_price: 120,
    occupancy_rate: 0.65,
    competitor_price: 130,
    seasonality_index: 1.15,
    cancellation_risk_score: 0.25
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await StayIQAPI.predictPrice(formData);
      setResult(response);
    } catch (err) {
      setError("Failed to fetch dynamic price suggestions. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' ? value : parseFloat(value) || 0
    }));
  };

  const handleSliderChange = (name, val) => {
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  return (
    <div class="space-y-8 animate-pulse-slow">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-brand-primary" />
          Dynamic Pricing Suggestion
        </h1>
        <p class="text-gray-400 mt-1 text-sm font-medium">
          ML regression engine evaluates real-time market data to recommend optimized nightly room rates.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Input Parameters Form */}
        <form onSubmit={handleSubmit} class="glass-card p-6 rounded-2xl border border-brand-border/20 lg:col-span-2 space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-brand-border/40 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-secondary" />
            Market Variables
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Booking Date */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-primary" /> Target Booking Date
              </label>
              <input 
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            {/* Base price */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Base Room Rate ($)</label>
              <input 
                type="number" 
                name="base_price"
                min="10"
                value={formData.base_price}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            {/* Occupancy rate slider */}
            <div class="flex flex-col gap-2 md:col-span-2">
              <div class="flex justify-between text-xs font-semibold text-gray-300">
                <span>Forecasted Occupancy Rate</span>
                <span class="text-brand-secondary">{Math.round(formData.occupancy_rate * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={formData.occupancy_rate}
                onChange={(e) => handleSliderChange('occupancy_rate', parseFloat(e.target.value))}
                class="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-secondary border border-brand-border/30"
              />
            </div>

            {/* Cancellation risk slider (Mock linked from module 1) */}
            <div class="flex flex-col gap-2 md:col-span-2">
              <div class="flex justify-between text-xs font-semibold text-gray-300">
                <span>Aggregated Cancellation Risk (from Predictor)</span>
                <span class="text-brand-accent">{Math.round(formData.cancellation_risk_score * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={formData.cancellation_risk_score}
                onChange={(e) => handleSliderChange('cancellation_risk_score', parseFloat(e.target.value))}
                class="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-accent border border-brand-border/30"
              />
            </div>

            {/* Competitor rate */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Competitor Room Rate ($)</label>
              <input 
                type="number" 
                name="competitor_price"
                min="0"
                value={formData.competitor_price}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            {/* Seasonality index select */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Seasonality Index</label>
              <select 
                name="seasonality_index"
                value={formData.seasonality_index}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              >
                <option value="0.75">Low Season (0.75x)</option>
                <option value="1.0">Standard Season (1.00x)</option>
                <option value="1.15">Shoulder Season (1.15x)</option>
                <option value="1.30">Peak Summer (1.30x)</option>
                <option value="1.45">Festive Holidays (1.45x)</option>
              </select>
            </div>

          </div>

          <button 
            type="submit" 
            disabled={loading}
            class="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-glow-primary transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Evaluating Price Regression...' : 'Run Pricing Optimization'}
          </button>
        </form>

        {/* Results output panel */}
        <div class="glass-card p-6 rounded-2xl border border-brand-border/20 space-y-6">
          <h2 class="text-lg font-bold text-white">Pricing Output</h2>

          {loading && (
            <div class="flex flex-col items-center justify-center py-20 gap-3">
              <div class="w-12 h-12 border-4 border-t-brand-secondary border-brand-primary/20 rounded-full animate-spin"></div>
              <p class="text-xs text-gray-400 font-medium">Running price elasticity gradient boosting model...</p>
            </div>
          )}

          {!loading && !result && !error && (
            <div class="flex flex-col items-center text-center justify-center py-20 px-4 text-slate-500 gap-3">
              <TrendingUp className="w-12 h-12 opacity-40 text-brand-primary" />
              <div>
                <p class="text-sm font-semibold text-slate-400">Ready for Calculations</p>
                <p class="text-xs text-slate-500 mt-1">Submit date and occupancy targets to run dynamic rate recommendations.</p>
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
              
              {/* Dynamic Suggested Pricing Display */}
              <div class="text-center bg-slate-900/60 p-5 rounded-2xl border border-brand-border/30 relative overflow-hidden">
                <span class="text-xs text-slate-400 uppercase tracking-widest text-[9px] block">Recommended Nightly Rate</span>
                <span class="text-5xl font-extrabold text-white mt-2 block bg-gradient-to-r from-brand-secondary to-brand-primary bg-clip-text text-transparent">
                  ${result.recommended_price.toFixed(2)}
                </span>
                
                <div class="flex justify-center items-center gap-3 mt-4">
                  <span class={`text-xs font-bold px-2 py-0.5 rounded flex items-center ${
                    result.price_change_percentage >= 0
                      ? 'text-brand-success bg-brand-success/15'
                      : 'text-brand-danger bg-brand-danger/15'
                  }`}>
                    {result.price_change_percentage >= 0 ? '+' : ''}{result.price_change_percentage}% Base rate
                  </span>
                  
                  <span class="text-xs text-slate-300 font-semibold bg-slate-800 px-2 py-0.5 rounded">
                    Demand: {result.demand_forecast}
                  </span>
                </div>
              </div>

              {/* Adjustments table */}
              <div class="space-y-4 pt-4 border-t border-brand-border/40">
                <div>
                  <h3 class="text-sm font-bold text-slate-200">Adjustments Ledger</h3>
                  <p class="text-[10px] text-slate-400">ML features contributing to recommended pricing deviations</p>
                </div>

                <div class="space-y-2.5">
                  {result.adjustments.map((adj, idx) => (
                    <div key={idx} class="text-xs bg-slate-900/40 p-3 rounded-xl border border-brand-border/20 flex justify-between items-center">
                      <div class="flex flex-col">
                        <span class="font-bold text-slate-300">{adj.factor}</span>
                        <span class="text-[9px] text-slate-500 uppercase tracking-wider">Elasticity Attribution</span>
                      </div>
                      
                      <span class={`font-bold font-mono text-sm ${
                        adj.impact === 'increase'
                          ? 'text-brand-success'
                          : adj.impact === 'decrease'
                          ? 'text-brand-danger'
                          : 'text-slate-400'
                      }`}>
                        {adj.impact === 'increase' ? '+$' : adj.impact === 'decrease' ? '-$' : '$'}{Math.abs(adj.adjustment_amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions recommendation */}
              <div class="bg-brand-darkest/50 p-4 rounded-xl border border-brand-border/40 text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                <Info className="w-4.5 h-4.5 text-brand-secondary shrink-0 mt-0.5" />
                <div>
                  <span class="font-bold text-slate-200">Optimization Note:</span>
                  {result.recommended_price > formData.base_price ? (
                    <span> Suggested price represents an optimization window based on strong occupancy indicators. Maintain standard booking terms.</span>
                  ) : (
                    <span> Occupancy or cancellation risks suggest offering rates at a discount. Enforce a Non-Refundable deposit policy to protect inventory revenue.</span>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
