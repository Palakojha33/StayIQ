import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  User, 
  Gift, 
  Mail, 
  Building, 
  Star,
  RefreshCw
} from 'lucide-react';
import { StayIQAPI } from '../lib/api';

export default function Recovery() {
  const [queue, setQueue] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [followUpRating, setFollowUpRating] = useState(5);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  // Fetch Open Priority Queue
  const fetchQueue = async () => {
    setLoadingQueue(true);
    setError(null);
    try {
      const response = await StayIQAPI.getRecoveryQueue();
      setQueue(response);
      // Auto-select first item if exists and none selected
      if (response.length > 0 && !selectedComplaint) {
        handleSelectComplaint(response[0]);
      }
    } catch (err) {
      setError("Failed to fetch Priority Queue. Please check backend connection.");
    } finally {
      setLoadingQueue(false);
    }
  };

  // Fetch AI Draft recovery actions
  const handleSelectComplaint = async (complaint) => {
    setSelectedComplaint(complaint);
    setLoadingDraft(true);
    setSuccessMsg(null);
    try {
      const response = await StayIQAPI.getRecoveryDraft({ complaint_id: complaint.complaint_id });
      setDraftData(response);
    } catch (err) {
      console.error("Failed to load recovery actions", err);
    } finally {
      setLoadingDraft(false);
    }
  };

  // Resolve complaint and close loop
  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setResolving(true);
    setSuccessMsg(null);

    try {
      const response = await StayIQAPI.resolveComplaint({
        complaint_id: selectedComplaint.complaint_id,
        follow_up_rating: followUpRating
      });

      setSuccessMsg(response.message);
      setSelectedComplaint(null);
      setDraftData(null);
      // Re-fetch queue to update items
      await fetchQueue();
    } catch (err) {
      setError("Failed to log complaint resolution outcome.");
    } finally {
      setResolving(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div class="space-y-8 animate-pulse-slow">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-brand-accent" />
          Guest Recovery Copilot
        </h1>
        <p class="text-gray-400 mt-1 text-sm font-medium">
          Real-time priority queueing, aspect-alert routing, and dynamic compensation optimization.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Priority Queue Table */}
        <div class="glass-card p-6 rounded-2xl border border-brand-border/20 lg:col-span-2 space-y-4">
          <div class="flex justify-between items-center border-b border-brand-border/40 pb-3">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-secondary" />
              Priority Open Complaints ({queue.length})
            </h2>
            <button 
              onClick={fetchQueue}
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loadingQueue ? (
            <div class="flex flex-col items-center justify-center py-20 gap-3">
              <div class="w-10 h-10 border-4 border-t-brand-secondary border-brand-primary/20 rounded-full animate-spin"></div>
              <p class="text-xs text-gray-400">Sorting complaints by risk index...</p>
            </div>
          ) : queue.length === 0 ? (
            <div class="flex flex-col items-center text-center justify-center py-20 text-slate-500 gap-3">
              <CheckCircle className="w-12 h-12 text-brand-success opacity-80" />
              <div>
                <p class="text-sm font-semibold text-slate-300">All Clear!</p>
                <p class="text-xs text-slate-500 mt-1">There are no open complaints in the priority queue.</p>
              </div>
            </div>
          ) : (
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="text-slate-400 uppercase tracking-widest text-[9px] border-b border-brand-border/40 pb-2">
                    <th class="py-3 px-2">Guest</th>
                    <th class="py-3 px-2">Complaint Issue</th>
                    <th class="py-3 px-2 text-center">Risk Score</th>
                    <th class="py-3 px-2">Aspect</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/10">
                  {queue.map((item) => {
                    const isSelected = selectedComplaint?.complaint_id === item.complaint_id;
                    return (
                      <tr 
                        key={item.complaint_id}
                        onClick={() => handleSelectComplaint(item)}
                        class={`cursor-pointer transition-colors duration-200 ${
                          isSelected 
                            ? 'bg-brand-primary/10 border-l-2 border-brand-accent/70' 
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td class="py-4 px-2 font-bold text-slate-200">
                          <div class="flex flex-col">
                            <span>{item.guest_name}</span>
                            <span class="text-[9px] font-semibold text-brand-secondary">{item.loyalty_tier}</span>
                          </div>
                        </td>
                        <td class="py-4 px-2 max-w-xs truncate text-slate-400">
                          {item.review_text}
                        </td>
                        <td class="py-4 px-2 text-center">
                          <span class={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            item.risk_band === 'Critical' 
                              ? 'text-brand-danger bg-brand-danger/15 border border-brand-danger/30 animate-pulse'
                              : item.risk_band === 'High' 
                              ? 'text-brand-warning bg-brand-warning/15 border border-brand-warning/30'
                              : item.risk_band === 'Medium' 
                              ? 'text-brand-primary bg-brand-primary/15 border border-brand-primary/30'
                              : 'text-brand-success bg-brand-success/15 border border-brand-success/30'
                          }`}>
                            {item.risk_band} ({Math.round(item.escalation_risk_score)}%)
                          </span>
                        </td>
                        <td class="py-4 px-2">
                          <span class="text-[9px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-brand-border/20">
                            {item.aspect}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: AI Detail / Action Panel */}
        <div class="glass-card p-6 rounded-2xl border border-brand-border/20 space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-brand-border/40 pb-3 flex items-center gap-2">
            <Mail className="w-4.5 h-4.5 text-brand-accent" />
            Recovery Actions Console
          </h2>

          {successMsg && (
            <div class="bg-brand-success/10 border border-brand-success/30 p-4 rounded-xl text-xs text-brand-success flex items-start gap-2">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}

          {!selectedComplaint && !successMsg && (
            <div class="flex flex-col items-center text-center justify-center py-24 text-slate-500 gap-3">
              <ShieldAlert className="w-12 h-12 opacity-35 text-brand-accent" />
              <div>
                <p class="text-sm font-semibold text-slate-400">Select a Complaint</p>
                <p class="text-xs text-slate-500 mt-1">Select an open review from the priority queue to view AI-drafted responses, suggested gifts, and alert routing.</p>
              </div>
            </div>
          )}

          {selectedComplaint && (
            <div class="space-y-5">
              
              {/* Review Text Display */}
              <div class="bg-slate-900/60 p-3.5 rounded-xl border border-brand-border/20 text-xs text-slate-400">
                <span class="text-[9px] uppercase text-brand-secondary font-bold block mb-1">Guest Comment</span>
                <p class="italic">"{selectedComplaint.review_text}"</p>
              </div>

              {loadingDraft ? (
                <div class="flex flex-col items-center justify-center py-12 gap-2.5">
                  <div class="w-8 h-8 border-3 border-t-brand-accent border-brand-primary/20 rounded-full animate-spin"></div>
                  <p class="text-[10px] text-gray-500">Drafting apology & querying compensation...</p>
                </div>
              ) : draftData ? (
                <div class="space-y-4">
                  
                  {/* Alert Routing */}
                  <div class="bg-slate-900/60 p-3.5 rounded-xl border border-brand-border/20 text-xs flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-pink-500/10 text-brand-accent">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <span class="text-[9px] text-slate-500 uppercase tracking-widest block font-semibold">Incident Alert Router</span>
                      <p class="font-bold text-slate-200 mt-0.5">{draftData.assigned_department}</p>
                    </div>
                  </div>

                  {/* Compensation Suggested */}
                  <div class="bg-slate-900/60 p-3.5 rounded-xl border border-brand-border/20 text-xs flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-emerald-500/10 text-brand-success">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <span class="text-[9px] text-slate-500 uppercase tracking-widest block font-semibold">Suggested Compensation</span>
                      <p class="font-bold text-brand-success mt-0.5">{draftData.suggested_compensation}</p>
                    </div>
                  </div>

                  {/* Draft Message */}
                  <div class="flex flex-col gap-2">
                    <label class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-brand-primary" /> AI Recovery Message Draft
                    </label>
                    <textarea 
                      rows="6"
                      value={draftData.draft_apology}
                      onChange={(e) => setDraftData(prev => ({ ...prev, draft_apology: e.target.value }))}
                      class="glass-input p-3.5 rounded-xl text-[11px] text-slate-300 resize-none leading-relaxed"
                    ></textarea>
                  </div>

                  {/* Resolution outcomes logger */}
                  <form onSubmit={handleResolve} class="border-t border-brand-border/30 pt-4 space-y-4">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-semibold text-slate-300">Follow-up Guest Rating</span>
                      <select 
                        value={followUpRating}
                        onChange={(e) => setFollowUpRating(parseInt(e.target.value))}
                        class="bg-brand-dark border border-brand-border/40 text-xs px-2.5 py-1.5 rounded-lg text-white font-bold"
                      >
                        <option value="5">5 Stars (Excellent Recovery)</option>
                        <option value="4">4 Stars (Good Recovery)</option>
                        <option value="3">3 Stars (Moderate)</option>
                        <option value="2">2 Stars (Poor Resolution)</option>
                        <option value="1">1 Star (Failed Recovery)</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      disabled={resolving}
                      class="w-full bg-gradient-to-r from-brand-accent to-brand-primary text-white font-bold py-3 px-4 rounded-xl hover:shadow-glow-primary transition-all duration-300 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                    >
                      {resolving ? 'Logging outcome...' : 'Send Draft & Mark Resolved'}
                    </button>
                  </form>

                </div>
              ) : null}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
