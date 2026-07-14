import React, { useState, useEffect } from 'react';
import { 
  CalendarX, 
  MessageSquare, 
  Hotel, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Star,
  ShieldAlert
} from 'lucide-react';
import { StayIQAPI } from '../lib/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const chartData = [
  { day: 'Mon', Occupancy: 65, RecommendedRate: 110, CompetitorRate: 115 },
  { day: 'Tue', Occupancy: 70, RecommendedRate: 118, CompetitorRate: 115 },
  { day: 'Wed', Occupancy: 75, RecommendedRate: 125, CompetitorRate: 120 },
  { day: 'Thu', Occupancy: 82, RecommendedRate: 138, CompetitorRate: 125 },
  { day: 'Fri', Occupancy: 90, RecommendedRate: 155, CompetitorRate: 130 },
  { day: 'Sat', Occupancy: 95, RecommendedRate: 165, CompetitorRate: 135 },
  { day: 'Sun', Occupancy: 85, RecommendedRate: 140, CompetitorRate: 128 },
];

const sentimentBreakdown = [
  { aspect: 'Cleanliness', score: 92, status: 'Outstanding' },
  { aspect: 'Staff', score: 88, status: 'Excellent' },
  { aspect: 'Location', score: 85, status: 'Strong' },
  { aspect: 'Food', score: 72, status: 'Moderate' },
  { aspect: 'Value', score: 68, status: 'Attention Needed' },
];

