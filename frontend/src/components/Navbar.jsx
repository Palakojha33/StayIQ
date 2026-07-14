import React from 'react';
import { 
  BrainCircuit, 
  LayoutDashboard, 
  CalendarX, 
  MessageSquare, 
  Hotel, 
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'cancellations', name: 'Cancellations', icon: CalendarX },
    { id: 'reviews', name: 'Sentiment & Aspects', icon: MessageSquare },
    { id: 'recommendations', name: 'Recommendations', icon: Hotel },
    { id: 'pricing', name: 'Dynamic Pricing', icon: TrendingUp },
    { id: 'recovery', name: 'Recovery Copilot', icon: ShieldAlert },
  ];

  return (
    <nav class="glass-card sticky top-0 z-50 px-6 py-4 border-b border-brand-border/40 backdrop-blur-md">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo / Brand */}
        <div class="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
          <div class="bg-gradient-to-tr from-brand-primary to-brand-secondary p-2 rounded-xl shadow-glow-primary">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
              StayIQ
            </span>
            <span class="text-[9px] font-medium uppercase tracking-widest text-brand-secondary">
              Hospitality Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div class="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/25 border border-brand-primary/40 text-white shadow-glow-primary'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-secondary' : 'text-gray-400'}`} />
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Small screen mobile dropdown button placeholder */}
        <div class="md:hidden flex items-center">
          <select 
            value={currentPage} 
            onChange={(e) => setCurrentPage(e.target.value)}
            class="bg-brand-dark border border-brand-border/40 text-xs px-3 py-2 rounded-lg text-white"
          >
            {navItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

      </div>
    </nav>
  );
}
