import React, { useState } from 'react';
import { MessageSquare, RefreshCw, ThumbsUp, ThumbsDown, CheckSquare, FileText, Sparkles } from 'lucide-react';
import { StayIQAPI } from '../lib/api';

const SAMPLE_REVIEWS = [
  {
    label: "Positive Experience",
    text: "Loved our stay! The staff was incredibly welcoming, receptionist was so polite. The room was spotless and clean, sheets were fresh. Location is close to the city center and walk distance to the metro. Great value for money!"
  },
  {
    label: "Negative Experience",
    text: "Terrible experience. The bathroom shower was dirty and smelled bad. The service at reception was extremely slow and the clerk was rude. Breakfast food was cold and pricing is overpriced for what they offer."
  },
  {
    label: "Mixed Reviews",
    text: "Nice location close to the beach and nice views. However, the room sheets were dusty and the towels smelled funny. The dinner buffet was okay but drinks are very expensive."
  }
];

export default function Reviews() {
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await StayIQAPI.analyzeReview({ review_text: reviewText });
      setResult(response);
    } catch (err) {
      setError("Failed to analyze review text. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (text) => {
    setReviewText(text);
  };

  return (
    <div class="space-y-8 animate-pulse-slow">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-brand-primary" />
          Review Sentiment & Aspect Analysis
        </h1>
        <p class="text-gray-400 mt-1 text-sm font-medium">
          NLP Aspect Extractor identifies sentiment regarding Cleanliness, Staff, Food, Location, and Value.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Input Text Panel */}
        <div class="lg:col-span-2 space-y-6">
          <form onSubmit={handleAnalyze} class="glass-card p-6 rounded-2xl border border-brand-border/20 space-y-4">
            <div class="flex justify-between items-center border-b border-brand-border/40 pb-3">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-secondary" />
                Guest Feedback Input
              </h2>
              <button 
                type="button" 
                onClick={() => setReviewText("")}
                class="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors duration-200"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            <div class="flex flex-col gap-2">
              <textarea 
                rows="6"
                placeholder="Paste Guest Review text here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                class="glass-input p-4 rounded-xl text-sm text-white resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading || !reviewText.trim()}
              class="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-glow-primary transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Running DistilBERT Pipeline...' : 'Run NLP Sentiment Analysis'}
            </button>
          </form>

          {/* Preset Samples */}
          <div class="space-y-3">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Or load a demo review:</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_REVIEWS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleClick(sample.text)}
                  class="glass-card p-4 rounded-xl border border-brand-border/20 text-left hover:border-brand-primary/50 transition-all duration-200 group flex flex-col justify-between h-28"
                >
                  <span class="text-xs font-bold text-slate-300 group-hover:text-brand-secondary transition-colors duration-200">
                    {sample.label}
                  </span>
                  <p class="text-[10px] text-slate-500 line-clamp-3 mt-1 leading-relaxed">
                    {sample.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div class="glass-card p-6 rounded-2xl border border-brand-border/20 space-y-6">
          <h2 class="text-lg font-bold text-white">Sentiment Output</h2>
          
          {loading && (
            <div class="flex flex-col items-center justify-center py-20 gap-3">
              <div class="w-12 h-12 border-4 border-t-brand-secondary border-brand-primary/20 rounded-full animate-spin"></div>
              <p class="text-xs text-gray-400 font-medium">Extracting aspects via token matching...</p>
            </div>
          )}

          {!loading && !result && !error && (
            <div class="flex flex-col items-center text-center justify-center py-20 px-4 text-slate-500 gap-3">
              <MessageSquare className="w-12 h-12 opacity-40 text-brand-primary" />
              <div>
                <p class="text-sm font-semibold text-slate-400">Waiting for Text</p>
                <p class="text-xs text-slate-500 mt-1">Paste a review text or click one of the preset samples above to see the sentiment extraction.</p>
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
              
              {/* Overall Sentiment Indicator */}
              <div class="bg-slate-900/60 p-4 rounded-2xl border border-brand-border/30 flex items-center justify-between">
                <div>
                  <span class="text-xs text-slate-400 uppercase tracking-widest text-[9px]">Overall Review Sentiment</span>
                  <div class="text-xl font-extrabold text-white mt-0.5 capitalize flex items-center gap-1.5">
                    {result.sentiment === 'positive' ? (
                      <>
                        <ThumbsUp className="w-5 h-5 text-brand-success" />
                        <span class="text-brand-success">Positive</span>
                      </>
                    ) : result.sentiment === 'negative' ? (
                      <>
                        <ThumbsDown className="w-5 h-5 text-brand-danger" />
                        <span class="text-brand-danger">Negative</span>
                      </>
                    ) : (
                      <span class="text-brand-warning">Neutral</span>
                    )}
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs text-slate-400 uppercase tracking-widest text-[9px]">Confidence</span>
                  <p class="text-lg font-bold text-white mt-0.5">{Math.round(result.sentiment_score * 100)}%</p>
                </div>
              </div>

              {/* Aspect List Breakdown */}
              <div class="space-y-4 pt-4 border-t border-brand-border/40">
                <div class="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-secondary" />
                  <h3 class="text-sm font-bold text-slate-200">Extracted Aspects</h3>
                </div>

                <div class="space-y-3">
                  {result.aspects.map((asp, idx) => (
                    <div key={idx} class="bg-brand-darkest/40 p-4 rounded-xl border border-brand-border/20 space-y-2">
                      <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-slate-200 capitalize">{asp.aspect}</span>
                        <div class="flex items-center gap-1.5">
                          <span class={`text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold ${
                            asp.sentiment === 'positive' 
                              ? 'text-brand-success bg-brand-success/15'
                              : asp.sentiment === 'negative' 
                              ? 'text-brand-danger bg-brand-danger/15'
                              : 'text-brand-warning bg-brand-warning/15'
                          }`}>
                            {asp.sentiment} ({Math.round(asp.confidence * 100)}%)
                          </span>
                        </div>
                      </div>
                      
                      {/* Text Snippets */}
                      {asp.snippets && asp.snippets.length > 0 && (
                        <div class="border-l-2 border-brand-primary/40 pl-2.5 py-0.5">
                          {asp.snippets.map((snip, sIdx) => (
                            <p key={sIdx} class="text-[10px] italic text-slate-400 leading-relaxed">
                              "{snip}"
                            </p>
                          ))}
                        </div>
                      )}
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