export default function Dashboard({ setCurrentPage }) {
  const [criticalComplaints, setCriticalComplaints] = useState(2);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const queue = await StayIQAPI.getRecoveryQueue();
        const criticalCount = queue.filter(c => c.risk_band === 'Critical' || c.risk_band === 'High').length;
        setCriticalComplaints(criticalCount);
      } catch (err) {
        console.warn("Failed to load recovery stats for dashboard", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div class="space-y-8 animate-pulse-slow">
      {/* Welcome Banner */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Hospitality Control Center
          </h1>
          <p class="text-gray-400 mt-1 text-sm font-medium">
            Real-time machine learning analytics and operations optimizer.
          </p>
        </div>
        <div class="text-xs text-gray-400 glass-card px-4 py-2 rounded-lg flex items-center gap-2 border border-brand-border/40">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-brand-success animate-ping"></span>
          All ML Modules Operational
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        
        {/* Card 1: Cancellations */}
        <div class="glass-card p-6 rounded-2xl glow-indigo-hover transition-all duration-300 border border-brand-border/20 group relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="p-3 rounded-xl bg-indigo-500/10 text-brand-primary">
              <CalendarX className="w-6 h-6" />
            </div>
            <span class="flex items-center text-xs text-brand-success font-semibold bg-brand-success/15 px-2 py-0.5 rounded">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> -2.4%
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Avg Cancellation Risk</h3>
            <p class="text-3xl font-bold mt-1 text-white">24.3%</p>
            <p class="text-xs text-gray-500 mt-2">Predicted from 148 active bookings</p>
          </div>
          <button 
            onClick={() => setCurrentPage('cancellations')}
            class="absolute bottom-4 right-4 text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center text-xs font-semibold"
          >
            Predict <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Card 2: Reviews Sentiment */}
        <div class="glass-card p-6 rounded-2xl glow-indigo-hover transition-all duration-300 border border-brand-border/20 group relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="p-3 rounded-xl bg-pink-500/10 text-brand-accent">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span class="flex items-center text-xs text-brand-success font-semibold bg-brand-success/15 px-2 py-0.5 rounded">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +4.1%
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Guest Sentiment index</h3>
            <p class="text-3xl font-bold mt-1 text-white">84.8<span class="text-sm text-gray-500">/100</span></p>
            <p class="text-xs text-gray-500 mt-2">Cleanliness & Staff driving positive trends</p>
          </div>
          <button 
            onClick={() => setCurrentPage('reviews')}
            class="absolute bottom-4 right-4 text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center text-xs font-semibold"
          >
            Analyze <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Card 3: Dynamic Pricing */}
        <div class="glass-card p-6 rounded-2xl glow-indigo-hover transition-all duration-300 border border-brand-border/20 group relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="p-3 rounded-xl bg-emerald-500/10 text-brand-success">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span class="flex items-center text-xs text-brand-success font-semibold bg-brand-success/15 px-2 py-0.5 rounded">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2%
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Revenue Yield Uplift</h3>
            <p class="text-3xl font-bold mt-1 text-white">+$18.40<span class="text-xs text-gray-500">/room</span></p>
            <p class="text-xs text-gray-500 mt-2">Dynamic prices accepted by market</p>
          </div>
          <button 
            onClick={() => setCurrentPage('pricing')}
            class="absolute bottom-4 right-4 text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center text-xs font-semibold"
          >
            Suggest <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Card 4: Recommendations */}
        <div class="glass-card p-6 rounded-2xl glow-indigo-hover transition-all duration-300 border border-brand-border/20 group relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="p-3 rounded-xl bg-cyan-500/10 text-brand-secondary">
              <Hotel className="w-6 h-6" />
            </div>
            <span class="flex items-center text-xs text-brand-success font-semibold bg-brand-success/15 px-2 py-0.5 rounded text-[10px]">
              Active Profile
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Recommender Matches</h3>
            <p class="text-3xl font-bold mt-1 text-white">76.5%</p>
            <p class="text-xs text-gray-500 mt-2">Guest profile preference alignment rate</p>
          </div>
          <button 
            onClick={() => setCurrentPage('recommendations')}
            class="absolute bottom-4 right-4 text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center text-xs font-semibold"
          >
            Match <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Card 5: Guest Recovery Copilot */}
        <div class="glass-card p-6 rounded-2xl glow-indigo-hover transition-all duration-300 border border-brand-border/20 group relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div class="p-3 rounded-xl bg-pink-500/10 text-brand-accent">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span class={`flex items-center text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
              criticalComplaints > 0 
                ? 'text-brand-danger bg-brand-danger/15 border border-brand-danger/30 animate-pulse'
                : 'text-brand-success bg-brand-success/15 border border-brand-success/30'
            }`}>
              {criticalComplaints > 0 ? 'Requires Action' : 'All Resolved'}
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Escalation Warnings</h3>
            <p class="text-3xl font-bold mt-1 text-white">
              {criticalComplaints} <span class="text-xs text-gray-500 font-normal">critical</span>
            </p>
            <p class="text-xs text-gray-500 mt-2">Open complaints needing recovery draft</p>
          </div>
          <button 
            onClick={() => setCurrentPage('recovery')}
            class="absolute bottom-4 right-4 text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center text-xs font-semibold"
          >
            Open Copilot <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

      </div>

      {/* Analytics Charts & Details */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Price & Occupancy Trend Chart */}
        <div class="glass-card p-6 rounded-2xl border border-brand-border/20 lg:col-span-2 space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold text-white">Occupancy & Suggested Pricing Trend</h2>
              <p class="text-xs text-gray-400">7-day forecast comparing occupancy rates against suggested prices</p>
            </div>
            <div class="flex gap-4 text-xs">
              <span class="flex items-center gap-1.5 text-brand-secondary font-medium">
                <span class="inline-block w-2.5 h-2.5 rounded bg-brand-secondary"></span> Recommended Rate
              </span>
              <span class="flex items-center gap-1.5 text-brand-primary font-medium">
                <span class="inline-block w-2.5 h-2.5 rounded bg-brand-primary"></span> Occupancy (%)
              </span>
            </div>
          </div>

          <div class="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="RecommendedRate" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
                <Area type="monotone" dataKey="Occupancy" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorOcc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aspect Performance Breakdown */}
        <div class="glass-card p-6 rounded-2xl border border-brand-border/20 space-y-6">
          <div>
            <h2 class="text-lg font-bold text-white font-sans">Aspect Sentiment Index</h2>
            <p class="text-xs text-gray-400">NLP aspect extraction performance metrics</p>
          </div>

          <div class="space-y-4">
            {sentimentBreakdown.map((item, idx) => (
              <div key={idx} class="space-y-2">
                <div class="flex justify-between items-center text-xs font-semibold">
                  <span class="text-slate-300">{item.aspect}</span>
                  <span class={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                    item.score >= 85 
                      ? 'text-brand-success bg-brand-success/10'
                      : item.score >= 70
                      ? 'text-brand-warning bg-brand-warning/10'
                      : 'text-brand-danger bg-brand-danger/10'
                  }`}>
                    {item.status} ({item.score}%)
                  </span>
                </div>
                {/* Visual score bar */}
                <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-brand-border/30">
                  <div 
                    class={`h-full rounded-full bg-gradient-to-r ${
                      item.score >= 85 
                        ? 'from-emerald-500 to-teal-400' 
                        : item.score >= 70 
                        ? 'from-amber-500 to-yellow-400' 
                        : 'from-rose-500 to-red-400'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div class="bg-brand-darkest/50 p-4 rounded-xl border border-brand-border/40 text-xs text-slate-400 flex items-start gap-2.5 leading-relaxed">
            <Star className="w-5 h-5 text-brand-warning shrink-0" />
            <div>
              <span class="font-bold text-slate-200">Aspect Insight:</span> Focus on food quality adjustments. Aspect scores for 'Food' and 'Value' indicate menu pricing feedback is impacting ratings.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
