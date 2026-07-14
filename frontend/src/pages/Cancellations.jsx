import React, { useState } from 'react';
import { CalendarX, AlertTriangle, CheckCircle, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { StayIQAPI } from '../lib/api';

export default function Cancellations() {
  const [formData, setFormData] = useState({
    hotel_type: 'City Hotel',
    lead_time: 45,
    arrival_date_year: 2026,
    arrival_date_month: 'July',
    arrival_date_week_number: 27,
    arrival_date_day_of_month: 15,
    stays_in_weekend_nights: 1,
    stays_in_week_nights: 3,
    adults: 2,
    children: 0,
    babies: 0,
    meal: 'BB',
    country: 'PRT',
    market_segment: 'Online TA',
    distribution_channel: 'TA/TO',
    is_repeated_guest: 0,
    previous_cancellations: 0,
    previous_bookings_not_canceled: 0,
    reserved_room_type: 'A',
    assigned_room_type: 'A',
    booking_changes: 0,
    deposit_type: 'No Deposit',
    agent: '9',
    company: 'NULL',
    days_in_waiting_list: 0,
    customer_type: 'Transient',
    adr: 110.0,
    required_car_parking_spaces: 0,
    total_of_special_requests: 1,
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
      const response = await StayIQAPI.predictCancellation(formData);
      setResult(response);
    } catch (err) {
      setError("Failed to calculate cancellation probability. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div class="space-y-8 animate-pulse-slow">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <CalendarX className="w-8 h-8 text-brand-primary" />
          Booking Cancellation Prediction
        </h1>
        <p class="text-gray-400 mt-1 text-sm font-medium">
          Input guest details to compute cancellation probability and evaluate risk profiles.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Input Form Panel */}
        <form onSubmit={handleSubmit} class="glass-card p-6 rounded-2xl border border-brand-border/20 lg:col-span-2 space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-brand-border/40 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-secondary" />
            Booking Parameters
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Hotel Type */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Hotel Type</label>
              <select 
                name="hotel_type" 
                value={formData.hotel_type}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              >
                <option value="City Hotel">City Hotel</option>
                <option value="Resort Hotel">Resort Hotel</option>
              </select>
            </div>

            {/* Deposit Type */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Deposit Type</label>
              <select 
                name="deposit_type" 
                value={formData.deposit_type}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              >
                <option value="No Deposit">No Deposit</option>
                <option value="Non Refund">Non Refundable</option>
                <option value="Refundable">Refundable</option>
              </select>
            </div>

            {/* Lead Time Slider */}
            <div class="flex flex-col gap-2 md:col-span-2">
              <div class="flex justify-between text-xs font-semibold text-gray-300">
                <span>Lead Time (Days)</span>
                <span class="text-brand-secondary">{formData.lead_time} days</span>
              </div>
              <input 
                type="range" 
                name="lead_time" 
                min="0" 
                max="365"
                value={formData.lead_time}
                onChange={handleChange}
                class="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-secondary border border-brand-border/30"
              />
            </div>

            {/* ADR */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Average Daily Rate (ADR, $)</label>
              <input 
                type="number" 
                name="adr" 
                min="0"
                step="0.1"
                value={formData.adr}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            {/* Market Segment */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Market Segment</label>
              <select 
                name="market_segment" 
                value={formData.market_segment}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              >
                <option value="Online TA">Online Travel Agent (TA)</option>
                <option value="Offline TA/TO">Offline TA / Tour Operator</option>
                <option value="Direct">Direct Booking</option>
                <option value="Corporate">Corporate</option>
                <option value="Groups">Groups</option>
              </select>
            </div>

            {/* Stays Nights */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Week Nights Count</label>
              <input 
                type="number" 
                name="stays_in_week_nights" 
                min="0"
                value={formData.stays_in_week_nights}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Weekend Nights Count</label>
              <input 
                type="number" 
                name="stays_in_weekend_nights" 
                min="0"
                value={formData.stays_in_weekend_nights}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            {/* Prior History */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Previous Cancellations</label>
              <input 
                type="number" 
                name="previous_cancellations" 
                min="0"
                value={formData.previous_cancellations}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            {/* Special Requests */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Special Requests Count</label>
              <input 
                type="number" 
                name="total_of_special_requests" 
                min="0"
                value={formData.total_of_special_requests}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            {/* Parking space */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Required Parking Spaces</label>
              <input 
                type="number" 
                name="required_car_parking_spaces" 
                min="0"
                max="5"
                value={formData.required_car_parking_spaces}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              />
            </div>

            {/* Repeated Guest */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-300">Repeated Guest</label>
              <select 
                name="is_repeated_guest" 
                value={formData.is_repeated_guest}
                onChange={handleChange}
                class="glass-input p-2.5 rounded-xl text-sm text-white"
              >
                <option value="0">No (New Customer)</option>
                <option value="1">Yes (Return Customer)</option>
              </select>
            </div>

          </div>

          <button 
            type="submit" 
            disabled={loading}
            class="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-glow-primary transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Evaluating Risk Profile...' : 'Run Risk Prediction'}
          </button>
        </form>

        {/* Prediction Results Panel */}
        <div class="glass-card p-6 rounded-2xl border border-brand-border/20 space-y-6">
          <h2 class="text-lg font-bold text-white">Risk Evaluation Output</h2>
          
          {loading && (
            <div class="flex flex-col items-center justify-center py-20 gap-3">
              <div class="w-12 h-12 border-4 border-t-brand-secondary border-brand-primary/20 rounded-full animate-spin"></div>
              <p class="text-xs text-gray-400 font-medium">Feeding inputs to XGBoost model...</p>
            </div>
          )}

          {!loading && !result && !error && (
            <div class="flex flex-col items-center text-center justify-center py-20 px-4 text-slate-500 gap-3">
              <Info className="w-12 h-12 opacity-40 text-brand-primary" />
              <div>
                <p class="text-sm font-semibold text-slate-400">Waiting for Inputs</p>
                <p class="text-xs text-slate-500 mt-1">Configure booking details on the left and submit to view cancellation probabilities.</p>
              </div>
            </div>
          )}

          {error && (
            <div class="bg-brand-danger/10 border border-brand-danger/30 p-4 rounded-xl text-xs text-brand-danger flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {result && (
            <div class="space-y-6">
              
              {/* Circular Gauge Representation */}
              <div class="flex flex-col items-center justify-center p-4">
                <div class="relative w-40 h-40 flex items-center justify-center">
                  
                  {/* Glowing Ring */}
                  <div class="absolute inset-0 rounded-full border-[10px] border-brand-darkest shadow-inner"></div>
                  
                  {/* Gauge Colored ring */}
                  <svg class="absolute inset-0 transform -rotate-90 w-full h-full">
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      stroke={
                        result.cancellation_risk_level === 'High' 
                          ? '#ef4444' 
                          : result.cancellation_risk_level === 'Medium' 
                          ? '#f59e0b' 
                          : '#10b981'
                      }
                      strokeWidth="10" 
                      fill="transparent" 
                      strokeDasharray="440"
                      strokeDashoffset={440 - (440 * result.is_canceled_probability)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  <div class="text-center z-10">
                    <span class="text-4xl font-extrabold text-white">
                      {Math.round(result.is_canceled_probability * 100)}%
                    </span>
                    <p class="text-[9px] uppercase tracking-widest font-semibold text-slate-400 mt-0.5">Cancel Probability</p>
                  </div>
                </div>

                <div class="mt-4 flex items-center gap-2">
                  {result.cancellation_risk_level === 'High' ? (
                    <span class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-danger/25 text-brand-danger border border-brand-danger/40 animate-pulse">
                      <ShieldAlert className="w-4 h-4" /> High Risk
                    </span>
                  ) : result.cancellation_risk_level === 'Medium' ? (
                    <span class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-warning/20 text-brand-warning border border-brand-warning/40">
                      <AlertTriangle className="w-4 h-4" /> Medium Risk
                    </span>
                  ) : (
                    <span class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-success/20 text-brand-success border border-brand-success/40">
                      <CheckCircle className="w-4 h-4" /> Low Risk
                    </span>
                  )}
                </div>
              </div>

              {/* Attribution / Risk Factors breakdown */}
              <div class="space-y-4 pt-4 border-t border-brand-border/40">
                <div>
                  <h3 class="text-sm font-bold text-slate-200">ML Attribution Factors</h3>
                  <p class="text-[10px] text-slate-400">Features driving cancellation risk calculations</p>
                </div>

                <div class="space-y-2.5">
                  {result.key_risk_factors.map((factor, idx) => (
                    <div key={idx} class="text-xs bg-slate-900/60 p-3 rounded-xl border border-brand-border/20 flex justify-between items-center">
                      <div class="flex flex-col">
                        <span class="font-bold text-slate-300 capitalize">{factor.feature.replace(/_/g, ' ')}</span>
                        <span class="text-[9px] text-slate-500 uppercase tracking-wider">
                          {factor.impact === 'positive' ? 'Increases Risk' : factor.impact === 'negative' ? 'Mitigates Risk' : 'Neutral'}
                        </span>
                      </div>
                      <span class={`font-bold font-mono text-[11px] ${
                        factor.impact === 'positive' 
                          ? 'text-brand-danger' 
                          : factor.impact === 'negative' 
                          ? 'text-brand-success' 
                          : 'text-gray-400'
                      }`}>
                        {factor.score > 0 ? '+' : ''}{Math.round(factor.score * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
